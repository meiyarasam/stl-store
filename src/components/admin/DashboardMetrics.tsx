import React from "react";
import { DollarSign, ShoppingBag, Users, Box, TrendingUp } from "lucide-react";

interface DashboardMetricsProps {
  summary: {
    totalRevenueUSD: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    pendingPayments?: number;
  };
}

export function DashboardMetrics({ summary }: DashboardMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-zinc-500">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Total Revenue
          </span>
          <DollarSign className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="text-2xl font-black text-zinc-950 font-mono" suppressHydrationWarning>
          ${new Intl.NumberFormat("en-US").format(summary.totalRevenueUSD)}
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
        <p className="text-[11px] text-zinc-400">100% verified payments</p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-zinc-500">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Active Makers
          </span>
          <Users className="w-4 h-4 text-zinc-500" />
        </div>
        <div className="text-2xl font-black text-zinc-950 font-mono">
          {summary.totalCustomers}
        </div>
        <p className="text-[11px] text-zinc-400">Registered international customers</p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-zinc-500">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Available Designs
          </span>
          <Box className="w-4 h-4 text-zinc-500" />
        </div>
        <div className="text-2xl font-black text-zinc-950 font-mono">
          {summary.totalProducts}
        </div>
        <p className="text-[11px] text-zinc-400">Instant downloadable STL / ZIP files</p>
      </div>
    </div>
  );
}
export default DashboardMetrics;
