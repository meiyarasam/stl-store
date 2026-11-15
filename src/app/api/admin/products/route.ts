import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import prisma from "@/lib/database/prisma";
import { getAllProducts } from "@/lib/database/products";

export const dynamic = "force-dynamic";

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
    if ((session?.user as any)?.role !== "ADMIN" && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
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

    const product = await prisma.product.create({
      data: {
        title,
        slug: slug.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        shortDescription,
        fullDescription,
        categoryId: categoryId || "cat_miniatures",
        supportedPrinters: supportedPrinters || "FDM / SLA / Resin",
        printingSettings,
        licenceType: licenceType || "Personal Use Only",
        isPublished: isPublished ?? true,
        isFeatured: isFeatured ?? false,
        prices: {
          create: Object.entries(prices || {}).map(([currency, amount]) => ({
            currency,
            amount: Number(amount),
            isEnabled: true,
          })),
        },
        images: {
          create: (images || []).map((imgUrl: string, idx: number) => ({
            url: imgUrl,
            altText: title,
            isPrimary: idx === 0,
            sortOrder: idx,
          })),
        },
        files: {
          create: (files || []).map((f: any) => ({
            fileName: f.fileName || "model.stl",
            fileType: f.fileType || "STL",
            fileSizeBytes: BigInt(f.fileSizeBytes || 50000000),
            storagePath: f.storagePath || `products/${slug}/${f.fileName || "model.stl"}`,
            isDownloadable: true,
          })),
        },
      },
      include: {
        prices: true,
        images: true,
        files: true,
      },
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/admin/products error:", err);
    return NextResponse.json({ error: err.message || "Failed to create product" }, { status: 500 });
  }
}
