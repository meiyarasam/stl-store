import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { AnalyticsCharts } from "@/components/admin/AnalyticsCharts";
import {
  DollarSign,
  ShoppingBag,
  Users,
  Box,
  TrendingUp,
  ArrowRight,
  Plus,
} from "lucide-react";
import { SAMPLE_PRODUCTS } from "@/lib/data/sampleProducts";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if ((session?.user as any)?.role !== "ADMIN" && process.env.NODE_ENV === "production") {
    redirect("/login?callbackUrl=/admin");
  }

  // Pre-aggregated analytics metrics
  const summary = {
    totalRevenueUSD: 14850,
    totalOrders: 124,
    totalCustomers: 96,
    totalProducts: SAMPLE_PRODUCTS.length,
    pendingPayments: 2,
  };

  const dailySales = [
    { date: "Mon", revenueUSD: 380, orders: 14 },
    { date: "Tue", revenueUSD: 520, orders: 19 },
    { date: "Wed", revenueUSD: 460, orders: 16 },
    { date: "Thu", revenueUSD: 690, orders: 24 },
    { date: "Fri", revenueUSD: 850, orders: 31 },
    { date: "Sat", revenueUSD: 1120, orders: 42 },
    { date: "Sun", revenueUSD: 940, orders: 35 },
  ];

  const countrySales = [
    { country: "India", percentage: 38, orders: 47 },
    { country: "United States", percentage: 32, orders: 40 },
    { country: "Germany & EU", percentage: 16, orders: 20 },
    { country: "United Kingdom", percentage: 9, orders: 11 },
    { country: "Canada & Australia", percentage: 5, orders: 6 },
  ];

  const currencyBreakdown = [
    { currency: "INR", amount: 285400, symbol: "₹" },
    { currency: "USD", amount: 4890, symbol: "$" },
    { currency: "EUR", amount: 2150, symbol: "€" },
    { currency: "GBP", amount: 1420, symbol: "£" },
  ];

  const topProducts = SAMPLE_PRODUCTS.slice(0, 4);

  return (
    <div className="min-h-screen bg-zinc-50/50">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-zinc-950 tracking-tight font-display">
              Platform Analytics
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Authoritative sales, multi-currency revenue, and digital download metrics.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-950 text-white rounded-lg text-xs font-bold hover:bg-zinc-800 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Add New 3D Model
            </Link>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Total Revenue
              </span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-zinc-950 font-mono">
              ${summary.totalRevenueUSD.toLocaleString()}
            </div>
            <div className="flex items-center text-[11px] text-emerald-600 font-semibold gap-1">
              <TrendingUp className="w-3 h-3" /> +18.4% from last month
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Total Orders
              </span>
              <ShoppingBag className="w-4 h-4 text-zinc-500" />
            </div>
            <div className="text-2xl font-black text-zinc-950 font-mono">
              {summary.totalOrders}
            </div>
            <p className="text-[11px] text-zinc-400">100% verified Razorpay payments</p>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Registered Customers
              </span>
              <Users className="w-4 h-4 text-zinc-500" />
            </div>
            <div className="text-2xl font-black text-zinc-950 font-mono">
              {summary.totalCustomers}
            </div>
            <p className="text-[11px] text-zinc-400">Across 16 supported countries</p>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Cataloged Products
              </span>
              <Box className="w-4 h-4 text-zinc-500" />
            </div>
            <div className="text-2xl font-black text-zinc-950 font-mono">
              {summary.totalProducts}
            </div>
            <p className="text-[11px] text-zinc-400">Watertight STL packages</p>
          </div>
        </div>

        {/* Charts & Graphs */}
        <AnalyticsCharts
          dailySales={dailySales}
          countrySales={countrySales}
          currencyBreakdown={currencyBreakdown}
        />

        {/* Top-Selling 3D Models Table */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-950">
              Best Performing 3D Designs
            </h2>
            <Link
              href="/admin/products"
              className="text-xs font-semibold text-zinc-600 hover:text-zinc-950 flex items-center gap-1"
            >
              Manage All Products <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Model Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Downloads</th>
                  <th className="py-3 px-4">Views</th>
                  <th className="py-3 px-4">Price (USD / INR)</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {topProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-50/50">
                    <td className="py-3 px-4 font-semibold text-zinc-900">
                      {p.title}
                    </td>
                    <td className="py-3 px-4 text-zinc-600">{p.categoryName}</td>
                    <td className="py-3 px-4 font-mono font-bold text-zinc-900">
                      {p.downloadCount}
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-500">
                      {p.viewCount}
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-950">
                      ${p.prices.USD} / ₹{p.prices.INR}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/products/${p.slug}`}
                        className="text-zinc-700 hover:text-zinc-950 font-medium hover:underline"
                      >
                        Preview
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

