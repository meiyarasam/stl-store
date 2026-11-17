import prisma, { isDatabaseReachable } from "@/lib/database/prisma";
import { CurrencyCode, ProductDTO, CategoryDTO } from "@/types";

export function mapDbProductToDTO(p: any): ProductDTO {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    shortDescription: p.shortDescription || "",
    fullDescription: p.fullDescription || "",
    categoryId: p.categoryId,
    category: p.category
      ? {
          id: p.category.id,
          name: p.category.name,
          slug: p.category.slug,
          isActive: p.category.isActive,
        }
      : undefined,
    supportedPrinters: p.supportedPrinters || "FDM / SLA / Resin",
    printingSettings: p.printingSettings || "",
    licenceType: p.licenceType || "Personal Use Only (Non-Commercial)",
    isPublished: p.isPublished,
    isFeatured: p.isFeatured,
    isDeleted: Boolean(p.isDeleted),
    deletedAt: p.deletedAt ? p.deletedAt.toISOString() : null,
    viewCount: p.viewCount || 0,
    downloadCount: p.downloadCount || 0,
    prices: (p.prices || []).map((pr: any) => ({
      id: pr.id,
      currency: pr.currency as CurrencyCode,
      amount: Number(pr.amount),
      compareAtAmount: pr.compareAtAmount ? Number(pr.compareAtAmount) : null,
      isEnabled: pr.isEnabled ?? true,
    })),
    images: (p.images || []).map((img: any) => ({
      id: img.id,
      url: img.url,
      altText: img.altText || null,
      isPrimary: Boolean(img.isPrimary),
      sortOrder: img.sortOrder || 0,
    })),
    files: (p.files || []).map((f: any) => ({
      id: f.id,
      fileName: f.fileName,
      fileType: f.fileType,
      fileSizeBytes: Number(f.fileSizeBytes || 0),
      storagePath: f.storagePath,
      isDownloadable: f.isDownloadable ?? true,
      version: f.version || "1.0",
    })),
    createdAt: p.createdAt ? p.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: p.updatedAt ? p.updatedAt.toISOString() : new Date().toISOString(),
  };
}

// Kept for backward compatibility if imported elsewhere
export function mapSampleProductToDTO(p: any): ProductDTO {
  return mapDbProductToDTO(p);
}

export async function getAllProducts({
  categorySlug,
  search,
  featuredOnly,
  includeUnpublished = false,
  sort = "newest",
}: {
  categorySlug?: string;
  search?: string;
  featuredOnly?: boolean;
  includeUnpublished?: boolean;
  sort?: "newest" | "price-asc" | "price-desc" | "popular";
} = {}): Promise<ProductDTO[]> {
  const dbOnline = await isDatabaseReachable();

  if (!dbOnline) {
    console.warn("Database is unreachable in getAllProducts");
    return [];
  }

  try {
    const where: any = {
      isDeleted: false,
    };

    if (!includeUnpublished) {
      where.isPublished = true;
      // Public product queries must only include products whose category is active (ON)
      where.category = {
        isActive: true,
        ...(categorySlug ? { slug: categorySlug } : {}),
      };
    } else if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { shortDescription: { contains: q, mode: "insensitive" } },
      ];
    }

    if (featuredOnly) {
      where.isFeatured = true;
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "popular") {
      orderBy = { downloadCount: "desc" };
    }

    const dbProducts = await prisma.product.findMany({
      where,
      include: {
        category: true,
        prices: true,
        images: { orderBy: { sortOrder: "asc" } },
        files: true,
      },
      orderBy,
    });

    let results = dbProducts.map(mapDbProductToDTO);

    // In-memory price sorting if requested (since prices are across multiple currencies)
    if (sort === "price-asc") {
      results = results.sort((a, b) => {
        const pA = a.prices.find((p) => p.currency === "INR")?.amount || a.prices[0]?.amount || 0;
        const pB = b.prices.find((p) => p.currency === "INR")?.amount || b.prices[0]?.amount || 0;
        return pA - pB;
      });
    } else if (sort === "price-desc") {
      results = results.sort((a, b) => {
        const pA = a.prices.find((p) => p.currency === "INR")?.amount || a.prices[0]?.amount || 0;
        const pB = b.prices.find((p) => p.currency === "INR")?.amount || b.prices[0]?.amount || 0;
        return pB - pA;
      });
    }

    return results;
  } catch (err) {
    console.error("Database query failed in getAllProducts:", err);
    return [];
  }
}

export async function getProductBySlug(
  slug: string,
  includeUnpublished = false
): Promise<ProductDTO | null> {
  const dbOnline = await isDatabaseReachable();

  if (!dbOnline) {
    console.warn("Database is unreachable in getProductBySlug");
    return null;
  }

  try {
    const where: any = {
      slug,
      isDeleted: false,
    };

    if (!includeUnpublished) {
      where.isPublished = true;
      where.category = {
        isActive: true,
      };
    }

    const p = await prisma.product.findFirst({
      where,
      include: {
        category: true,
        prices: true,
        images: { orderBy: { sortOrder: "asc" } },
        files: true,
      },
    });

    if (!p) {
      return null;
    }

    return mapDbProductToDTO(p);
  } catch (err) {
    console.error(`Database lookup by slug failed for "${slug}":`, err);
    return null;
  }
}

export async function getProductById(id: string): Promise<ProductDTO | null> {
  const dbOnline = await isDatabaseReachable();

  if (!dbOnline) {
    console.warn("Database is unreachable in getProductById");
    return null;
  }

  try {
    const p = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        prices: true,
        images: { orderBy: { sortOrder: "asc" } },
        files: true,
      },
    });

    if (!p || p.isDeleted) {
      return null;
    }

    return mapDbProductToDTO(p);
  } catch (err) {
    console.error(`Database lookup by ID failed for "${id}":`, err);
    return null;
  }
}

export async function getAllCategories({
  includeInactive = false,
}: {
  includeInactive?: boolean;
} = {}): Promise<CategoryDTO[]> {
  const dbOnline = await isDatabaseReachable();

  if (!dbOnline) {
    console.warn("Database is unreachable in getAllCategories");
    return [];
  }

  try {
    const where: any = {};
    if (!includeInactive) {
      where.isActive = true;
    }

    const dbCats = await prisma.category.findMany({
      where,
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: {
            products: {
              where: {
                isDeleted: false,
                isPublished: true,
              },
            },
          },
        },
      },
    });

    return dbCats.map((c: any) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description || "",
      image: c.image || "/images/logo.png",
      icon: c.icon || "Folder",
      isFeatured: Boolean(c.isFeatured),
      isActive: Boolean(c.isActive),
      sortOrder: c.sortOrder || 0,
      productCount: c._count?.products || 0,
    }));
  } catch (err) {
    console.error("Categories database fetch failed in getAllCategories:", err);
    return [];
  }
}

export async function getCategoryBySlug(
  slug: string,
  includeInactive = false
): Promise<CategoryDTO | null> {
  const dbOnline = await isDatabaseReachable();

  if (!dbOnline) {
    console.warn("Database is unreachable in getCategoryBySlug");
    return null;
  }

  try {
    const where: any = { slug };
    if (!includeInactive) {
      where.isActive = true;
    }

    const cat = await prisma.category.findFirst({
      where,
      include: {
        _count: {
          select: {
            products: {
              where: {
                isDeleted: false,
                isPublished: true,
              },
            },
          },
        },
      },
    });

    if (!cat) {
      return null;
    }

    return {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      image: cat.image || "/images/logo.png",
      icon: cat.icon || "Folder",
      isFeatured: Boolean(cat.isFeatured),
      isActive: Boolean(cat.isActive),
      sortOrder: cat.sortOrder || 0,
      productCount: cat._count?.products || 0,
    };
  } catch (err) {
    console.error(`Category lookup failed for slug "${slug}":`, err);
    return null;
  }
}
