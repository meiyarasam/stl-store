"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { DashboardMetrics } from "@/components/admin/DashboardMetrics";
import { AnalyticsCharts } from "@/components/admin/AnalyticsCharts";
import {
  Plus,
  ArrowRight,
  RefreshCw,
  ShoppingBag,
  Users,
  Box,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { AnalyticsSummary } from "@/services/analytics.service";

interface AdminDashboardClientProps {
  initialAnalytics: AnalyticsSummary;
}

export function AdminDashboardClient({ initialAnalytics }: AdminDashboardClientProps) {
  const [analytics, setAnalytics] = useState<AnalyticsSummary>(initialAnalytics);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshError(null);
    try {
      const res = await fetch("/api/admin/analytics", {
        headers: { "Cache-Control": "no-cache" },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to refresh real-time analytics.");
      }
      setAnalytics(data.analytics);
    } catch (err: any) {
      console.error("Failed to refresh analytics:", err);
      setRefreshError(err.message || "Could not fetch fresh data from database.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const formattedLastUpdated = new Date(analytics.lastUpdated).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="space-y-8">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight font-display">
            Platform Analytics
          </h1>
          <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1.5 flex-wrap">
            <span>Authoritative sales, multi-currency revenue, and digital download metrics from Supabase PostgreSQL.</span>
            <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400 font-mono" suppressHydrationWarning>
              · Synced at {formattedLastUpdated}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-zinc-300 hover:bg-zinc-50 rounded-lg text-xs font-semibold text-zinc-800 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
            title="Refresh database records"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-zinc-600 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh Data"}</span>
          </button>

          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-950 text-white rounded-lg text-xs font-bold hover:bg-zinc-800 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Add New 3D Model
          </Link>
        </div>
      </div>

      {refreshError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{refreshError}</span>
        </div>
      )}

      {/* Top 5 Real KPI Cards */}
      <DashboardMetrics
        summary={{
          totalRevenueINR: analytics.totalRevenueINR,
          totalRevenueUSD: analytics.totalRevenueUSD,
          totalOrders: analytics.totalOrders,
          paidOrdersCount: analytics.paidOrdersCount,
          pendingOrdersCount: analytics.pendingOrdersCount,
          totalCustomers: analytics.totalCustomers,
          totalProducts: analytics.totalProducts,
          totalDownloads: analytics.totalDownloads,
          totalDownloadCount: analytics.totalDownloadCount,
        }}
      />

      {/* Charts & Graphs */}
      <AnalyticsCharts
        dailySales={analytics.dailySales}
        countrySales={analytics.countrySales}
        currencyBreakdown={analytics.currencyBreakdown}
      />

      {/* 2-Column Split: Best Performing 3D Designs & Recent Registered Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Performing 3D Designs */}
        <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-zinc-950 flex items-center gap-2">
                <Box className="w-4 h-4 text-zinc-700" />
                Best-Selling 3D Models
              </h2>
              <Link
                href="/admin/products"
                className="text-xs font-semibold text-zinc-500 hover:text-zinc-950 flex items-center gap-1 transition-colors"
              >
                Catalog ({analytics.totalProducts}) <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {analytics.bestSellingProducts.length > 0 ? (
              <div className="divide-y divide-zinc-100">
                {analytics.bestSellingProducts.map((p) => (
                  <div key={p.productId} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {p.imageUrl ? (
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-zinc-100 flex-shrink-0 border border-zinc-200">
                          <Image src={p.imageUrl} alt={p.title} fill sizes="40px" className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400 flex-shrink-0">
                          <Box className="w-5 h-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="font-bold text-xs text-zinc-900 block truncate">{p.title}</span>
                        <span className="text-[11px] text-zinc-500 font-mono">{p.unitsSold} units sold</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="font-bold text-xs text-zinc-950 font-mono block">₹{p.revenueINR.toFixed(2)}</span>
                      <Link
                        href={`/products/${p.slug}`}
                        target="_blank"
                        className="text-[11px] text-blue-600 hover:underline inline-flex items-center gap-0.5"
                      >
                        View <ExternalLink className="w-2.5 h-2.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50">
                <Box className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-zinc-800">No Product Sales Recorded Yet</h4>
                <p className="text-[11px] text-zinc-400 max-w-xs mx-auto mt-0.5">
                  Your marketplace catalog has {analytics.totalProducts} live 3D models. Best-sellers will calculate here automatically once orders are completed.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Registered Customers */}
        <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-zinc-950 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                Recent Registered Customers
              </h2>
              <Link
                href="/admin/customers"
                className="text-xs font-semibold text-zinc-500 hover:text-zinc-950 flex items-center gap-1 transition-colors"
              >
                All Customers ({analytics.totalCustomers}) <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {analytics.recentCustomers.length > 0 ? (
              <div className="divide-y divide-zinc-100">
                {analytics.recentCustomers.map((c) => (
                  <div key={c.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <span className="font-bold text-zinc-900 block truncate">{c.name || "Customer"}</span>
                      <span className="text-zinc-500 text-[11px] font-mono truncate block">{c.email}</span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-[11px] text-zinc-500 font-mono block" suppressHydrationWarning>
                        {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {c.ordersCount} orders · {c.downloadsCount} dl
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50">
                <Users className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-zinc-800">No Customers Registered Yet</h4>
                <p className="text-[11px] text-zinc-400 max-w-xs mx-auto mt-0.5">
                  Registered customer accounts will appear here in real-time.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-zinc-950 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              Latest Orders from Database
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Real transactions recorded in Supabase PostgreSQL
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-zinc-600 hover:text-zinc-950 flex items-center gap-1 transition-colors"
          >
            View All ({analytics.totalOrders}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {analytics.recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-3">Order Number</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Country</th>
                  <th className="py-3 px-3">Items</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Payment</th>
                  <th className="py-3 px-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-mono">
                {analytics.recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-3 px-3 font-bold text-zinc-950">{o.orderNumber}</td>
                    <td className="py-3 px-3 font-sans">
                      <div className="font-semibold text-zinc-900">{o.customerName}</div>
                      <div className="text-[11px] text-zinc-400 font-mono">{o.customerEmail}</div>
                    </td>
                    <td className="py-3 px-3 font-sans text-zinc-600">{o.customerCountry}</td>
                    <td className="py-3 px-3 text-zinc-700">{o.itemCount} items</td>
                    <td className="py-3 px-3 font-bold text-zinc-950">
                      {o.currency} {o.total.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          o.paymentStatus === "PAID"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : o.paymentStatus === "PENDING"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {o.paymentStatus === "PAID" ? (
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                        ) : (
                          <Clock className="w-2.5 h-2.5 text-amber-600" />
                        )}
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-zinc-500 text-[11px]" suppressHydrationWarning>
                      {new Date(o.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50">
            <ShoppingBag className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-zinc-800">No Orders in Database Yet</h4>
            <p className="text-[11px] text-zinc-400 max-w-sm mx-auto mt-0.5">
              Live customer transactions will display here immediately when orders are placed and processed through Razorpay.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboardClient;
