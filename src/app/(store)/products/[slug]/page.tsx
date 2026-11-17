import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getAllProducts } from "@/services/product.service";
import { ProductGallery } from "@/components/products/ProductGallery";
import { PrintSpecsTable } from "@/components/products/PrintSpecsTable";
import { ProductPurchaseCard } from "@/components/products/ProductPurchaseCard";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Download, Eye, Layers } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface ProductDetailsPageProps {
  params: {
    slug: string;
  };
}

export default async function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  // Related products in same category
  const allProducts = await getAllProducts();
  const relatedProducts = allProducts
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 sm:space-y-12 w-full max-w-full overflow-x-hidden">
      {/* Breadcrumb */}
      <nav className="text-xs text-zinc-500 flex items-center gap-1.5 font-medium overflow-x-auto py-1 scrollbar-none">
        <Link href="/" className="hover:text-zinc-900 shrink-0">
          Home
        </Link>
        <span className="shrink-0">/</span>
        <Link href="/products" className="hover:text-zinc-900 shrink-0">
          Products
        </Link>
        {product.category && (
          <>
            <span className="shrink-0">/</span>
            <Link
              href={`/categories/${product.category.slug}`}
              className="hover:text-zinc-900 shrink-0"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <span className="shrink-0">/</span>
        <span className="text-zinc-900 truncate max-w-xs">{product.title}</span>
      </nav>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
        {/* Left Column: Gallery & In-Depth Specs */}
        <div className="lg:col-span-7 space-y-10">
          <ProductGallery images={product.images} title={product.title} />

          {/* Description Section */}
          <div className="space-y-4 pt-4 border-t border-zinc-200">
            <h2 className="text-xl font-bold text-zinc-950 font-display">
              Design Overview
            </h2>
            <div className="prose prose-zinc prose-sm max-w-none text-zinc-600 leading-relaxed whitespace-pre-wrap">
              {product.fullDescription}
            </div>
          </div>

          {/* Printing Specifications & Slicer Parameters */}
          <div className="space-y-4 pt-6 border-t border-zinc-200">
            <h2 className="text-xl font-bold text-zinc-950 font-display">
              3D Printing & Technical Specifications
            </h2>
            <PrintSpecsTable product={product} />
          </div>
        </div>

        {/* Right Column: Sticky Purchase Details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="lg:sticky lg:top-24 space-y-6">
            <div>
              {product.category && (
                <Link
                  href={`/categories/${product.category.slug}`}
                  className="text-xs font-bold text-zinc-500 uppercase tracking-wider hover:text-zinc-900"
                >
                  {product.category.name}
                </Link>
              )}
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight mt-1 font-display">
                {product.title}
              </h1>
              <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
                {product.shortDescription}
              </p>

              {/* Stats badges */}
              <div className="flex items-center gap-4 mt-4 text-xs text-zinc-500">
                <span className="flex items-center gap-1 font-medium">
                  <Download className="w-3.5 h-3.5 text-zinc-700" />
                  {product.downloadCount} Downloads
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <Eye className="w-3.5 h-3.5 text-zinc-700" />
                  {product.viewCount} Views
                </span>
                <span className="flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                  <Layers className="w-3.5 h-3.5" /> Ready to Print
                </span>
              </div>
            </div>

            {/* Client Interactive Purchase Card */}
            <ProductPurchaseCard product={product} />

            {/* Licence Box */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-xs text-zinc-600 space-y-1.5">
              <span className="font-bold text-zinc-900 block">Digital Licence Notice</span>
              <p className="leading-relaxed">
                Purchasing grants a non-exclusive, non-transferable personal use licence.
                Reselling, sublicensing, or distributing the digital STL/ZIP source files is strictly prohibited.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="pt-16 border-t border-zinc-200 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-zinc-950 tracking-tight font-display">
              You Might Also Like
            </h2>
            <Link
              href={`/categories/${product.category?.slug || "all"}`}
              className="text-xs font-semibold text-zinc-600 hover:text-zinc-950"
            >
              Browse More in {product.category?.name} →
            </Link>
          </div>
          <ProductGrid products={relatedProducts} />
        </div>
      )}
    </div>
  );
}

