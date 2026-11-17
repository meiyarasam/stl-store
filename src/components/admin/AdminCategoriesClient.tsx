"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, X, Layers, ShieldAlert } from "lucide-react";
import { CategoryDTO } from "@/types";
import { safeFetchJson } from "@/lib/api/safeFetch";

interface AdminCategoriesClientProps {
  initialCategories: CategoryDTO[];
}

export function AdminCategoriesClient({ initialCategories }: AdminCategoriesClientProps) {
  const [categories, setCategories] = useState<CategoryDTO[]>(initialCategories);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const activeCount = categories.filter((c) => c.isActive).length;
  const inactiveCount = categories.filter((c) => !c.isActive).length;

  const filteredCategories = categories.filter((c) => {
    if (filter === "active") return c.isActive;
    if (filter === "inactive") return !c.isActive;
    return true;
  });

  const handleToggle = async (cat: CategoryDTO) => {
    const nextState = !cat.isActive;
    setTogglingId(cat.id);
    setNotification(null);

    // Optimistic state update
    setCategories((prev) =>
      prev.map((item) => (item.id === cat.id ? { ...item, isActive: nextState } : item))
    );

    try {
      const res = await safeFetchJson<{ category: CategoryDTO }>(
        `/api/admin/categories/${cat.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: nextState }),
        }
      );

      if (!res.success) {
        throw new Error(res.error || res.message || "Failed to update category visibility.");
      }

      setNotification({
        text: `Category "${cat.name}" is now ${nextState ? "ON (Visible to Public)" : "OFF (Hidden from Public)"}.`,
        type: "success",
      });
    } catch (err: any) {
      // Revert optimistic state on error
      setCategories((prev) =>
        prev.map((item) => (item.id === cat.id ? { ...item, isActive: cat.isActive } : item))
      );
      setNotification({
        text: err.message || "Failed to update category status.",
        type: "error",
      });
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header info & Filter toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight font-display">
            Category Visibility & Organization ({categories.length})
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Control public visibility and catalog navigation with instant ON/OFF switches.
          </p>
        </div>

        {/* Visibility filter tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-200/60 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === "all"
                ? "bg-white text-zinc-950 shadow-xs font-bold"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            All ({categories.length})
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
              filter === "active"
                ? "bg-white text-emerald-800 shadow-xs font-bold"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            ON ({activeCount})
          </button>
          <button
            onClick={() => setFilter("inactive")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
              filter === "inactive"
                ? "bg-white text-zinc-950 shadow-xs font-bold"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-zinc-400" />
            OFF ({inactiveCount})
          </button>
        </div>
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
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span className="font-semibold">{notification.text}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-zinc-400 hover:text-zinc-600 p-1"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((c) => {
          const isPending = togglingId === c.id;

          return (
            <div
              key={c.id}
              className={`bg-white border rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between transition-all ${
                c.isActive
                  ? "border-zinc-200"
                  : "border-zinc-300 bg-zinc-50/70 opacity-90"
              }`}
            >
              <div className="space-y-3">
                {/* Category Preview Image */}
                <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200/80">
                  <Image
                    src={c.image || "/images/logo.png"}
                    alt={c.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className={`object-cover transition-all ${!c.isActive ? "grayscale" : ""}`}
                  />
                  {!c.isActive && (
                    <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-[1px] flex items-center justify-center">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-zinc-900 text-white tracking-wider uppercase border border-zinc-700 shadow-sm flex items-center gap-1.5">
                        <EyeOff className="w-3.5 h-3.5 text-zinc-300" />
                        Hidden from Store
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-bold text-zinc-950 truncate">{c.name}</h3>
                    {c.isFeatured && (
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 shrink-0">
                        Featured
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    slug: /{c.slug}
                  </span>
                  <p className="text-xs text-zinc-600 mt-1 line-clamp-2 leading-relaxed">
                    {c.description || "No description provided."}
                  </p>
                </div>
              </div>

              {/* Status and ON/OFF Toggle Section */}
              <div className="pt-3 border-t border-zinc-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-zinc-700">Visibility:</span>
                    {c.isActive ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                        ON (Public)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-zinc-200 text-zinc-700 border border-zinc-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                        OFF (Hidden)
                      </span>
                    )}
                  </div>

                  {/* Accessible ON/OFF Toggle Switch */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={c.isActive}
                    disabled={isPending}
                    onClick={() => handleToggle(c)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                      c.isActive ? "bg-emerald-600" : "bg-zinc-300"
                    }`}
                    title={`Click to turn ${c.isActive ? "OFF" : "ON"}`}
                  >
                    <span className="sr-only">Toggle {c.name} visibility</span>
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
                        c.isActive ? "translate-x-5" : "translate-x-0"
                      }`}
                    >
                      {isPending && <Loader2 className="w-3 h-3 animate-spin text-zinc-500" />}
                    </span>
                  </button>
                </div>

                {/* Footer Action Links */}
                <div className="flex items-center justify-between text-xs pt-1 text-zinc-500">
                  <span className="text-[11px] font-medium text-zinc-400">
                    {c.productCount ?? 0} active models
                  </span>

                  {c.isActive ? (
                    <Link
                      href={`/categories/${c.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-zinc-700 hover:text-zinc-950 flex items-center gap-1 hover:underline text-xs"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Public Page
                    </Link>
                  ) : (
                    <span className="text-[11px] text-zinc-400 italic flex items-center gap-1">
                      <EyeOff className="w-3 h-3" /> Returns 404 to public
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-zinc-200 p-6 space-y-2">
          <Layers className="w-8 h-8 text-zinc-300 mx-auto" />
          <p className="text-xs font-bold text-zinc-700">No categories match the active filter.</p>
          <button
            onClick={() => setFilter("all")}
            className="text-xs text-blue-600 hover:underline font-semibold"
          >
            Show all categories
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminCategoriesClient;
