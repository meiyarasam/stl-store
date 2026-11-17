import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import prisma, { isDatabaseReachable } from "@/lib/database/prisma";
import { getAllProducts } from "@/lib/database/products";
import {
  getLiveExchangeRates,
  calculateConvertedPrices,
  SupportedTargetCurrency,
} from "@/services/currency.service";
import { deleteStorageObject, getPublicStorageUrl, PUBLIC_BUCKET, PRIVATE_BUCKET } from "@/lib/supabase";

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
    return NextResponse.json({
      success: true,
      message: "Products retrieved successfully",
      data: { products },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch products",
        error: err.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  let uploadedStoragePathsToClean: { bucket: string; path: string }[] = [];

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
      if (dbUser?.role === "ADMIN") {
        isAuthorized = true;
      }
    }

    if (!isAuthorized && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
          error: "You must be signed in with an Administrator account to publish products.",
        },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Request",
          error: "Request body must be valid JSON.",
        },
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

    // 2. Validate Required Fields
    if (!title || !title.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation Error",
          error: "Product title is required.",
        },
        { status: 400 }
      );
    }

    // Require actual uploaded image
    if (!images || !Array.isArray(images) || images.length === 0 || !images[0]?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation Error",
          error: "Please upload an actual product preview image before publishing.",
        },
        { status: 400 }
      );
    }

    // Require actual uploaded primary STL file
    const stlFile = files?.find((f: any) => parseFileType(f.fileType) === "STL" || parseFileType(f.fileType) === "THREE_MF" || parseFileType(f.fileType) === "OBJ");
    if (!files || !Array.isArray(files) || !stlFile || !stlFile.storagePath) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation Error",
          error: "Please upload the primary 3D printable STL model file before publishing.",
        },
        { status: 400 }
      );
    }

    // Track storage paths for cleanup in case database transaction fails
    for (const f of files) {
      if (f.storagePath) {
        uploadedStoragePathsToClean.push({ bucket: PRIVATE_BUCKET, path: f.storagePath });
      }
    }

    // 3. Resolve INR base price
    const inrBasePrice = Number(body.inrPrice || prices?.INR || 0);
    if (!inrBasePrice || inrBasePrice <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation Error",
          error: "A valid positive INR product price (₹) is required.",
        },
        { status: 400 }
      );
    }

    // 4. Resolve exchange rates
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

    const priceRecords = [
      { currency: "INR", amount: inrBasePrice, exchangeRate: 1.0 },
      { currency: "USD", amount: convertedPrices.USD, exchangeRate: exchangeRatesMap.USD },
      { currency: "EUR", amount: convertedPrices.EUR, exchangeRate: exchangeRatesMap.EUR },
      { currency: "GBP", amount: convertedPrices.GBP, exchangeRate: exchangeRatesMap.GBP },
      { currency: "CAD", amount: convertedPrices.CAD, exchangeRate: exchangeRatesMap.CAD },
      { currency: "AUD", amount: convertedPrices.AUD, exchangeRate: exchangeRatesMap.AUD },
      { currency: "JPY", amount: convertedPrices.JPY, exchangeRate: exchangeRatesMap.JPY },
    ];

    const baseSlug = (slug || title || "product")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const dbOnline = await isDatabaseReachable();
    if (!dbOnline) {
      return NextResponse.json(
        {
          success: false,
          message: "Database Offline",
          error: "PostgreSQL database is currently unreachable.",
        },
        { status: 503 }
      );
    }

    // Resolve duplicate slugs
    let finalSlug = baseSlug;
    const existingSlug = await prisma.product.findUnique({
      where: { slug: finalSlug },
    });
    if (existingSlug) {
      finalSlug = `${baseSlug}-${Date.now().toString(36)}`;
    }

    // Resolve Category ID
    let finalCategoryId = categoryId || "cat_miniatures";
    const existingCat = await prisma.category.findUnique({
      where: { id: finalCategoryId },
    });
    if (!existingCat) {
      const fallbackCat = await prisma.category.findFirst();
      if (fallbackCat) {
        finalCategoryId = fallbackCat.id;
      } else {
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

    // 5. Clean and format Image URLs (ensure permanent public CDN URLs)
    const formattedImages = images.map((imgUrl: string, idx: number) => {
      let finalUrl = imgUrl.trim();
      // If path given without host, convert to Supabase public storage CDN URL
      if (finalUrl.startsWith("previews/")) {
        finalUrl = getPublicStorageUrl(PUBLIC_BUCKET, finalUrl);
      }
      return {
        url: finalUrl,
        altText: title.trim(),
        isPrimary: idx === 0,
        sortOrder: idx,
      };
    });

    // 6. Execute atomic Prisma transaction
    const product = await prisma.$transaction(async (tx) => {
      return tx.product.create({
        data: {
          title: title.trim(),
          slug: finalSlug,
          shortDescription: shortDescription?.trim() || title.trim(),
          fullDescription: fullDescription?.trim() || shortDescription?.trim() || title.trim(),
          categoryId: finalCategoryId,
          supportedPrinters: supportedPrinters || "FDM / SLA / Resin",
          printingSettings: printingSettings || "Standard 3D Print Settings",
          licenceType: licenceType || "Personal Use Only (Non-Commercial)",
          isPublished: typeof isPublished === "boolean" ? isPublished : true,
          isFeatured: typeof isFeatured === "boolean" ? isFeatured : true,
          prices: {
            create: priceRecords.map((p) => ({
              currency: p.currency,
              amount: p.amount,
              exchangeRate: p.exchangeRate,
              isEnabled: true,
            })),
          },
          images: {
            create: formattedImages,
          },
          files: {
            create: files.map((f: any) => ({
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
    });

    // Sanitize BigInt values so JSON response serializes cleanly
    const sanitizedProduct = {
      ...product,
      files: product.files.map((f: any) => ({
        ...f,
        fileSizeBytes: Number(f.fileSizeBytes),
      })),
    };

    // Instant Next.js cache revalidation for storefront & admin
    try {
      revalidatePath("/");
      revalidatePath("/products");
      revalidatePath("/admin/products");
    } catch (revalErr) {
      console.warn("Revalidation notice:", revalErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Product published successfully to The Print Factory marketplace",
        data: sanitizedProduct,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("POST /api/admin/products transaction exception:", err);

    // Rollback orphaned storage files if database transaction failed
    for (const item of uploadedStoragePathsToClean) {
      deleteStorageObject(item.bucket, item.path).catch(() => {});
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to publish product",
        error: err.message || "An unexpected database transaction error occurred.",
      },
      { status: 500 }
    );
  }
}
