import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { getAllProducts } from "@/lib/database/products";
import { Plus, Check, Eye, Trash2, Edit } from "lucide-react";

export default async function AdminProductsPage() {
  const session = await getServerSession(authOptions);

  if ((session?.user as any)?.role !== "ADMIN" && process.env.NODE_ENV === "production") {
    redirect("/login?callbackUrl=/admin/products");
  }

  const products = await getAllProducts();

  return (
    <div className="min-h-screen bg-zinc-50/50">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight font-display">
              Product Management ({products.length})
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Manage 3D models, multi-currency price points, and downloadable STL archives.
            </p>
          </div>

          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-950 text-white rounded-lg text-xs font-bold hover:bg-zinc-800 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Add New 3D Model
          </Link>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Configured Prices</th>
                  <th className="py-3 px-4">Downloads</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {products.map((p) => {
                  const primaryImg = p.images?.find((i) => i.isPrimary)?.url || p.images?.[0]?.url || "";
                  const inrPrice = p.prices?.find((pr) => pr.currency === "INR")?.amount || 0;
                  const usdPrice = p.prices?.find((pr) => pr.currency === "USD")?.amount || 0;
                  const eurPrice = p.prices?.find((pr) => pr.currency === "EUR")?.amount || 0;

                  return (
                    <tr key={p.id} className="hover:bg-zinc-50/50">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {primaryImg && (
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-zinc-100 flex-shrink-0 border border-zinc-200">
                              <Image
                                src={primaryImg}
                                alt={p.title}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-zinc-900 block line-clamp-1">
                              {p.title}
                            </span>
                            <span className="text-[11px] text-zinc-400 font-mono">
                              /{p.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-zinc-600 font-medium">
                        {p.category?.name || "General"}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-800 space-y-0.5">
                        <div>
                          USD: <strong className="text-zinc-950">${usdPrice}</strong>
                        </div>
                        <div>
                          INR: <strong className="text-zinc-950">₹{inrPrice}</strong>
                        </div>
                        <div>
                          EUR: <strong className="text-zinc-950">€{eurPrice}</strong>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-zinc-900">
                        {p.downloadCount}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <Check className="w-3 h-3" /> Published
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/products/${p.slug}`}
                            className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded"
                            title="Preview Store Page"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
