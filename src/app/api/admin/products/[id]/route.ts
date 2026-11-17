import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import prisma, { isDatabaseReachable } from "@/lib/database/prisma";
import {
  getLiveExchangeRates,
  calculateConvertedPrices,
  SupportedTargetCurrency,
} from "@/services/currency.service";
import {
  deleteStorageObject,
  getPublicStorageUrl,
  PUBLIC_BUCKET,
  PRIVATE_BUCKET,
} from "@/lib/supabase";

export const dynamic = "force-dynamic";

function parseFileType(val: string | undefined): "STL" | "ZIP" | "OBJ" | "THREE_MF" {
  if (!val) return "STL";
  const upper = val.toUpperCase().trim();
  if (upper === "ZIP") return "ZIP";
  if (upper === "OBJ") return "OBJ";
  if (upper === "3MF" || upper === "THREE_MF") return "THREE_MF";
  return "STL";
}

async function verifyAdminAuth() {
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
    if (dbUser?.role === "ADMIN") {
      isAuthorized = true;
    }
  }

  return isAuthorized;
}

// 1. GET: Fetch product by ID
export async function GET(
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
        { success: false, message: "Product ID required", error: "Missing product ID." },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        prices: true,
        images: { orderBy: { sortOrder: "asc" } },
        files: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Not found", error: "Product not found." },
        { status: 404 }
      );
    }

    const sanitizedProduct = {
      ...product,
      prices: product.prices.map((pr) => ({
        ...pr,
        amount: Number(pr.amount),
        compareAtAmount: pr.compareAtAmount ? Number(pr.compareAtAmount) : null,
        exchangeRate: pr.exchangeRate ? Number(pr.exchangeRate) : null,
      })),
      files: product.files.map((f) => ({
        ...f,
        fileSizeBytes: Number(f.fileSizeBytes),
      })),
    };

    return NextResponse.json({
      success: true,
      message: "Product retrieved successfully",
      data: { product: sanitizedProduct },
    });
  } catch (err: any) {
    console.error("GET /api/admin/products/[id] error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch product", error: err.message },
      { status: 500 }
    );
  }
}

// 2. PUT / PATCH: Update product
export async function PUT(
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
        { success: false, message: "Product ID required", error: "Missing product ID." },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, message: "Invalid payload", error: "Request body must be JSON." },
        { status: 400 }
      );
    }

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

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { prices: true, images: true, files: true },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, message: "Product not found", error: "No product matches ID." },
        { status: 404 }
      );
    }

    // Resolve INR Price & Currency Conversion
    const inrBasePrice = Number(body.inrPrice || prices?.INR || 0);
    let priceRecords: { currency: string; amount: number; exchangeRate: number }[] = [];

    if (inrBasePrice > 0) {
      let exchangeRatesMap: Record<SupportedTargetCurrency, number>;
      try {
        const exchangeData = await getLiveExchangeRates();
        exchangeRatesMap = exchangeData.rates;
      } catch (ratesErr: any) {
        if (body.exchangeRates && typeof body.exchangeRates === "object") {
          exchangeRatesMap = body.exchangeRates;
        } else {
          exchangeRatesMap = {
            USD: 0.01059,
            EUR: 0.00962,
            GBP: 0.00803,
            CAD: 0.01514,
            AUD: 0.01563,
            JPY: 1.69658,
          };
        }
      }

      const convertedPrices = calculateConvertedPrices(inrBasePrice, exchangeRatesMap);
      priceRecords = [
        { currency: "INR", amount: inrBasePrice, exchangeRate: 1.0 },
        { currency: "USD", amount: convertedPrices.USD, exchangeRate: exchangeRatesMap.USD },
        { currency: "EUR", amount: convertedPrices.EUR, exchangeRate: exchangeRatesMap.EUR },
        { currency: "GBP", amount: convertedPrices.GBP, exchangeRate: exchangeRatesMap.GBP },
        { currency: "CAD", amount: convertedPrices.CAD, exchangeRate: exchangeRatesMap.CAD },
        { currency: "AUD", amount: convertedPrices.AUD, exchangeRate: exchangeRatesMap.AUD },
        { currency: "JPY", amount: convertedPrices.JPY, exchangeRate: exchangeRatesMap.JPY },
      ];
    }

    // Resolve Category
    let targetCatId = categoryId || existingProduct.categoryId;
    const catExists = await prisma.category.findUnique({ where: { id: targetCatId } });
    if (!catExists) {
      const fallbackCat = await prisma.category.findFirst();
      if (fallbackCat) targetCatId = fallbackCat.id;
    }

    // Format Images
    const formattedImages = Array.isArray(images) && images.length > 0
      ? images.map((imgUrl: string, idx: number) => {
          let finalUrl = imgUrl.trim();
          if (finalUrl.startsWith("previews/")) {
            finalUrl = getPublicStorageUrl(PUBLIC_BUCKET, finalUrl);
          }
          return {
            url: finalUrl,
            altText: title || existingProduct.title,
            isPrimary: idx === 0,
            sortOrder: idx,
          };
        })
      : null;

    // Execute atomic update transaction
    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update prices if provided
      if (priceRecords.length > 0) {
        for (const p of priceRecords) {
          await tx.productPrice.upsert({
            where: {
              productId_currency: {
                productId: id,
                currency: p.currency,
              },
            },
            create: {
              productId: id,
              currency: p.currency,
              amount: p.amount,
              exchangeRate: p.exchangeRate,
              isEnabled: true,
            },
            update: {
              amount: p.amount,
              exchangeRate: p.exchangeRate,
              isEnabled: true,
            },
          });
        }
      }

      // 2. Update images if provided
      if (formattedImages && formattedImages.length > 0) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        await tx.productImage.createMany({
          data: formattedImages.map((img) => ({
            ...img,
            productId: id,
          })),
        });
      }

      // 3. Update files if provided
      if (Array.isArray(files) && files.length > 0) {
        await tx.productFile.deleteMany({ where: { productId: id } });
        await tx.productFile.createMany({
          data: files.map((f: any) => ({
            productId: id,
            fileName: f.fileName || "model.stl",
            fileType: parseFileType(f.fileType),
            fileSizeBytes: BigInt(f.fileSizeBytes || 50000000),
            storagePath: f.storagePath || `products/${existingProduct.slug}/${f.fileName || "model.stl"}`,
            isDownloadable: true,
          })),
        });
      }

      // 4. Update core product attributes
      return tx.product.update({
        where: { id },
        data: {
          ...(title ? { title: title.trim() } : {}),
          ...(slug ? { slug: slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-") } : {}),
          ...(shortDescription !== undefined ? { shortDescription: shortDescription.trim() } : {}),
          ...(fullDescription !== undefined ? { fullDescription: fullDescription.trim() } : {}),
          ...(targetCatId ? { categoryId: targetCatId } : {}),
          ...(supportedPrinters !== undefined ? { supportedPrinters: supportedPrinters.trim() } : {}),
          ...(printingSettings !== undefined ? { printingSettings: printingSettings.trim() } : {}),
          ...(licenceType !== undefined ? { licenceType: licenceType.trim() } : {}),
          ...(isPublished !== undefined ? { isPublished } : {}),
          ...(isFeatured !== undefined ? { isFeatured } : {}),
        },
        include: {
          category: true,
          prices: true,
          images: { orderBy: { sortOrder: "asc" } },
          files: true,
        },
      });
    });

    const sanitizedProduct = {
      ...updated,
      files: updated.files.map((f) => ({
        ...f,
        fileSizeBytes: Number(f.fileSizeBytes),
      })),
    };

    try {
      revalidatePath("/");
      revalidatePath("/products");
      revalidatePath("/admin/products");
      if (updated.slug) {
        revalidatePath(`/products/${updated.slug}`);
      }
    } catch (revalErr) {
      console.warn("Revalidation notice:", revalErr);
    }

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      data: { product: sanitizedProduct },
    });
  } catch (err: any) {
    console.error("PUT /api/admin/products/[id] error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to update product", error: err.message },
      { status: 500 }
    );
  }
}

// 3. DELETE: Delete product
export async function DELETE(
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
        { success: false, message: "Product ID required", error: "Missing product ID." },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        files: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found", error: "No product matches ID." },
        { status: 404 }
      );
    }

    // Collect storage paths for cleanup
    const storageFilesToDelete = [
      ...product.files.map((f) => ({ bucket: PRIVATE_BUCKET, path: f.storagePath })),
      ...product.images
        .filter((img) => img.url.includes("stl-images-public") || img.url.startsWith("previews/"))
        .map((img) => {
          const match = img.url.match(/previews\/[^?]+/);
          return { bucket: PUBLIC_BUCKET, path: match ? match[0] : "" };
        })
        .filter((item) => item.path),
    ];

    // Atomic database deletion
    await prisma.$transaction(async (tx) => {
      // 1. Delete associated download tokens
      await tx.download.deleteMany({ where: { productId: id } });

      // 2. Delete associated order items if any
      await tx.orderItem.deleteMany({ where: { productId: id } });

      // 3. Delete product (cascades prices, images, files, cartItems, wishlists, reviews)
      await tx.product.delete({ where: { id } });
    });

    // Best-effort cleanup of storage files
    for (const item of storageFilesToDelete) {
      if (item.path) {
        deleteStorageObject(item.bucket, item.path).catch((err) => {
          console.warn("Storage cleanup notice for deleted product:", err);
        });
      }
    }

    try {
      revalidatePath("/");
      revalidatePath("/products");
      revalidatePath("/admin/products");
    } catch (revalErr) {
      console.warn("Revalidation notice:", revalErr);
    }

    return NextResponse.json({
      success: true,
      message: `Product "${product.title}" has been deleted successfully.`,
      data: { deletedId: id, title: product.title },
    });
  } catch (err: any) {
    console.error("DELETE /api/admin/products/[id] error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to delete product", error: err.message },
      { status: 500 }
    );
  }
}
