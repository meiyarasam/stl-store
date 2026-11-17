import prisma, { isDatabaseReachable } from "@/lib/database/prisma";
import { SAMPLE_PRODUCTS, SAMPLE_CATEGORIES, SampleProduct, SampleCategory } from "@/data/sampleProducts";
import { CurrencyCode, ProductDTO } from "@/types";

export function mapSampleProductToDTO(p: SampleProduct): ProductDTO {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    shortDescription: p.shortDescription,
    fullDescription: p.fullDescription,
    categoryId: p.categoryId,
    category: {
      id: p.categoryId,
      name: p.categoryName,
      slug: p.categorySlug,
    },
    supportedPrinters: p.supportedPrinters,
    printingSettings: p.printingSettings,
    licenceType: p.licenceType,
    isPublished: p.isPublished,
    isFeatured: p.isFeatured,
    viewCount: p.viewCount,
    downloadCount: p.downloadCount,
    prices: Object.entries(p.prices).map(([curr, amt]) => ({
      currency: curr as CurrencyCode,
      amount: amt,
      compareAtAmount: p.compareAtPrices?.[curr as CurrencyCode] || null,
      isEnabled: true,
    })),
    images: p.images.map((img, idx) => ({
      id: `img_${p.id}_${idx}`,
      url: img.url,
      altText: img.altText,
      isPrimary: img.isPrimary,
      sortOrder: img.sortOrder,
    })),
    files: p.files.map((f, idx) => ({
      id: `file_${p.id}_${idx}`,
      fileName: f.fileName,
      fileType: f.fileType,
      fileSizeBytes: f.fileSizeBytes,
      storagePath: `products/${p.slug}/${f.fileName}`,
      isDownloadable: true,
      version: f.version,
    })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
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

  if (dbOnline) {
    try {
      const where: any = {};
      if (!includeUnpublished) {
        where.isPublished = true;
      }
      if (categorySlug) {
        where.category = { slug: categorySlug };
      }
      if (search) {
        where.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { shortDescription: { contains: search, mode: "insensitive" } },
        ];
      }
      if (featuredOnly) {
        where.isFeatured = true;
      }

      const dbProducts = await prisma.product.findMany({
        where,
        include: {
          category: true,
          prices: true,
          images: { orderBy: { sortOrder: "asc" } },
          files: true,
        },
        orderBy:
          sort === "popular"
            ? { downloadCount: "desc" }
            : { createdAt: "desc" },
      });

      if (dbProducts && dbProducts.length > 0) {
        return dbProducts.map((p: any) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          shortDescription: p.shortDescription,
          fullDescription: p.fullDescription,
          categoryId: p.categoryId,
          category: p.category
            ? {
                id: p.category.id,
                name: p.category.name,
                slug: p.category.slug,
              }
            : undefined,
          supportedPrinters: p.supportedPrinters,
          printingSettings: p.printingSettings,
          licenceType: p.licenceType,
          isPublished: p.isPublished,
          isFeatured: p.isFeatured,
          viewCount: p.viewCount,
          downloadCount: p.downloadCount,
          prices: p.prices.map((pr: any) => ({
            id: pr.id,
            currency: pr.currency as CurrencyCode,
            amount: Number(pr.amount),
            compareAtAmount: pr.compareAtAmount ? Number(pr.compareAtAmount) : null,
            isEnabled: pr.isEnabled,
          })),
          images: p.images.map((img: any) => ({
            id: img.id,
            url: img.url,
            altText: img.altText,
            isPrimary: img.isPrimary,
            sortOrder: img.sortOrder,
          })),
          files: p.files.map((f: any) => ({
            id: f.id,
            fileName: f.fileName,
            fileType: f.fileType,
            fileSizeBytes: Number(f.fileSizeBytes),
            storagePath: f.storagePath,
            isDownloadable: f.isDownloadable,
            version: f.version,
          })),
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        }));
      }
    } catch (err) {
      console.warn("Database query failed; using sample collection:", err);
    }
  }

  // Fast in-memory models response
  let results = SAMPLE_PRODUCTS.map(mapSampleProductToDTO);

  if (categorySlug) {
    results = results.filter((p) => p.category?.slug === categorySlug);
  }
  if (featuredOnly) {
    results = results.filter((p) => p.isFeatured);
  }
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q)
    );
  }

  if (sort === "popular") {
    results.sort((a, b) => b.downloadCount - a.downloadCount);
  }

  return results;
}

export async function getProductBySlug(slug: string): Promise<ProductDTO | null> {
  const dbOnline = await isDatabaseReachable();

  if (dbOnline) {
    try {
      const p = await prisma.product.findUnique({
        where: { slug },
        include: {
          category: true,
          prices: true,
          images: { orderBy: { sortOrder: "asc" } },
          files: true,
        },
      });

      if (p) {
        return {
          id: p.id,
          title: p.title,
          slug: p.slug,
          shortDescription: p.shortDescription,
          fullDescription: p.fullDescription,
          categoryId: p.categoryId,
          category: p.category
            ? {
                id: p.category.id,
                name: p.category.name,
                slug: p.category.slug,
              }
            : undefined,
          supportedPrinters: p.supportedPrinters,
          printingSettings: p.printingSettings,
          licenceType: p.licenceType,
          isPublished: p.isPublished,
          isFeatured: p.isFeatured,
          viewCount: p.viewCount,
          downloadCount: p.downloadCount,
          prices: p.prices.map((pr: any) => ({
            id: pr.id,
            currency: pr.currency as CurrencyCode,
            amount: Number(pr.amount),
            compareAtAmount: pr.compareAtAmount ? Number(pr.compareAtAmount) : null,
            isEnabled: pr.isEnabled,
          })),
          images: p.images.map((img: any) => ({
            id: img.id,
            url: img.url,
            altText: img.altText,
            isPrimary: img.isPrimary,
            sortOrder: img.sortOrder,
          })),
          files: p.files.map((f: any) => ({
            id: f.id,
            fileName: f.fileName,
            fileType: f.fileType,
            fileSizeBytes: Number(f.fileSizeBytes),
            storagePath: f.storagePath,
            isDownloadable: f.isDownloadable,
            version: f.version,
          })),
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        };
      }
    } catch (err) {
      console.warn("Database lookup by slug failed; using sample products:", err);
    }
  }

  const sample = SAMPLE_PRODUCTS.find((p) => p.slug === slug);
  return sample ? mapSampleProductToDTO(sample) : null;
}

export async function getProductById(id: string): Promise<ProductDTO | null> {
  const dbOnline = await isDatabaseReachable();

  if (dbOnline) {
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

      if (p) {
        return {
          id: p.id,
          title: p.title,
          slug: p.slug,
          shortDescription: p.shortDescription,
          fullDescription: p.fullDescription,
          categoryId: p.categoryId,
          category: p.category ? { id: p.category.id, name: p.category.name, slug: p.category.slug } : undefined,
          supportedPrinters: p.supportedPrinters,
          printingSettings: p.printingSettings,
          licenceType: p.licenceType,
          isPublished: p.isPublished,
          isFeatured: p.isFeatured,
          viewCount: p.viewCount,
          downloadCount: p.downloadCount,
          prices: p.prices.map((pr: any) => ({
            id: pr.id,
            currency: pr.currency as CurrencyCode,
            amount: Number(pr.amount),
            compareAtAmount: pr.compareAtAmount ? Number(pr.compareAtAmount) : null,
            isEnabled: pr.isEnabled,
          })),
          images: p.images.map((img: any) => ({
            id: img.id,
            url: img.url,
            altText: img.altText,
            isPrimary: img.isPrimary,
            sortOrder: img.sortOrder,
          })),
          files: p.files.map((f: any) => ({
            id: f.id,
            fileName: f.fileName,
            fileType: f.fileType,
            fileSizeBytes: Number(f.fileSizeBytes),
            storagePath: f.storagePath,
            isDownloadable: f.isDownloadable,
            version: f.version,
          })),
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        };
      }
    } catch (err) {}
  }

  const sample = SAMPLE_PRODUCTS.find((p) => p.id === id);
  return sample ? mapSampleProductToDTO(sample) : null;
}

export async function getAllCategories(): Promise<SampleCategory[]> {
  const dbOnline = await isDatabaseReachable();

  if (dbOnline) {
    try {
      const dbCats = await prisma.category.findMany({
        orderBy: { sortOrder: "asc" },
      });
      if (dbCats && dbCats.length > 0) {
        return dbCats.map((c: any) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description || "",
          image: c.image || "/images/logo.png",
          icon: c.icon || "Folder",
          isFeatured: c.isFeatured,
        }));
      }
    } catch (err) {
      console.warn("Categories database fetch notice:", err);
    }
  }

  return SAMPLE_CATEGORIES;
}

export async function getCategoryBySlug(slug: string): Promise<SampleCategory | null> {
  const dbOnline = await isDatabaseReachable();

  if (dbOnline) {
    try {
      const cat = await prisma.category.findUnique({
        where: { slug },
      });
      if (cat) {
        return {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description || "",
          image: cat.image || "",
          icon: cat.icon || "Folder",
          isFeatured: cat.isFeatured,
        };
      }
    } catch (err) {}
  }

  const sample = SAMPLE_CATEGORIES.find((c) => c.slug === slug);
  return sample || null;
}
