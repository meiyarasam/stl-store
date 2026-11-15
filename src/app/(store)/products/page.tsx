import React from "react";
import Link from "next/link";
import { getAllProducts } from "@/lib/database/products";
import { getAllCategories } from "@/lib/database/categories";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Search, SlidersHorizontal } from "lucide-react";

export const revalidate = 60;

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

  const [products, categories] = await Promise.all([
    getAllProducts({
      categorySlug: category,
      search,
      featuredOnly: featured === "true",
      sort,
    }),
    getAllCategories(),
  ]);

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

      {/* Filters & Sorting Bar */}
      <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <form method="GET" action="/products" className="relative w-full md:w-80">
          <input
            type="text"
            name="search"
            defaultValue={search || ""}
            placeholder="Search designs or keywords..."
            className="w-full bg-white border border-zinc-300 text-xs rounded-lg pl-9 pr-4 py-2.5 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-950"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
          {category && <input type="hidden" name="category" value={category} />}
        </form>

        {/* Categories Navigation Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <Link
            href="/products"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              !category && featured !== "true"
                ? "bg-zinc-950 text-white"
                : "bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-100"
            }`}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/products?category=${c.slug}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                category === c.slug
                  ? "bg-zinc-950 text-white"
                  : "bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-100"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2 self-end md:self-auto text-xs text-zinc-500">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sort by:</span>
          <div className="flex gap-1">
            <Link
              href={`/products?${category ? `category=${category}&` : ""}${search ? `search=${search}&` : ""}sort=newest`}
              className={`px-2.5 py-1 rounded text-xs font-medium ${
                sort === "newest" ? "bg-zinc-900 text-white" : "text-zinc-600 hover:text-zinc-950"
              }`}
            >
              Newest
            </Link>
            <Link
              href={`/products?${category ? `category=${category}&` : ""}${search ? `search=${search}&` : ""}sort=popular`}
              className={`px-2.5 py-1 rounded text-xs font-medium ${
                sort === "popular" ? "bg-zinc-900 text-white" : "text-zinc-600 hover:text-zinc-950"
              }`}
            >
              Popular
            </Link>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
        <span>Showing {products.length} models</span>
        {search && (
          <span>
            Search query: <strong className="text-zinc-900">"{search}"</strong>
          </span>
        )}
      </div>

      {/* Product Grid */}
      <ProductGrid products={products} />
    </div>
  );
}

