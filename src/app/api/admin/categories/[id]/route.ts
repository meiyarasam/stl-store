import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import prisma from "@/lib/database/prisma";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function verifyAdminAuth() {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role?.toUpperCase();
  const userEmail = session?.user?.email?.toLowerCase().trim();
  const adminEmail = (
    process.env.ADMIN_DEFAULT_EMAIL || "theprintfactory2026@gmail.com"
  )
    .toLowerCase()
    .trim();

  let isAuthorized =
    userRole === "ADMIN" ||
    userEmail === adminEmail ||
    userEmail === "theprintfactory2026@gmail.com" ||
    userEmail === "admin@theprintfactory.com";

  if (!isAuthorized && userEmail) {
    const dbUser = await prisma.user
      .findUnique({ where: { email: userEmail } })
      .catch(() => null);
    if (dbUser?.role === "ADMIN") {
      isAuthorized = true;
    }
  }

  return isAuthorized;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAuthorized = await verifyAdminAuth();
    if (!isAuthorized && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { success: false, message: "Unauthorized", error: "Admin access required." },
        { status: 403 }
      );
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Category ID required", error: "Missing category ID." },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, message: "Invalid payload", error: "Request body must be JSON." },
        { status: 400 }
      );
    }

    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, message: "Category not found", error: "No category matches ID." },
        { status: 404 }
      );
    }

    const updateData: any = {};

    if (typeof body.isActive === "boolean") {
      updateData.isActive = body.isActive;
    }

    if (typeof body.name === "string" && body.name.trim()) {
      updateData.name = body.name.trim();
    }

    if (typeof body.description === "string") {
      updateData.description = body.description.trim();
    }

    if (typeof body.isFeatured === "boolean") {
      updateData.isFeatured = body.isFeatured;
    }

    if (typeof body.sortOrder === "number") {
      updateData.sortOrder = body.sortOrder;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No valid fields to update",
          error: "Provide at least one field such as isActive (boolean).",
        },
        { status: 400 }
      );
    }

    const updated = await prisma.category.update({
      where: { id },
      data: updateData,
    });

    // Revalidate affected routes across the store
    try {
      revalidatePath("/");
      revalidatePath("/categories");
      revalidatePath(`/categories/${updated.slug}`);
      revalidatePath("/products");
      revalidatePath("/admin/categories");
    } catch (revalErr) {
      console.warn("Category revalidation notice:", revalErr);
    }

    return NextResponse.json({
      success: true,
      message: `Category "${updated.name}" is now ${
        updated.isActive ? "ON (Visible to Public)" : "OFF (Hidden from Public)"
      }.`,
      data: { category: updated },
    });
  } catch (err: any) {
    console.error("PATCH /api/admin/categories/[id] error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to update category", error: err.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, ctx: { params: { id: string } }) {
  return PATCH(req, ctx);
}
