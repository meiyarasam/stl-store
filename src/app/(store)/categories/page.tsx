import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getAllCategories } from "@/lib/database/categories";
import { ArrowRight, Layers } from "lucide-react";

export const revalidate = 60;

export default async function CategoriesPage() {
  const categories = await getAllCategories();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div>
        <div className="text-xs text-zinc-500 mb-1 flex items-center gap-1.5 font-medium">
          <Link href="/" className="hover:text-zinc-900">
            Home
          </Link>
          <span>/</span>
          <span className="text-zinc-900">Categories</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-zinc-950 tracking-tight font-display">
          Browse by Category
        </h1>
        <p className="text-sm text-zinc-500 mt-1 max-w-2xl">
          Explore specialized collections designed for mechanical functional prints, tabletop miniatures, wearable cosplay, and ambient home decor.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className="group flex flex-col bg-white rounded-xl border border-zinc-200 overflow-hidden hover:shadow-lg transition-all duration-200"
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-100">
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Category
                </span>
                <h3 className="text-xl font-bold text-white group-hover:text-zinc-200 transition-colors">
                  {cat.name}
                </h3>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              <p className="text-xs text-zinc-600 leading-relaxed">
                {cat.description}
              </p>
              <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs font-semibold text-zinc-950">
                <span>View Models</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

