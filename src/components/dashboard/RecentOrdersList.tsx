import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/currency/currencies";
import { CurrencyCode } from "@/types";

interface OrderSummaryItem {
  id: string;
  orderNumber: string;
  total: number;
  currency: string;
  createdAt: string;
  paymentStatus: string;
}

interface RecentOrdersListProps {
  orders: OrderSummaryItem[];
}

export function RecentOrdersList({ orders }: RecentOrdersListProps) {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-zinc-950 font-display">
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
        {orders.length > 0 ? (
          orders.map((o) => (
            <div key={o.id} className="py-3 text-xs space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-zinc-900">
                  #{o.orderNumber}
                </span>
                <span className="font-mono font-bold text-zinc-950">
                  {formatPrice(o.total, o.currency as CurrencyCode)}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-zinc-500">
                <span suppressHydrationWarning>{new Date(o.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
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
  );
}
