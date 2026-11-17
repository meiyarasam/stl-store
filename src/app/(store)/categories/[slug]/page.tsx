import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/lib/database/categories";
import { getAllProducts } from "@/lib/database/products";
import { ProductGrid } from "@/components/products/ProductGrid";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  let category: any = null;
  let products: any[] = [];
  let loadError: string | null = null;

  try {
    category = await getCategoryBySlug(params.slug);
    if (!category) {
      notFound();
    }
    products = await getAllProducts({ categorySlug: params.slug });
  } catch (err: any) {
    if (err?.message === "NEXT_NOT_FOUND" || err?.digest?.includes("NEXT_NOT_FOUND")) {
      throw err;
    }
    console.error(`CategoryPage (${params.slug}) data fetch error:`, err);
    loadError = err?.message || "Failed to load products for this category";
  }

  if (!category && !loadError) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="text-xs text-zinc-500 mb-1 flex items-center gap-1.5 font-medium">
          <Link href="/" className="hover:text-zinc-900">
            Home
          </Link>
          <span>/</span>
          <Link href="/categories" className="hover:text-zinc-900">
            Categories
          </Link>
          <span>/</span>
          <span className="text-zinc-900">{category?.name || params.slug}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-zinc-950 tracking-tight font-display">
          {category?.name || "Category Products"}
        </h1>
        {category?.description && (
          <p className="text-sm text-zinc-500 mt-1 max-w-2xl leading-relaxed">
            {category.description}
          </p>
        )}
      </div>

      <div className="border-t border-zinc-200 pt-6">
        <ProductGrid
          products={products}
          error={loadError}
          emptyMessage={`No 3D models currently listed in ${category?.name || "this category"}. Check back soon!`}
        />
      </div>
    </div>
  );
}

