import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import prisma, { isDatabaseReachable } from "@/lib/database/prisma";
import { getAllProducts } from "@/lib/database/products";

export const dynamic = "force-dynamic";

function parseFileType(val: string | undefined): "STL" | "ZIP" | "OBJ" | "THREE_MF" {
  if (!val) return "STL";
  const upper = val.toUpperCase().trim();
  if (upper === "ZIP") return "ZIP";
  if (upper === "OBJ") return "OBJ";
  if (upper === "3MF" || upper === "THREE_MF") return "THREE_MF";
  return "STL";
}

export async function GET() {
  try {
    const products = await getAllProducts();
    return NextResponse.json({ products });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role?.toUpperCase();
    const userEmail = session?.user?.email?.toLowerCase().trim();
    const adminEmail = (process.env.ADMIN_DEFAULT_EMAIL || "admin@theprintfactory.com").toLowerCase().trim();
    const isAuthorized = userRole === "ADMIN" || userEmail === adminEmail;

    if (!isAuthorized && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Unauthorized: You must be signed in with an Administrator account to publish products." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      title,
      slug,
      shortDescription,
      fullDescription,
      categoryId,
      supportedPrinters,
      printingSettings,
      licenceType,
      isPublished,
      isFeatured,
      prices,
      images,
      files,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Product title is required." }, { status: 400 });
    }

    const baseSlug = (slug || title || "product")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const dbOnline = await isDatabaseReachable();
    if (!dbOnline) {
      const mockProduct = {
        id: `prod_${Date.now()}`,
        title,
        slug: `${baseSlug}-${Date.now().toString(36)}`,
        shortDescription: shortDescription || "",
        fullDescription: fullDescription || "",
        categoryId: categoryId || "cat_miniatures",
        supportedPrinters: supportedPrinters || "FDM / SLA / Resin",
        printingSettings: printingSettings || "Standard 3D Print Settings",
        licenceType: licenceType || "Personal Use Only (Non-Commercial)",
        isPublished: isPublished ?? true,
        isFeatured: isFeatured ?? false,
      };
      return NextResponse.json({ success: true, product: mockProduct }, { status: 201 });
    }

    // Resolve duplicate slugs
    let finalSlug = baseSlug;
    const existingSlug = await prisma.product.findUnique({
      where: { slug: finalSlug },
    });
    if (existingSlug) {
      finalSlug = `${baseSlug}-${Date.now().toString(36)}`;
    }

    // Resolve valid Category ID
    let finalCategoryId = categoryId || "cat_miniatures";
    const existingCat = await prisma.category.findUnique({
      where: { id: finalCategoryId },
    });
    if (!existingCat) {
      const fallbackCat = await prisma.category.findFirst();
      if (fallbackCat) {
        finalCategoryId = fallbackCat.id;
      } else {
        // Auto-seed default category if database is newly provisioned
        const createdCat = await prisma.category.create({
          data: {
            id: "cat_miniatures",
            name: "Miniatures & Figurines",
            slug: "miniatures-figurines",
            description: "Tabletop miniatures, statues, characters, and figurines",
            sortOrder: 1,
            isFeatured: true,
          },
        });
        finalCategoryId = createdCat.id;
      }
    }

    const product = await prisma.product.create({
      data: {
        title: title.trim(),
        slug: finalSlug,
        shortDescription: shortDescription?.trim() || title.trim(),
        fullDescription: fullDescription?.trim() || shortDescription?.trim() || title.trim(),
        categoryId: finalCategoryId,
        supportedPrinters: supportedPrinters || "FDM / SLA / Resin",
        printingSettings: printingSettings || "Standard 3D Print Settings",
        licenceType: licenceType || "Personal Use Only (Non-Commercial)",
        isPublished: isPublished ?? true,
        isFeatured: isFeatured ?? false,
        prices: {
          create: Object.entries(prices || {}).map(([currency, amount]) => ({
            currency,
            amount: Number(amount) || 0,
            isEnabled: true,
          })),
        },
        images: {
          create: (images && images.length > 0 ? images : ["https://images.unsplash.com/photo-1586105251261-72a756497a11?auto=format&fit=crop&w=1000&q=80"]).filter(Boolean).map((imgUrl: string, idx: number) => ({
            url: imgUrl,
            altText: title.trim(),
            isPrimary: idx === 0,
            sortOrder: idx,
          })),
        },
        files: {
          create: (files && files.length > 0 ? files : [{ fileName: "model.stl", fileType: "STL", fileSizeBytes: 45000000 }]).map((f: any) => ({
            fileName: f.fileName || "model.stl",
            fileType: parseFileType(f.fileType),
            fileSizeBytes: BigInt(f.fileSizeBytes || 50000000),
            storagePath: f.storagePath || `products/${finalSlug}/${f.fileName || "model.stl"}`,
            isDownloadable: true,
          })),
        },
      },
      include: {
        prices: true,
        images: true,
        files: true,
        category: true,
      },
    });

    // Sanitize BigInt values so JSON.stringify does not fail
    const sanitizedProduct = {
      ...product,
      files: product.files.map((f: any) => ({
        ...f,
        fileSizeBytes: Number(f.fileSizeBytes),
      })),
    };

    return NextResponse.json({ success: true, product: sanitizedProduct }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/admin/products error:", err);
    return NextResponse.json({ error: err.message || "Failed to create product" }, { status: 500 });
  }
}
