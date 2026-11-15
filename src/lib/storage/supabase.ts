import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

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
    // If Supabase keys are placeholders in development, provide secure internal streaming token
    const isPlaceholder = !process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY.includes("placeholder");
    if (isPlaceholder) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const devToken = Buffer.from(JSON.stringify({ path: storagePath, exp: Date.now() + expiresInSeconds * 1000 })).toString("base64url");
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
      console.error("Supabase Storage signed URL error:", error.message);
      return { signedUrl: null, error: error.message };
    }

    return { signedUrl: data.signedUrl, error: null };
  } catch (err: any) {
    console.error("Error creating signed download URL:", err);
    return { signedUrl: null, error: err.message || "Failed to generate signed download URL" };
  }
}

/**
 * Upload a private file (STL/ZIP) to Supabase Storage
 */
export async function uploadPrivateFile(
  fileBuffer: Buffer,
  filePath: string,
  contentType: string
): Promise<{ path: string | null; error: string | null }> {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(PRIVATE_BUCKET)
      .upload(filePath, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      return { path: null, error: error.message };
    }

    return { path: data.path, error: null };
  } catch (err: any) {
    return { path: null, error: err.message || "Upload failed" };
  }
}

/**
 * Upload a public preview image to Supabase Storage
 */
export async function uploadPublicImage(
  fileBuffer: Buffer,
  filePath: string,
  contentType: string
): Promise<{ publicUrl: string | null; error: string | null }> {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(PUBLIC_BUCKET)
      .upload(filePath, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      return { publicUrl: null, error: error.message };
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from(PUBLIC_BUCKET)
      .getPublicUrl(data.path);

    return { publicUrl: publicUrlData.publicUrl, error: null };
  } catch (err: any) {
    return { publicUrl: null, error: err.message || "Image upload failed" };
  }
}
