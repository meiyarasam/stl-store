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
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", signedUrl, true);
      xhr.setRequestHeader("Content-Type", contentType || file.type || "application/octet-stream");
      xhr.setRequestHeader("x-upsert", "true");

      if (onProgress) {
        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable) {
            const percent = Math.min(99, Math.round((evt.loaded / evt.total) * 100));
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          if (onProgress) onProgress(100);
          resolve();
        } else {
          reject(
            new Error(
              `Direct storage upload failed with HTTP status ${xhr.status}: ${xhr.statusText || "Upload rejected by storage"}`
            )
          );
        }
      };

      xhr.onerror = () => {
        reject(new Error("Network error occurred during direct storage upload. Please check connection."));
      };

      xhr.ontimeout = () => {
        reject(new Error("Storage upload timed out. Please retry."));
      };

      xhr.send(file);
    });

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
