import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { getAllCategories } from "@/lib/database/categories";
import { FolderTree, Plus, Eye } from "lucide-react";

export default async function AdminCategoriesPage() {
  const session = await getServerSession(authOptions);

  if ((session?.user as any)?.role !== "ADMIN" && process.env.NODE_ENV === "production") {
    redirect("/login?callbackUrl=/admin/categories");
  }

  const categories = await getAllCategories();

  return (
    <div className="min-h-screen bg-zinc-50/50">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight font-display">
              Category Organization ({categories.length})
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Classify 3D models into functional, miniature, and artistic collections.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((c) => (
            <div
              key={c.id}
              className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden bg-zinc-100 border border-zinc-100">
                  <Image
                    src={c.image}
                    alt={c.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-950">{c.name}</h3>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    slug: /{c.slug}
                  </span>
                  <p className="text-xs text-zinc-600 mt-1 line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Active in Navigation
                </span>
                <Link
                  href={`/categories/${c.slug}`}
                  className="font-semibold text-zinc-700 hover:text-zinc-950 flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> View Public
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

