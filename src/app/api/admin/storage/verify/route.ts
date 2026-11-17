import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { verifyStorageObjectExists } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role?.toUpperCase();
    const userEmail = session?.user?.email?.toLowerCase().trim();
    const adminEmail = (
      process.env.ADMIN_DEFAULT_EMAIL || "theprintfactory2026@gmail.com"
    )
      .toLowerCase()
      .trim();

    const isAuthorized =
      userRole === "ADMIN" ||
      userEmail === adminEmail ||
      userEmail === "theprintfactory2026@gmail.com" ||
      userEmail === "admin@theprintfactory.com";
    if (!isAuthorized && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
          error: "Administrator privileges required to verify storage objects.",
        },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || !body.storagePath || !body.bucket) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation Error",
          error: "storagePath and bucket are required parameters.",
        },
        { status: 400 }
      );
    }

    const { bucket, storagePath } = body;
    const check = await verifyStorageObjectExists(bucket, storagePath);

    if (!check.exists) {
      return NextResponse.json(
        {
          success: false,
          message: "Storage object not verified",
          error: check.error || `File does not exist in bucket ${bucket} at path ${storagePath}`,
          data: { verified: false },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Storage object verified successfully",
      data: {
        verified: true,
        bucket,
        storagePath,
        size: check.size,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Verification failed",
        error: err.message || "An unexpected error occurred during storage verification.",
      },
      { status: 500 }
    );
  }
}
