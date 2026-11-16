import { safeFetchJson } from "@/lib/api/safeFetch";

export interface UploadResult {
  storagePath: string;
  publicUrl?: string;
  fileName: string;
  fileSizeBytes: number;
  bucket: string;
}

export interface ClientUploadOptions {
  file: File;
  uploadType: "image" | "stl" | "zip";
  slug?: string;
  onProgress?: (percent: number) => void;
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 MB";
  const mb = bytes / (1024 * 1024);
  if (mb < 0.1) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${mb.toFixed(1)} MB`;
}

function parseStorageErrorMessage(
  responseText: string,
  status: number,
  fileSize: number,
  uploadType: string
): string {
  let detail = "";
  try {
    const json = JSON.parse(responseText);
    detail = json.message || json.error || json.msg || "";
  } catch {
    detail = responseText ? responseText.slice(0, 250) : "";
  }

  const lower = detail.toLowerCase();

  // Storage provider plan limit exceeded (e.g. Supabase Free Tier 50 MB limit)
  if (
    lower.includes("exceeded the maximum allowed size") ||
    lower.includes("payload too large") ||
    lower.includes("entity too large") ||
    lower.includes("exceeds the limit") ||
    lower.includes("file_size_limit")
  ) {
    if (uploadType === "zip") {
      return `The ZIP package (${formatBytes(
        fileSize
      )}) exceeds the storage provider's active plan limit (50 MB on Supabase Free Tier). To upload archives up to 250 MB, upgrade your Supabase project to Pro, or compress the package under 50 MB.`;
    }
    return `File size (${formatBytes(
      fileSize
    )}) exceeds the maximum allowed upload limit of the storage provider.`;
  }

  if (
    lower.includes("invalidjwt") ||
    lower.includes("invalid compact jws") ||
    lower.includes("jwt") ||
    lower.includes("token")
  ) {
    return "Upload authorization token expired or invalid. Please select the file again.";
  }

  if (detail) {
    return `Storage error (${status}): ${detail}`;
  }

  return `Direct storage upload failed with HTTP status ${status}: Upload rejected by storage.`;
}

/**
 * Low-level XMLHttpRequest runner with live progress tracking
 */
function performXhrUpload({
  url,
  method = "PUT",
  body,
  headers = {},
  onProgress,
}: {
  url: string;
  method?: string;
  body: XMLHttpRequestBodyInit;
  headers?: Record<string, string>;
  onProgress?: (percent: number) => void;
}): Promise<{ status: number; statusText: string; responseText: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);

    for (const [key, value] of Object.entries(headers)) {
      if (value) {
        xhr.setRequestHeader(key, value);
      }
    }

    if (onProgress) {
      xhr.upload.onprogress = (evt) => {
        if (evt.lengthComputable) {
          const percent = Math.min(99, Math.round((evt.loaded / evt.total) * 100));
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      resolve({
        status: xhr.status,
        statusText: xhr.statusText,
        responseText: xhr.responseText || "",
      });
    };

    xhr.onerror = () => {
      reject(new Error("Network connection error during file upload to storage."));
    };

    xhr.ontimeout = () => {
      reject(new Error("Storage upload timed out. Please retry."));
    };

    xhr.send(body);
  });
}

/**
 * Uploads large binary files directly to Supabase Storage using secure short-lived signed URLs.
 * Bypasses Vercel's 4.5 MB request-body limit entirely and reports real progress percentages.
 */
export async function uploadFileToStorage({
  file,
  uploadType,
  slug = "product",
  onProgress,
}: ClientUploadOptions): Promise<UploadResult> {
  // 1. Request signed upload URL from backend authorization route
  const signRes = await safeFetchJson<{
    mode: "direct" | "proxy";
    signedUrl?: string;
    token?: string;
    storagePath: string;
    bucket: string;
    publicUrl?: string;
    contentType: string;
  }>("/api/admin/storage/sign-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: file.name,
      fileSizeBytes: file.size,
      uploadType,
      slug,
    }),
  });

  if (!signRes.success || !signRes.data) {
    throw new Error(signRes.error || signRes.message || "Failed to authorize file upload.");
  }

  const { mode, signedUrl, storagePath, bucket, publicUrl, contentType } = signRes.data;

  // 2. Direct upload to Supabase Storage
  if (mode === "direct" && signedUrl) {
    if (uploadType === "zip") {
      // ZIP files: Attempt 1 with official Supabase Storage JS SDK format (FormData)
      const formData = new FormData();
      formData.append("cacheControl", "3600");
      formData.append("", file);

      let res = await performXhrUpload({
        url: signedUrl,
        method: "PUT",
        body: formData,
        headers: {
          "x-upsert": "true",
        },
        onProgress,
      });

      if (res.status >= 200 && res.status < 300) {
        if (onProgress) onProgress(100);
      } else {
        // If rejected because of provider file size limit, immediately throw descriptive error
        const isSizeError =
          res.responseText.toLowerCase().includes("exceeded the maximum allowed size") ||
          res.responseText.toLowerCase().includes("payload too large") ||
          res.responseText.toLowerCase().includes("entity too large");

        if (isSizeError) {
          throw new Error(
            parseStorageErrorMessage(res.responseText, res.status, file.size, uploadType)
          );
        }

        // Attempt 2: Universal binary stream with application/octet-stream
        res = await performXhrUpload({
          url: signedUrl,
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": "application/octet-stream",
            "x-upsert": "true",
          },
          onProgress,
        });

        if (res.status >= 200 && res.status < 300) {
          if (onProgress) onProgress(100);
        } else {
          throw new Error(
            parseStorageErrorMessage(res.responseText, res.status, file.size, uploadType)
          );
        }
      }
    } else {
      // For image and STL: Preserved original direct upload logic
      const res = await performXhrUpload({
        url: signedUrl,
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": contentType || file.type || "application/octet-stream",
          "x-upsert": "true",
        },
        onProgress,
      });

      if (res.status >= 200 && res.status < 300) {
        if (onProgress) onProgress(100);
      } else {
        throw new Error(
          parseStorageErrorMessage(res.responseText, res.status, file.size, uploadType)
        );
      }
    }

    return {
      storagePath,
      publicUrl,
      fileName: file.name,
      fileSizeBytes: file.size,
      bucket,
    };
  }

  // 3. Fallback to API route (development mode or proxy)
  return new Promise<UploadResult>((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", uploadType);
    formData.append("slug", slug);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/upload", true);

    if (onProgress) {
      xhr.upload.onprogress = (evt) => {
        if (evt.lengthComputable) {
          const percent = Math.min(99, Math.round((evt.loaded / evt.total) * 100));
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      try {
        if (xhr.status === 413) {
          return reject(
            new Error("File exceeds server limit (413 Request Entity Too Large).")
          );
        }

        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && data.success) {
          if (onProgress) onProgress(100);
          resolve({
            storagePath: data.storagePath || storagePath,
            publicUrl: data.url || publicUrl,
            fileName: file.name,
            fileSizeBytes: file.size,
            bucket,
          });
        } else {
          reject(new Error(data.error || "File upload failed"));
        }
      } catch (e: any) {
        reject(new Error(`Server error (${xhr.status}): Could not process upload.`));
      }
    };

    xhr.onerror = () => reject(new Error("Network connection error during file upload."));
    xhr.send(formData);
  });
}
