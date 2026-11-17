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

    if (!product || product.isDeleted) {
      return NextResponse.json(
        { success: false, message: "Not found", error: "Product not found or has been deleted." },
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
      include: { category: true, prices: true, images: true, files: true },
    });

    if (!existingProduct || existingProduct.isDeleted) {
      return NextResponse.json(
        { success: false, message: "Product not found", error: "No active product matches ID." },
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
      revalidatePath("/categories");
      revalidatePath("/admin/products");
      if (updated.category?.slug) {
        revalidatePath(`/categories/${updated.category.slug}`);
      }
      if (existingProduct.category?.slug && existingProduct.category.slug !== updated.category?.slug) {
        revalidatePath(`/categories/${existingProduct.category.slug}`);
      }
      if (updated.slug) {
        revalidatePath(`/products/${updated.slug}`);
      }
      if (existingProduct.slug && existingProduct.slug !== updated.slug) {
        revalidatePath(`/products/${existingProduct.slug}`);
      }
      revalidatePath("/api/products");
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
        category: true,
        orderItems: { select: { id: true } },
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found", error: "No product matches ID." },
        { status: 404 }
      );
    }

    const hasOrders = product.orderItems.length > 0;

    if (!hasOrders) {
      // 1. Storage cleanup: only delete files not referenced by any other product
      for (const file of product.files) {
        if (file.storagePath) {
          const otherProductWithFile = await prisma.productFile.findFirst({
            where: {
              storagePath: file.storagePath,
              productId: { not: id },
            },
          });
          if (!otherProductWithFile) {
            deleteStorageObject(PRIVATE_BUCKET, file.storagePath).catch((err) => {
              console.warn("Storage cleanup notice for file:", err);
            });
          }
        }
      }

      for (const img of product.images) {
        const match = img.url.match(/previews\/[^?]+/);
        const imgPath = match ? match[0] : "";
        if (imgPath) {
          const otherProductWithImage = await prisma.productImage.findFirst({
            where: {
              url: { contains: imgPath },
              productId: { not: id },
            },
          });
          if (!otherProductWithImage) {
            deleteStorageObject(PUBLIC_BUCKET, imgPath).catch((err) => {
              console.warn("Storage cleanup notice for image:", err);
            });
          }
        }
      }

      // 2. Hard database deletion since no customer order references this product
      await prisma.$transaction(async (tx) => {
        await tx.cartItem.deleteMany({ where: { productId: id } });
        await tx.wishlist.deleteMany({ where: { productId: id } });
        await tx.review.deleteMany({ where: { productId: id } });
        await tx.download.deleteMany({ where: { productId: id } });
        await tx.product.delete({ where: { id } });
      });
    } else {
      // Preserve historical customer orders & purchase downloads by soft-deleting
      await prisma.product.update({
        where: { id },
        data: {
          isDeleted: true,
          isPublished: false,
          deletedAt: new Date(),
          slug: `${product.slug}_deleted_${Date.now()}`,
        },
      });

      // Clear from active carts and wishlists
      await prisma.cartItem.deleteMany({ where: { productId: id } });
      await prisma.wishlist.deleteMany({ where: { productId: id } });
    }

    // Complete Next.js route revalidation across public and admin pages
    try {
      revalidatePath("/");
      revalidatePath("/products");
      revalidatePath(`/products/${product.slug}`);
      revalidatePath("/categories");
      if (product.category?.slug) {
        revalidatePath(`/categories/${product.category.slug}`);
      }
      revalidatePath("/admin/products");
      revalidatePath("/api/products");
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
