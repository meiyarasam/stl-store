"use client";

import React from "react";
import { ProductDTO } from "@/types";
import { ProductCard } from "./ProductCard";
import { AlertCircle, RotateCcw } from "lucide-react";

interface ProductGridProps {
  products: ProductDTO[];
  emptyMessage?: string;
  error?: string | null;
}

export function ProductGrid({
  products,
  emptyMessage = "No 3D models found matching your criteria.",
  error = null,
}: ProductGridProps) {
  if (error) {
    return (
      <div className="text-center py-16 bg-red-50/60 border border-red-200 rounded-xl px-4 max-w-lg mx-auto">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-100 text-red-600 mb-3">
          <AlertCircle className="w-5 h-5" />
        </div>
        <p className="text-zinc-900 font-bold text-sm mb-1">Unable to Load 3D Models</p>
        <p className="text-zinc-600 text-xs mb-4">
          A temporary database connection delay occurred. Please refresh the page to retry.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-950 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Retry
        </button>
      </div>
    );
  }

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
