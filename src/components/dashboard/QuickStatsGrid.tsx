import React from "react";
import { ShoppingBag, Download, ShieldCheck } from "lucide-react";

interface QuickStatsGridProps {
  ordersCount: number;
  downloadsCount: number;
  isVerified?: boolean;
}

export function QuickStatsGrid({
  ordersCount,
  downloadsCount,
  isVerified = true,
}: QuickStatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-zinc-500">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Total Purchases
          </span>
          <ShoppingBag className="w-4 h-4 text-zinc-400" />
        </div>
        <div className="text-2xl font-black text-zinc-950 font-mono">
          {ordersCount}
        </div>
        <p className="text-[11px] text-zinc-400">Lifetime orders placed</p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-zinc-500">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Unlocked Files
          </span>
          <Download className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="text-2xl font-black text-zinc-950 font-mono">
          {downloadsCount}
        </div>
        <p className="text-[11px] text-zinc-400">STL / ZIP packages available</p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-zinc-500">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Account Security
          </span>
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="text-sm font-bold text-emerald-700 flex items-center gap-1 pt-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          {isVerified ? "Verified Maker" : "Standard Account"}
        </div>
        <p className="text-[11px] text-zinc-400">256-bit encrypted file delivery</p>
      </div>
    </div>
  );
}
