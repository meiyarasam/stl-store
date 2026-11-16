import React from "react";
import { DollarSign, ShoppingBag, Users, Box, DownloadCloud } from "lucide-react";

interface DashboardMetricsProps {
  summary: {
    totalRevenueINR: number;
    totalRevenueUSD: number;
    totalOrders: number;
    paidOrdersCount: number;
    pendingOrdersCount: number;
    totalCustomers: number;
    totalProducts: number;
    totalDownloads: number;
    totalDownloadCount: number;
  };
}

export function DashboardMetrics({ summary }: DashboardMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
      {/* 1. Total Revenue (Paid Orders Only) */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-zinc-300 transition-all">
        <div className="flex items-center justify-between text-zinc-500 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-600">
            Total Revenue
          </span>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-black text-zinc-950 font-mono tracking-tight" suppressHydrationWarning>
            ₹{new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(summary.totalRevenueINR)}
          </div>
          <div className="text-[11px] text-zinc-500 font-mono mt-0.5" suppressHydrationWarning>
            ≈ ${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(summary.totalRevenueUSD)} USD
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-center justify-between text-[11px]">
          <span className="text-zinc-500">Verified Paid Orders:</span>
          <span className="font-bold text-emerald-700 font-mono">{summary.paidOrdersCount}</span>
        </div>
      </div>

      {/* 2. Total Orders */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-zinc-300 transition-all">
        <div className="flex items-center justify-between text-zinc-500 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-600">
            Total Orders
          </span>
          <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <ShoppingBag className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-black text-zinc-950 font-mono tracking-tight">
            {summary.totalOrders}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">
            Database order records
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-center justify-between text-[11px]">
          <span className="text-zinc-500">Pending:</span>
          <span className="font-semibold text-zinc-700 font-mono">{summary.pendingOrdersCount}</span>
        </div>
      </div>

      {/* 3. Total Customers */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-zinc-300 transition-all">
        <div className="flex items-center justify-between text-zinc-500 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-600">
            Registered Customers
          </span>
          <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-black text-zinc-950 font-mono tracking-tight">
            {summary.totalCustomers}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">
            User accounts with CUSTOMER role
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-center justify-between text-[11px]">
          <span className="text-zinc-500">Database Users:</span>
          <span className="font-semibold text-zinc-700 font-mono">{summary.totalCustomers}</span>
        </div>
      </div>

      {/* 4. Total Published Products */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-zinc-300 transition-all">
        <div className="flex items-center justify-between text-zinc-500 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-600">
            Live 3D Models
          </span>
          <div className="w-7 h-7 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-800">
            <Box className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-black text-zinc-950 font-mono tracking-tight">
            {summary.totalProducts}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">
            Active marketplace items
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-center justify-between text-[11px]">
          <span className="text-zinc-500">Status:</span>
          <span className="font-semibold text-emerald-700">Published</span>
        </div>
      </div>

      {/* 5. Total Downloads */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-zinc-300 transition-all">
        <div className="flex items-center justify-between text-zinc-500 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-600">
            STL Downloads
          </span>
          <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700">
            <DownloadCloud className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-black text-zinc-950 font-mono tracking-tight">
            {summary.totalDownloads}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">
            Total download tokens issued
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-center justify-between text-[11px]">
          <span className="text-zinc-500">Download Events:</span>
          <span className="font-semibold text-zinc-700 font-mono">{summary.totalDownloadCount}</span>
        </div>
      </div>
    </div>
  );
}

export default DashboardMetrics;
