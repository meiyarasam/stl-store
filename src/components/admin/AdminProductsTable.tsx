"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, Edit, Trash2, Check, AlertCircle, CheckCircle2, Loader2, X, Plus, Search } from "lucide-react";
import { ProductDTO } from "@/types";
import { safeFetchJson } from "@/lib/api/safeFetch";

interface AdminProductsTableProps {
  initialProducts: ProductDTO[];
}

export function AdminProductsTable({ initialProducts }: AdminProductsTableProps) {
  const [products, setProducts] = useState<ProductDTO[]>(initialProducts);
  const [searchFilter, setSearchFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Deletion modal state
  const [productToDelete, setProductToDelete] = useState<ProductDTO | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // Filter products by search and category
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !searchFilter.trim() ||
      p.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchFilter.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || p.category?.slug === categoryFilter || p.categoryId === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Extract unique categories
  const categories = Array.from(
    new Map(
      products
        .map((p) => p.category)
        .filter(Boolean)
        .map((cat) => [cat!.slug, cat!])
    ).values()
  );

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    setNotification(null);

    try {
      const res = await safeFetchJson<{ deletedId: string; title: string }>(
        `/api/admin/products/${productToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      if (!res.success) {
        throw new Error(res.error || res.message || "Failed to delete product.");
      }

      // Remove product from state immediately
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));

      setNotification({
        text: `Product "${productToDelete.title}" has been permanently deleted.`,
        type: "success",
      });

      setProductToDelete(null);
    } catch (err: any) {
      setNotification({
        text: err.message || "An unexpected error occurred while deleting the product.",
        type: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header controls: Add button & search/filter bar */}
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

      {/* Notification Toast Banner */}
      {notification && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between gap-2.5 transition-all shadow-sm ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            )}
            <span className="font-semibold">{notification.text}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-zinc-400 hover:text-zinc-600 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Search and Category Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 border border-zinc-200 rounded-xl shadow-2xs">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search products by title or slug..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:bg-white"
          />
        </div>

        {categories.length > 0 && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[11px] text-zinc-400 font-medium">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-zinc-950 font-medium text-zinc-700"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Product Table */}
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
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    <p className="text-sm font-semibold">No products found</p>
                    <p className="text-xs text-zinc-400 mt-1">
                      {searchFilter
                        ? "Try clearing your search query."
                        : "Click 'Add New 3D Model' to publish your first product."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const primaryImg =
                    p.images?.find((i) => i.isPrimary)?.url || p.images?.[0]?.url || "";
                  const inrPrice = p.prices?.find((pr) => pr.currency === "INR")?.amount || 0;
                  const usdPrice = p.prices?.find((pr) => pr.currency === "USD")?.amount || 0;
                  const eurPrice = p.prices?.find((pr) => pr.currency === "EUR")?.amount || 0;

                  return (
                    <tr key={p.id} className="hover:bg-zinc-50/50 transition-colors">
                      {/* 1. Item */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-zinc-100 flex-shrink-0 border border-zinc-200 shadow-2xs">
                            {primaryImg ? (
                              <Image
                                src={primaryImg}
                                alt={p.title}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-400 font-bold">
                                3D
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-zinc-900 block line-clamp-1">
                              {p.title}
                            </span>
                            <span className="text-[11px] text-zinc-400 font-mono truncate block">
                              /{p.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Category */}
                      <td className="py-3.5 px-4 text-zinc-600 font-medium">
                        {p.category?.name || "General"}
                      </td>

                      {/* 3. Configured Prices */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-800 space-y-0.5 whitespace-nowrap">
                        <div>
                          USD: <strong className="text-zinc-950">${usdPrice.toFixed(2)}</strong>
                        </div>
                        <div>
                          INR: <strong className="text-zinc-950">₹{inrPrice}</strong>
                        </div>
                        <div>
                          EUR: <strong className="text-zinc-950">€{eurPrice.toFixed(2)}</strong>
                        </div>
                      </td>

                      {/* 4. Downloads */}
                      <td className="py-3.5 px-4 font-mono font-bold text-zinc-900">
                        {p.downloadCount || 0}
                      </td>

                      {/* 5. Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {p.isPublished ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <Check className="w-3 h-3" /> Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-full border border-zinc-200">
                            Draft
                          </span>
                        )}
                      </td>

                      {/* 6. Actions: Preview, Edit, Delete */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1 sm:gap-1.5">
                          {/* Preview Product in Store */}
                          <Link
                            href={`/products/${p.slug}`}
                            className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                            title="Preview Store Page"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          {/* Edit Product */}
                          <Link
                            href={`/admin/products/${p.id}/edit`}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Product Details & Pricing"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          {/* Delete Product */}
                          <button
                            type="button"
                            onClick={() => setProductToDelete(p)}
                            className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal for Product Deletion */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2 text-red-600">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-950">Confirm Product Deletion</h3>
                  <p className="text-[11px] text-zinc-500">This action cannot be undone.</p>
                </div>
              </div>
              <button
                onClick={() => setProductToDelete(null)}
                disabled={isDeleting}
                className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3 flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-lg bg-zinc-200 overflow-hidden flex-shrink-0">
                {productToDelete.images?.[0]?.url ? (
                  <Image
                    src={productToDelete.images[0].url}
                    alt={productToDelete.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-zinc-400">
                    3D
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-zinc-900 truncate">{productToDelete.title}</p>
                <p className="text-[11px] text-zinc-500 font-mono">/{productToDelete.slug}</p>
                <p className="text-[10px] text-zinc-400 mt-0.5">
                  Category: {productToDelete.category?.name || "General"}
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">
              Are you sure you want to delete this product? All associated prices, preview images, and downloadable STL archives will be permanently removed from the database and storage.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-lg transition-colors shadow-sm disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Product</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
