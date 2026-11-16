import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { redirect } from "next/navigation";
import { getUserOrders } from "@/lib/database/orders";
import { formatPrice } from "@/lib/currency/currencies";
import { ShoppingBag, ArrowLeft, Download, ShieldCheck } from "lucide-react";

export default async function AccountOrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/account/orders");
  }

  const userId = (session.user as any).id || "admin_super_user";
  const orders = await getUserOrders(userId);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/account"
            className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight font-display">
            My Orders ({orders.length})
          </h1>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
        {orders.length === 0 ? (
          <div className="text-center py-16 px-4">
            <ShoppingBag className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-zinc-900">No Orders Found</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
              You haven&apos;t placed any orders yet. Browse our catalog to download 3D designs.
            </p>
            <div className="mt-6">
              <Link
                href="/products"
                className="px-4 py-2 bg-zinc-950 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800"
              >
                Explore Collection
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-zinc-200">
            {orders.map((order) => (
              <div key={order.id} className="p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-zinc-100 text-xs">
                  <div>
                    <span className="text-zinc-400 block font-medium">Order Number</span>
                    <span className="font-mono font-bold text-zinc-950 text-sm">
                      #{order.orderNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block font-medium">Date</span>
                    <span className="text-zinc-800 font-medium" suppressHydrationWarning>
                      {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block font-medium">Total Amount</span>
                    <span className="font-mono font-bold text-zinc-950 text-sm">
                      {formatPrice(order.total, order.currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block font-medium">Payment Status</span>
                    <span
                      className={`inline-flex items-center gap-1 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider text-[11px] ${
                        order.paymentStatus === "PAID"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      <ShieldCheck className="w-3 h-3" /> {order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/products/${item.productSlug}`}
                          className="font-semibold text-zinc-900 hover:underline"
                        >
                          {item.productTitle}
                        </Link>
                        <span className="text-zinc-400">× {item.quantity}</span>
                      </div>
                      <span className="font-mono text-zinc-900 font-medium">
                        {formatPrice(item.total, item.currency)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-end gap-2 text-xs">
                  <Link
                    href={`/payment/success?orderId=${order.id}`}
                    className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded font-medium transition-colors"
                  >
                    View Receipt & Downloads
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

