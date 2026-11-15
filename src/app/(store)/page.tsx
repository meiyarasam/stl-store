import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getAllProducts } from "@/lib/database/products";
import { getAllCategories } from "@/lib/database/categories";
import { ProductGrid } from "@/components/products/ProductGrid";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Download,
  Sliders,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export const revalidate = 60; // ISR cache 60s

export default async function HomePage() {
  const [allProducts, categories] = await Promise.all([
    getAllProducts(),
    getAllCategories(),
  ]);

  const featuredProducts = allProducts.filter((p) => p.isFeatured).slice(0, 6);
  const newArrivals = allProducts.slice(0, 3);
  const bestSellers = [...allProducts]
    .sort((a, b) => b.downloadCount - a.downloadCount)
    .slice(0, 3);

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative bg-zinc-950 text-white overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 opacity-20">
          <Image
            src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=2000&q=80"
            alt="3D Printing Mesh Background"
            fill
            priority
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/90 to-zinc-950/50" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>International Digital STL Marketplace</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight font-display">
              Bring Your Ideas <br className="hidden sm:inline" />
              <span className="text-zinc-400">to Life.</span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-300 leading-relaxed max-w-xl">
              Discover premium 3D printable designs. Download, print and create
              something extraordinary. Watertight manifold STLs optimized for
              both FDM and SLA resin printing.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-white text-zinc-950 font-bold hover:bg-zinc-100 transition-colors shadow-lg"
              >
                Explore Collection <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/categories"
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-medium hover:bg-zinc-800 transition-colors"
              >
                Browse Categories
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="pt-6 border-t border-zinc-800/80 grid grid-cols-3 gap-4 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>100% Manifold STLs</span>
              </div>
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-zinc-300 flex-shrink-0" />
                <span>Instant Download</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Verified Print Tested</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Hand-picked
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
              Featured 3D Models
            </h2>
          </div>
          <Link
            href="/products?featured=true"
            className="text-sm font-semibold text-zinc-700 hover:text-zinc-950 flex items-center gap-1 group"
          >
            View All <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <ProductGrid products={featuredProducts} />
      </section>

      {/* Popular Categories */}
      <section className="bg-zinc-50 border-y border-zinc-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Catalog Navigation
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight mt-1">
              Popular Categories
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-2">
              Browse designs tailored specifically for functional mechanics, high-detail display miniatures, or modern home decor.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="group relative rounded-xl overflow-hidden border border-zinc-200 bg-white hover:shadow-md transition-all duration-200"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-100">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-lg font-bold text-white group-hover:text-zinc-200 transition-colors">
                      {cat.name}
                    </h3>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                  <div className="mt-3 flex items-center text-xs font-semibold text-zinc-950 group-hover:underline">
                    Explore Models <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Community Favorites
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
              Best Selling Designs
            </h2>
          </div>
          <Link
            href="/products?sort=popular"
            className="text-sm font-semibold text-zinc-700 hover:text-zinc-950 flex items-center gap-1 group"
          >
            Browse Popular <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <ProductGrid products={bestSellers} />
      </section>

      {/* Why Choose STLForge */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-zinc-900 text-white p-8 sm:p-14 border border-zinc-800">
          <div className="max-w-2xl mb-10">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Engineering Standard
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight mt-1">
              Why Makers Choose STLForge
            </h2>
            <p className="text-sm text-zinc-300 mt-2 leading-relaxed">
              We eliminate failed prints by subjecting every uploaded digital model to rigorous physical and digital manifold verification before listing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-white font-bold">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-base font-bold text-white">
                Watertight & Manifold Geometry
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Zero reversed normals, zero non-manifold edges, and clean triangle topologies verified through slicer automation.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-white font-bold">
                <Sliders className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-base font-bold text-white">
                Tested Print Settings
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Every model includes recommended layer heights, infill patterns, nozzle temperatures, and tree support recommendations.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-white font-bold">
                <Zap className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-base font-bold text-white">
                Global Multi-Currency Checkout
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Fair, transparent native currency pricing in INR, USD, EUR, GBP, CAD, AUD and JPY with instant authenticated downloads.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-8 sm:p-12 text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Stay Updated
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
            Never Miss a New 3D Design Release
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 max-w-md mx-auto">
            Get notified when new print-in-place mechanisms, collectible busts, and seasonal 3D models drop on STLForge.
          </p>

          <form
            action="#"
            className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2"
          >
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 bg-white border border-zinc-300 text-sm rounded-lg px-4 py-2.5 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950"
              required
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-zinc-950 text-white font-semibold text-sm hover:bg-zinc-800 transition-colors shadow-sm"
            >
              Subscribe
            </button>
          </form>
          <p className="text-[11px] text-zinc-400">
            No spam. We respect your inbox privacy. Unsubscribe anytime.
          </p>
        </div>
      </section>
    </div>
  );
}
