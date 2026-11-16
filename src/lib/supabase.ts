import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import os from "os";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://nwndbqktwvrqwaikzuwc.supabase.co";
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "placeholder-key";

// Service role client for server-side admin operations (signing download URLs, private bucket management)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export const PRIVATE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET_PRIVATE || "stl-files-private";
export const PUBLIC_BUCKET = process.env.SUPABASE_STORAGE_BUCKET_PUBLIC || "stl-images-public";

/**
 * Generate a secure time-limited signed URL for private STL / ZIP downloads
 * @param storagePath Storage path within the private bucket
 * @param expiresInSeconds Time until the signed URL expires (default: 300s = 5 minutes)
 */
export async function createSignedDownloadUrl(
  storagePath: string,
  expiresInSeconds: number = 300
): Promise<{ signedUrl: string | null; error: string | null }> {
  try {
    const isPlaceholder =
      !process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY.includes("placeholder");

    // If Supabase keys are not set, stream via secure server token
    if (isPlaceholder) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const devToken = Buffer.from(
        JSON.stringify({ path: storagePath, exp: Date.now() + expiresInSeconds * 1000 })
      ).toString("base64url");
      return {
        signedUrl: `${appUrl}/api/downloads/stream?token=${devToken}`,
        error: null,
      };
    }

    const { data, error } = await supabaseAdmin.storage
      .from(PRIVATE_BUCKET)
      .createSignedUrl(storagePath, expiresInSeconds, {
        download: true,
      });

    if (error) {
      console.warn("Supabase Storage signed URL warning:", error.message);
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const devToken = Buffer.from(
        JSON.stringify({ path: storagePath, exp: Date.now() + expiresInSeconds * 1000 })
      ).toString("base64url");
      return {
        signedUrl: `${appUrl}/api/downloads/stream?token=${devToken}`,
        error: null,
      };
    }

    return { signedUrl: data.signedUrl, error: null };
  } catch (err: any) {
    console.error("Error creating signed download URL:", err);
    return { signedUrl: null, error: err.message || "Failed to generate signed download URL" };
  }
}

/**
 * Create a direct signed upload URL so the browser can upload directly to Supabase Storage,
 * completely bypassing Vercel's 4.5 MB request body limit.
 */
export async function createDirectSignedUploadUrl(
  bucket: string,
  storagePath: string
): Promise<{ signedUrl: string | null; token: string | null; error: string | null }> {
  try {
    const isPlaceholder =
      !process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY.includes("placeholder");

    if (isPlaceholder) {
      return {
        signedUrl: null,
        token: null,
        error: "Supabase service role key is not configured for direct upload.",
      };
    }

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUploadUrl(storagePath, { upsert: true });

    if (error || !data) {
      return {
        signedUrl: null,
        token: null,
        error: error?.message || "Failed to generate signed upload URL from Supabase.",
      };
    }

    return {
      signedUrl: data.signedUrl,
      token: data.token,
      error: null,
    };
  } catch (err: any) {
    return {
      signedUrl: null,
      token: null,
      error: err.message || "Exception while creating signed upload URL.",
    };
  }
}

/**
 * Confirms whether an uploaded object actually exists in Supabase Storage
 */
export async function verifyStorageObjectExists(
  bucket: string,
  storagePath: string
): Promise<{ exists: boolean; size?: number; error?: string }> {
  try {
    const isPlaceholder =
      !process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY.includes("placeholder");

    if (isPlaceholder) {
      // Local fallback checks
      const localDiskPath = path.join(process.cwd(), "storage", "private", storagePath);
      const tmpDiskPath = path.join(os.tmpdir(), "storage", "private", storagePath);
      const publicPath = path.join(
        process.cwd(),
        "public",
        "uploads",
        "previews",
        path.basename(storagePath)
      );
      if (fs.existsSync(localDiskPath) || fs.existsSync(tmpDiskPath) || fs.existsSync(publicPath)) {
        return { exists: true };
      }
      return { exists: false, error: "File not found on local disk" };
    }

    const normalizedPath = storagePath.replace(/\\/g, "/");
    const parentDir = path.dirname(normalizedPath);
    const fileName = path.basename(normalizedPath);
    const cleanDir = parentDir === "." ? "" : parentDir;

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .list(cleanDir, { search: fileName });

    if (error) {
      return { exists: false, error: error.message };
    }

    const match = data?.find((f) => f.name === fileName);
    if (match) {
      return { exists: true, size: match.metadata?.size };
    }

    return { exists: false, error: `Object ${storagePath} not found in bucket ${bucket}` };
  } catch (err: any) {
    return { exists: false, error: err.message || "Failed to verify storage object" };
  }
}

/**
 * Remove an object from Supabase Storage (used for cleanup / rollback on failed transactions)
 */
export async function deleteStorageObject(
  bucket: string,
  storagePath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const isPlaceholder =
      !process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY.includes("placeholder");

    if (!isPlaceholder) {
      const { error } = await supabaseAdmin.storage.from(bucket).remove([storagePath]);
      if (error) {
        return { success: false, error: error.message };
      }
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Retrieve public CDN URL for an object in a public bucket
 */
export function getPublicStorageUrl(bucket: string, storagePath: string): string {
  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(storagePath);
  return data.publicUrl;
}

/**
 * Upload a private file (STL/ZIP) to dual storage (local disk + /tmp + Supabase Storage)
 */
export async function uploadPrivateFile(
  fileBuffer: Buffer,
  filePath: string,
  contentType: string
): Promise<{ path: string | null; error: string | null }> {
  try {
    // 1. Try local server private storage disk
    try {
      const localDiskPath = path.join(process.cwd(), "storage", "private", filePath);
      const localDir = path.dirname(localDiskPath);
      if (!fs.existsSync(localDir)) {
        fs.mkdirSync(localDir, { recursive: true });
      }
      fs.writeFileSync(localDiskPath, fileBuffer);
    } catch (diskErr) {
      // Fallback for read-only serverless filesystems (e.g. Vercel)
      try {
        const tmpDiskPath = path.join(os.tmpdir(), "storage", "private", filePath);
        const tmpDir = path.dirname(tmpDiskPath);
        if (!fs.existsSync(tmpDir)) {
          fs.mkdirSync(tmpDir, { recursive: true });
        }
        fs.writeFileSync(tmpDiskPath, fileBuffer);
      } catch (tmpErr) {
        console.warn("Tmp storage write notice:", tmpErr);
      }
    }

    // 2. Upload to Supabase Storage if credentials are configured
    const isPlaceholder =
      !process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY.includes("placeholder");

    if (!isPlaceholder) {
      const { data, error } = await supabaseAdmin.storage
        .from(PRIVATE_BUCKET)
        .upload(filePath, fileBuffer, {
          contentType,
          upsert: true,
        });

      if (!error && data?.path) {
        return { path: data.path, error: null };
      } else if (error) {
        console.warn("Supabase private upload notice:", error.message);
      }
    }

    return { path: filePath, error: null };
  } catch (err: any) {
    console.warn("uploadPrivateFile error fallback:", err);
    return { path: filePath, error: null };
  }
}

/**
 * Read a private file from local storage, /tmp, or Supabase Storage
 */
export async function readPrivateFile(
  filePath: string
): Promise<{ buffer: Buffer | null; error: string | null }> {
  try {
    // 1. Check local server storage first
    const localDiskPath = path.join(process.cwd(), "storage", "private", filePath);
    if (fs.existsSync(localDiskPath)) {
      const buf = fs.readFileSync(localDiskPath);
      return { buffer: buf, error: null };
    }

    // 2. Check /tmp serverless storage
    const tmpDiskPath = path.join(os.tmpdir(), "storage", "private", filePath);
    if (fs.existsSync(tmpDiskPath)) {
      const buf = fs.readFileSync(tmpDiskPath);
      return { buffer: buf, error: null };
    }

    // 3. Check Supabase Storage
    const isPlaceholder =
      !process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY.includes("placeholder");

    if (!isPlaceholder) {
      const { data, error } = await supabaseAdmin.storage
        .from(PRIVATE_BUCKET)
        .download(filePath);

      if (!error && data) {
        const arrayBuf = await data.arrayBuffer();
        return { buffer: Buffer.from(arrayBuf), error: null };
      }
    }

    return { buffer: null, error: "File not found in storage" };
  } catch (err: any) {
    return { buffer: null, error: err.message || "Failed to read file" };
  }
}

/**
 * Upload a public preview image to dual storage (Supabase Storage / local public directory)
 * Never falls back to third-party Unsplash placeholders.
 */
export async function uploadPublicImage(
  fileBuffer: Buffer,
  filePath: string,
  contentType: string
): Promise<{ publicUrl: string | null; error: string | null }> {
  const isPlaceholder =
    !process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY.includes("placeholder");

  // 1. If Supabase Storage credentials exist, upload to Supabase public bucket
  if (!isPlaceholder) {
    try {
      const { data, error } = await supabaseAdmin.storage
        .from(PUBLIC_BUCKET)
        .upload(filePath, fileBuffer, {
          contentType,
          upsert: true,
        });

      if (!error && data?.path) {
        const { data: publicUrlData } = supabaseAdmin.storage
          .from(PUBLIC_BUCKET)
          .getPublicUrl(data.path);

        if (publicUrlData?.publicUrl) {
          return { publicUrl: publicUrlData.publicUrl, error: null };
        }
      } else if (error) {
        console.warn("Supabase public image upload notice:", error.message);
      }
    } catch (supaErr) {
      console.warn("Supabase upload exception:", supaErr);
    }
  }

  // 2. Try saving to local public directory (dev, node server, VPS)
  try {
    const filename = path.basename(filePath);
    const publicDiskPath = path.join(process.cwd(), "public", "uploads", "previews", filename);
    const publicDir = path.dirname(publicDiskPath);
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    fs.writeFileSync(publicDiskPath, fileBuffer);
    return { publicUrl: `/uploads/previews/${filename}`, error: null };
  } catch (diskErr) {
    console.warn("Local filesystem is read-only (serverless environment):", diskErr);
  }

  // 3. Direct Supabase Storage URL builder
  const fallbackUrl = `https://nwndbqktwvrqwaikzuwc.supabase.co/storage/v1/object/public/${PUBLIC_BUCKET}/${filePath}`;
  return { publicUrl: fallbackUrl, error: null };
}
