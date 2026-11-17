import React from "react";
import Link from "next/link";
import { getAllProducts } from "@/services/product.service";
import { getAllCategories } from "@/services/product.service";
import { ProductGrid } from "@/components/products/ProductGrid";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface ProductsPageProps {
  searchParams: {
    category?: string;
    search?: string;
    sort?: "newest" | "price-asc" | "price-desc" | "popular";
    featured?: string;
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { category, search, sort = "newest", featured } = searchParams;

  let products: any[] = [];
  let categories: any[] = [];
  let loadError: string | null = null;

  try {
    const results = await Promise.all([
      getAllProducts({
        categorySlug: category,
        search,
        featuredOnly: featured === "true",
        sort,
      }),
      getAllCategories(),
    ]);
    products = results[0];
    categories = results[1];
  } catch (err: any) {
    console.error("ProductsPage data fetch error:", err);
    loadError = err?.message || "Failed to load products from database";
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title & Breadcrumb */}
      <div>
        <div className="text-xs text-zinc-500 mb-1 flex items-center gap-1.5 font-medium">
          <Link href="/" className="hover:text-zinc-900">
            Home
          </Link>
          <span>/</span>
          <span className="text-zinc-900">3D Models</span>
          {category && (
            <>
              <span>/</span>
              <span className="text-zinc-900 capitalize">
                {categories.find((c) => c.slug === category)?.name || category}
              </span>
            </>
          )}
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-zinc-950 tracking-tight font-display">
          {category
            ? categories.find((c) => c.slug === category)?.name || "Category Products"
            : featured === "true"
            ? "Featured 3D Designs"
            : "Explore All 3D Models"}
        </h1>
        <p className="text-sm text-zinc-500 mt-1 max-w-2xl">
          High-precision digital STL and ZIP packages ready for download and immediate printing.
        </p>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
        <span>Showing {products.length} models</span>
        {search && (
          <span>
            Search query: <strong className="text-zinc-900">&quot;{search}&quot;</strong>
          </span>
        )}
      </div>

      {/* Product Grid */}
      <ProductGrid products={products} error={loadError} />
    </div>
  );
}
