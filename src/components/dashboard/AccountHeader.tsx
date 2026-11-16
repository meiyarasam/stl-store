import React from "react";
import Link from "next/link";
import { Download } from "lucide-react";

interface AccountHeaderProps {
  userName: string;
  userEmail: string;
  country?: string;
  downloadsCount: number;
}

export function AccountHeader({
  userName,
  userEmail,
  country = "Global",
  downloadsCount,
}: AccountHeaderProps) {
  return (
    <div className="bg-zinc-950 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">
          Customer Dashboard
        </span>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-display mt-0.5">
          Welcome back, {userName || "Maker"}!
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          {userEmail} • Country: {country}
        </p>
      </div>

      <div className="flex gap-2">
        <Link
          href="/account/downloads"
          className="px-4 py-2 bg-white text-zinc-950 rounded-lg text-xs font-bold hover:bg-zinc-100 transition-colors shadow-sm flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          My Downloads ({downloadsCount})
        </Link>
        <Link
          href="/account/orders"
          className="px-4 py-2 bg-zinc-900 border border-zinc-700 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800 transition-colors"
        >
          Order History
        </Link>
      </div>
    </div>
  );
}
