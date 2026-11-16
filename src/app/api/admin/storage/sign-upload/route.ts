import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import {
  createDirectSignedUploadUrl,
  getPublicStorageUrl,
  PRIVATE_BUCKET,
  PUBLIC_BUCKET,
} from "@/lib/supabase";
import prisma from "@/lib/database/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate Administrator
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role?.toUpperCase();
    const userEmail = session?.user?.email?.toLowerCase().trim();
    const adminEmail = (
      process.env.ADMIN_DEFAULT_EMAIL || "admin@theprintfactory.com"
    )
      .toLowerCase()
      .trim();

    let isAuthorized = userRole === "ADMIN" || userEmail === adminEmail;
    if (!isAuthorized && userEmail) {
      const dbUser = await prisma.user
        .findUnique({ where: { email: userEmail } })
        .catch(() => null);
      if (dbUser?.role === "ADMIN") isAuthorized = true;
    }

    if (!isAuthorized && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        {
          success: false,
          message: "Upload authorization denied",
          error: "Administrator privileges required to initiate file storage uploads.",
        },
        { status: 403 }
      );
    }

    // 2. Parse and Validate Upload Metadata
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request payload",
          error: "Request body must be a valid JSON object.",
        },
        { status: 400 }
      );
    }

    const { fileName, fileSizeBytes, uploadType, slug } = body;

    if (!fileName || typeof fileName !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Validation Error",
          error: "fileName is required and must be a string.",
        },
        { status: 400 }
      );
    }

    const size = Number(fileSizeBytes) || 0;
    if (size <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation Error",
          error: "fileSizeBytes must be greater than 0.",
        },
        { status: 400 }
      );
    }

    const extension = fileName.split(".").pop()?.toLowerCase() || "";
    const cleanBaseName = fileName
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .toLowerCase()
      .slice(0, 50);

    const cleanSlug = (slug || "product")
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "-")
      .slice(0, 50);

    const timestamp = Date.now();
    const uniqueFileName = `${cleanBaseName}_${timestamp}.${extension}`;

    let bucket = PUBLIC_BUCKET;
    let storagePath = `previews/${cleanSlug}/${uniqueFileName}`;
    let contentType = "application/octet-stream";

    // 3. Strict Server-Side Type & Size Verification
    if (uploadType === "image") {
      const allowedImageExts = ["jpg", "jpeg", "png", "webp"];
      if (!allowedImageExts.includes(extension)) {
        return NextResponse.json(
          {
            success: false,
            message: "Unsupported file type",
            error: `Image format not supported. Allowed formats: ${allowedImageExts.join(", ")}`,
          },
          { status: 400 }
        );
      }

      const maxImageBytes = 15 * 1024 * 1024; // 15 MB
      if (size > maxImageBytes) {
        return NextResponse.json(
          {
            success: false,
            message: "File limit exceeded",
            error: `Image size exceeds maximum limit of 15 MB (uploaded: ${(size / (1024 * 1024)).toFixed(1)} MB).`,
          },
          { status: 400 }
        );
      }

      bucket = PUBLIC_BUCKET;
      storagePath = `previews/${cleanSlug}/${uniqueFileName}`;
      contentType = extension === "png" ? "image/png" : extension === "webp" ? "image/webp" : "image/jpeg";
    } else if (uploadType === "stl") {
      const allowedStlExts = ["stl", "obj", "3mf"];
      if (!allowedStlExts.includes(extension)) {
        return NextResponse.json(
          {
            success: false,
            message: "Unsupported file type",
            error: `3D model format not supported. Allowed formats: ${allowedStlExts.join(", ")}`,
          },
          { status: 400 }
        );
      }

      const maxStlBytes = 150 * 1024 * 1024; // 150 MB
      if (size > maxStlBytes) {
        return NextResponse.json(
          {
            success: false,
            message: "File limit exceeded",
            error: `STL model file exceeds maximum limit of 150 MB (uploaded: ${(size / (1024 * 1024)).toFixed(1)} MB).`,
          },
          { status: 400 }
        );
      }

      bucket = PRIVATE_BUCKET;
      storagePath = `products/${cleanSlug}/${uniqueFileName}`;
      contentType = extension === "3mf" ? "model/3mf" : extension === "obj" ? "model/obj" : "model/stl";
    } else if (uploadType === "zip") {
      const allowedZipExts = ["zip"];
      if (!allowedZipExts.includes(extension)) {
        return NextResponse.json(
          {
            success: false,
            message: "Unsupported file type",
            error: `Package format not supported. Allowed format: ${allowedZipExts.join(", ")}`,
          },
          { status: 400 }
        );
      }

      const maxZipBytes = 250 * 1024 * 1024; // 250 MB
      if (size > maxZipBytes) {
        return NextResponse.json(
          {
            success: false,
            message: "File limit exceeded",
            error: `ZIP package archive exceeds maximum limit of 250 MB (uploaded: ${(size / (1024 * 1024)).toFixed(1)} MB).`,
          },
          { status: 400 }
        );
      }

      bucket = PRIVATE_BUCKET;
      storagePath = `products/${cleanSlug}/${uniqueFileName}`;
      contentType = "application/zip";
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid upload type",
          error: "uploadType must be 'image', 'stl', or 'zip'.",
        },
        { status: 400 }
      );
    }

    // 4. Generate Direct Signed Upload URL from Supabase Storage
    const isPlaceholder =
      !process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY.includes("placeholder");

    if (isPlaceholder) {
      // In local dev without Supabase keys, fallback to local API route
      return NextResponse.json({
        success: true,
        message: "Development fallback upload route configured",
        data: {
          mode: "proxy",
          uploadUrl: "/api/admin/upload",
          storagePath,
          bucket,
          fileName,
          uniqueFileName,
          fileSizeBytes: size,
          contentType,
        },
      });
    }

    const { signedUrl, token, error: signErr } = await createDirectSignedUploadUrl(
      bucket,
      storagePath
    );

    if (signErr || !signedUrl) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to generate signed upload URL from Supabase Storage",
          error: signErr || "Unknown storage error",
        },
        { status: 500 }
      );
    }

    // Compute public URL for public preview images
    const publicUrl =
      uploadType === "image" ? getPublicStorageUrl(bucket, storagePath) : undefined;

    return NextResponse.json({
      success: true,
      message: "Direct signed upload URL generated successfully",
      data: {
        mode: "direct",
        signedUrl,
        token,
        storagePath,
        bucket,
        publicUrl,
        fileName,
        uniqueFileName,
        fileSizeBytes: size,
        contentType,
      },
    });
  } catch (err: any) {
    console.error("POST /api/admin/storage/sign-upload exception:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to authorize storage upload",
        error: err.message || "An unexpected error occurred.",
      },
      { status: 500 }
    );
  }
}
