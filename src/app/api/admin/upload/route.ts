import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { uploadPrivateFile, uploadPublicImage } from "@/lib/storage/supabase";
import prisma from "@/lib/database/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role?.toUpperCase();
    const userEmail = session?.user?.email?.toLowerCase().trim();
    const adminEmail = (process.env.ADMIN_DEFAULT_EMAIL || "admin@theprintfactory.com").toLowerCase().trim();
    let isAuthorized = userRole === "ADMIN" || userEmail === adminEmail;

    if (!isAuthorized && userEmail) {
      const dbUser = await prisma.user.findUnique({ where: { email: userEmail } }).catch(() => null);
      if (dbUser?.role === "ADMIN") {
        isAuthorized = true;
      }
    }

    if (!isAuthorized && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Unauthorized: Administrator privileges required to upload files." },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const uploadType = (formData.get("type") as string) || "image"; // 'image' | 'stl' | 'zip'
    const slug = (formData.get("slug") as string) || "product";

    if (!file) {
      return NextResponse.json({ error: "No file provided in upload request." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const originalName = file.name || "upload";
    const extension = originalName.split(".").pop()?.toLowerCase() || "";
    const sanitizedBase = originalName
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .toLowerCase();

    const timestamp = Date.now();
    const fileName = `${sanitizedBase}_${timestamp}.${extension}`;

    // 1. Handle Public Product Preview Image
    if (uploadType === "image") {
      const allowedImgExts = ["jpg", "jpeg", "png", "webp", "gif"];
      if (!allowedImgExts.includes(extension)) {
        return NextResponse.json(
          { error: `Invalid image format. Allowed: ${allowedImgExts.join(", ")}` },
          { status: 400 }
        );
      }

      if (file.size > 15 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Image size exceeds maximum limit of 15 MB." },
          { status: 400 }
        );
      }

      const filePath = `previews/${slug}/${fileName}`;
      const { publicUrl, error } = await uploadPublicImage(
        buffer,
        filePath,
        file.type || "image/jpeg"
      );

      if (error) {
        return NextResponse.json({ error }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        type: "image",
        url: publicUrl,
        fileName: originalName,
        fileSizeBytes: file.size,
      });
    }

    // 2. Handle Private 3D Model STL File
    if (uploadType === "stl") {
      const allowedStlExts = ["stl", "obj", "3mf"];
      if (!allowedStlExts.includes(extension)) {
        return NextResponse.json(
          { error: `Invalid 3D model format. Allowed: ${allowedStlExts.join(", ")}` },
          { status: 400 }
        );
      }

      if (file.size > 150 * 1024 * 1024) {
        return NextResponse.json(
          { error: "STL file exceeds maximum limit of 150 MB." },
          { status: 400 }
        );
      }

      const filePath = `products/${slug}/${fileName}`;
      const { path, error } = await uploadPrivateFile(
        buffer,
        filePath,
        "application/octet-stream"
      );

      if (error) {
        return NextResponse.json({ error }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        type: "stl",
        storagePath: path,
        fileName: originalName,
        fileSizeBytes: file.size,
      });
    }

    // 3. Handle Private ZIP Archive
    if (uploadType === "zip") {
      const allowedZipExts = ["zip", "rar", "7z"];
      if (!allowedZipExts.includes(extension)) {
        return NextResponse.json(
          { error: `Invalid package format. Allowed: ${allowedZipExts.join(", ")}` },
          { status: 400 }
        );
      }

      if (file.size > 250 * 1024 * 1024) {
        return NextResponse.json(
          { error: "ZIP package exceeds maximum limit of 250 MB." },
          { status: 400 }
        );
      }

      const filePath = `products/${slug}/${fileName}`;
      const { path, error } = await uploadPrivateFile(
        buffer,
        filePath,
        "application/zip"
      );

      if (error) {
        return NextResponse.json({ error }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        type: "zip",
        storagePath: path,
        fileName: originalName,
        fileSizeBytes: file.size,
      });
    }

    return NextResponse.json({ error: "Invalid upload type specified." }, { status: 400 });
  } catch (err: any) {
    console.error("POST /api/admin/upload error:", err);
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred during file upload." },
      { status: 500 }
    );
  }
}
