import prisma from "@/lib/database/prisma";
import { SAMPLE_CATEGORIES, SampleCategory } from "@/lib/data/sampleProducts";

export async function getAllCategories(): Promise<SampleCategory[]> {
  try {
    const dbCats = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
    });
    if (dbCats && dbCats.length > 0) {
      return dbCats.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description || "",
        image: c.image || "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80",
        icon: c.icon || "Folder",
        isFeatured: c.isFeatured,
      }));
    }
  } catch (err) {
    console.warn("Categories database fetch fallback:", err);
  }

  return SAMPLE_CATEGORIES;
}

export async function getCategoryBySlug(slug: string): Promise<SampleCategory | null> {
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
  } catch (err) {
    // fallback
  }

  return SAMPLE_CATEGORIES.find((c) => c.slug === slug) || null;
}

