import React from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { SampleCategory } from "@/data/sampleProducts";

interface ProductFiltersProps {
  categories: SampleCategory[];
  currentCategory?: string;
  currentSearch?: string;
  currentSort?: string;
}

export function ProductFilters({
  categories,
  currentCategory,
  currentSearch,
  currentSort = "newest",
}: ProductFiltersProps) {
  return (
    <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 flex flex-col md:flex-row gap-4 items-center justify-between">
      {/* Search Input */}
      <form method="GET" action="/products" className="relative w-full md:w-80">
        <input
          type="text"
          name="search"
          defaultValue={currentSearch || ""}
          placeholder="Search designs or keywords..."
          className="w-full bg-white border border-zinc-300 text-xs rounded-lg pl-9 pr-4 py-2.5 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-950"
        />
        <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
        {currentCategory && <input type="hidden" name="category" value={currentCategory} />}
      </form>

      {/* Categories Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
        <Link
          href="/products"
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            !currentCategory
              ? "bg-zinc-950 text-white"
              : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100"
          }`}
        >
          All Categories
        </Link>
        {categories.slice(0, 5).map((cat) => (
          <Link
            key={cat.id}
            href={`/products?category=${cat.slug}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              currentCategory === cat.slug
                ? "bg-zinc-950 text-white"
                : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100"
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Sorting */}
      <div className="flex items-center gap-2 self-end md:self-auto">
        <span className="text-xs text-zinc-500 whitespace-nowrap">Sort By:</span>
        <form method="GET" action="/products">
          {currentCategory && <input type="hidden" name="category" value={currentCategory} />}
          {currentSearch && <input type="hidden" name="search" value={currentSearch} />}
          <select
            name="sort"
            defaultValue={currentSort}
            onChange={(e) => e.target.form?.submit()}
            className="bg-white border border-zinc-300 text-xs text-zinc-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-zinc-950 cursor-pointer"
          >
            <option value="newest">Newest Releases</option>
            <option value="popular">Most Downloaded</option>
          </select>
        </form>
      </div>
    </div>
  );
}
export default ProductFilters;
