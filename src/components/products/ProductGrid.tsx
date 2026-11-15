import React from "react";
import { ProductDTO } from "@/types";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: ProductDTO[];
  emptyMessage?: string;
}

export function ProductGrid({
  products,
  emptyMessage = "No 3D models found matching your criteria.",
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16 bg-zinc-50 border border-zinc-200 rounded-xl px-4">
        <p className="text-zinc-600 font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

