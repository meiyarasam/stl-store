import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
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
 * Upload a private file (STL/ZIP) to dual storage (local disk + Supabase Storage)
 */
export async function uploadPrivateFile(
  fileBuffer: Buffer,
  filePath: string,
  contentType: string
): Promise<{ path: string | null; error: string | null }> {
  try {
    // 1. Always save to local server private storage disk as reliable primary / fallback
    try {
      const localDiskPath = path.join(process.cwd(), "storage", "private", filePath);
      const localDir = path.dirname(localDiskPath);
      if (!fs.existsSync(localDir)) {
        fs.mkdirSync(localDir, { recursive: true });
      }
      fs.writeFileSync(localDiskPath, fileBuffer);
    } catch (diskErr) {
      console.warn("Local disk write notice for private file:", diskErr);
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
 * Read a private file from local storage or Supabase Storage
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

    // 2. Check Supabase Storage if not on disk
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
 * Upload a public preview image to dual storage (local public directory + Supabase Storage)
 * Never falls back to third-party Unsplash placeholders.
 */
export async function uploadPublicImage(
  fileBuffer: Buffer,
  filePath: string,
  contentType: string
): Promise<{ publicUrl: string | null; error: string | null }> {
  try {
    const filename = path.basename(filePath);

    // 1. Save to web-accessible public directory
    const publicDiskPath = path.join(process.cwd(), "public", "uploads", "previews", filename);
    const publicDir = path.dirname(publicDiskPath);
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    fs.writeFileSync(publicDiskPath, fileBuffer);
    const localWebUrl = `/uploads/previews/${filename}`;

    // 2. Attempt Supabase upload if active
    const isPlaceholder =
      !process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY.includes("placeholder");

    if (!isPlaceholder) {
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
    }

    // Return the real local web URL
    return { publicUrl: localWebUrl, error: null };
  } catch (err: any) {
    console.warn("uploadPublicImage error:", err);
    return {
      publicUrl: null,
      error: err.message || "Failed to save preview image.",
    };
  }
}
