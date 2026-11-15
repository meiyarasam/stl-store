import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { redirect } from "next/navigation";
import { getUserOrders } from "@/lib/database/orders";
import { getUserDownloads } from "@/lib/database/downloads";
import { formatPrice } from "@/lib/currency/currencies";
import {
  ShoppingBag,
  Download,
  Clock,
  ArrowRight,
  ShieldCheck,
  User,
  Box,
} from "lucide-react";

export default async function AccountOverviewPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/account");
  }

  const userId = (session.user as any).id || "admin_super_user";
  const [orders, downloads] = await Promise.all([
    getUserOrders(userId),
    getUserDownloads(userId),
  ]);

  const recentOrders = orders.slice(0, 3);
  const recentDownloads = downloads.slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Account Header */}
      <div className="bg-zinc-950 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">
            Customer Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-display mt-0.5">
            Welcome back, {session.user.name || "Maker"}!
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            {session.user.email} • Country: {(session.user as any).country || "Global"}
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/account/downloads"
            className="px-4 py-2 bg-white text-zinc-950 rounded-lg text-xs font-bold hover:bg-zinc-100 transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            My Downloads ({downloads.length})
          </Link>
          <Link
            href="/account/orders"
            className="px-4 py-2 bg-zinc-900 border border-zinc-700 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800 transition-colors"
          >
            Order History
          </Link>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Purchases
            </span>
            <ShoppingBag className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-black text-zinc-950 font-mono">
            {orders.length}
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
            {downloads.length}
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
            Verified Maker
          </div>
          <p className="text-[11px] text-zinc-400">256-bit encrypted file delivery</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Downloads */}
        <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-950">
              Ready to Download
            </h2>
            <Link
              href="/account/downloads"
              className="text-xs font-semibold text-zinc-600 hover:text-zinc-950 flex items-center gap-1"
            >
              All Files <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-zinc-100">
            {recentDownloads.length > 0 ? (
              recentDownloads.map((dl) => (
                <div
                  key={dl.id}
                  className="py-3 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <Box className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-zinc-900 block font-mono">
                        {dl.fileName}
                      </span>
                      <span className="text-[11px] text-zinc-500">
                        {dl.productTitle}
                      </span>
                    </div>
                  </div>
                  <a
                    href={`/api/downloads/${dl.downloadToken}`}
                    className="px-3 py-1 bg-zinc-950 hover:bg-zinc-800 text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Download className="w-3 h-3" /> Download
                  </a>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-zinc-500">
                No active downloads. Browse our collection to download your first 3D design!
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-950">
              Recent Orders
            </h2>
            <Link
              href="/account/orders"
              className="text-xs font-semibold text-zinc-600 hover:text-zinc-950 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-zinc-100">
            {recentOrders.length > 0 ? (
              recentOrders.map((o) => (
                <div key={o.id} className="py-3 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-zinc-900">
                      #{o.orderNumber}
                    </span>
                    <span className="font-mono font-bold text-zinc-950">
                      {formatPrice(o.total, o.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-zinc-500">
                    <span>{new Date(o.createdAt).toLocaleDateString()}</span>
                    <span
                      className={`font-semibold uppercase tracking-wider ${
                        o.paymentStatus === "PAID"
                          ? "text-emerald-600"
                          : "text-amber-600"
                      }`}
                    >
                      {o.paymentStatus}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-zinc-500">
                You haven&apos;t placed any orders yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

