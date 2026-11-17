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

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  let allProducts: any[] = [];
  let categories: any[] = [];
  let loadError: string | null = null;

  try {
    const results = await Promise.all([
      getAllProducts(),
      getAllCategories(),
    ]);
    allProducts = results[0];
    categories = results[1];
  } catch (err: any) {
    console.error("HomePage data fetch error:", err);
    loadError = err?.message || "Failed to load products from database";
  }

  // Featured 3D Models: prioritize explicitly featured designs, and fill with latest additions
  const explicitlyFeatured = allProducts.filter((p) => p.isFeatured);
  const otherProducts = allProducts.filter((p) => !p.isFeatured);
  const featuredProducts =
    explicitlyFeatured.length > 0
      ? [...explicitlyFeatured, ...otherProducts].slice(0, 6)
      : allProducts.slice(0, 6);

  const newArrivals = allProducts.slice(0, 6);
  const bestSellers = [...allProducts]
    .sort((a, b) => b.downloadCount - a.downloadCount)
    .slice(0, 6);

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-zinc-100/90 via-zinc-50 to-white text-zinc-950 overflow-hidden py-16 sm:py-24 border-b border-zinc-200">
        {/* Subtle technical 3D grid pattern */}
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px]" />
        
        {/* Soft atmospheric ambient light */}
        <div className="absolute -top-32 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-zinc-200/60 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading & CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-zinc-300 text-xs font-semibold text-zinc-800 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>International Digital STL Marketplace</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-zinc-950 font-display">
                Bring Your Ideas <br className="hidden sm:inline" />
                <span className="text-zinc-500">to Life.</span>
              </h1>

              <p className="text-base sm:text-lg text-zinc-600 leading-relaxed max-w-xl">
                Discover premium 3D printable designs. Download, print and create
                something extraordinary. Watertight manifold STLs optimized for
                both FDM and SLA resin printing.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-zinc-950 text-white font-bold hover:bg-zinc-800 transition-colors shadow-md hover:shadow-lg"
                >
                  Explore Collection <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/categories"
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-lg bg-white border border-zinc-300 text-zinc-900 font-semibold hover:bg-zinc-100 transition-colors shadow-sm"
                >
                  Browse Categories
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-zinc-200 grid grid-cols-3 gap-4 text-xs text-zinc-600">
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>100% Manifold STLs</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <Download className="w-4 h-4 text-zinc-700 flex-shrink-0" />
                  <span>Instant Download</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Verified Print Tested</span>
                </div>
              </div>
            </div>

            {/* Right Column: Visual 3D Showcase Card */}
            <div className="lg:col-span-5 hidden lg:block">
              <div className="relative rounded-2xl bg-white border border-zinc-200/90 shadow-xl overflow-hidden p-3 transition-transform hover:-translate-y-1 duration-300">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-zinc-100">
                  <Image
                    src="https://images.unsplash.com/photo-1615655406736-b37c4fabf923?auto=format&fit=crop&w=1000&q=80"
                    alt="Precision 3D Printed Design Showcase"
                    fill
                    priority
                    className="object-cover"
                  />
                </div>
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

        <ProductGrid products={featuredProducts} error={loadError} />
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

        <ProductGrid products={bestSellers} error={loadError} />
      </section>

      {/* Why Choose The Print Factory */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-zinc-100/70 text-zinc-950 p-8 sm:p-14 border border-zinc-200">
          <div className="max-w-2xl mb-10">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Engineering Standard
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-zinc-950 font-display mt-1">
              Why Makers Choose The Print Factory
            </h2>
            <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
              We eliminate failed prints by subjecting every uploaded digital model to rigorous physical and digital manifold verification before listing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-base font-bold text-zinc-950">
                Watertight & Manifold Geometry
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Zero reversed normals, zero non-manifold edges, and clean triangle topologies verified through slicer automation.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold">
                <Sliders className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-base font-bold text-zinc-950">
                Tested Print Settings
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Every model includes recommended layer heights, infill patterns, nozzle temperatures, and tree support recommendations.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-base font-bold text-zinc-950">
                Global Multi-Currency Checkout
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
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
            Get notified when new print-in-place mechanisms, collectible busts, and seasonal 3D models drop on The Print Factory.
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
