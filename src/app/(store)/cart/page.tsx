"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useStore } from "@/context/StoreContext";
import { Trash2, ArrowRight, ShoppingBag, ArrowLeft } from "lucide-react";
import { CartSummary } from "@/components/cart/CartSummary";

export default function CartPage() {
  const { cart, removeFromCart, clearCart, cartTotal, formatAmount, currency, getProductPrice } = useStore();

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-6 text-zinc-400">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-950">Your Cart is Currently Empty</h1>
        <p className="text-sm text-zinc-500 mt-2 max-w-sm mx-auto">
          Explore our collection of verified 3D printable designs and models.
        </p>
        <div className="mt-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-950 text-white rounded-lg font-semibold hover:bg-zinc-800 transition-colors shadow-sm"
          >
            Explore 3D Models <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8 w-full max-w-full overflow-x-hidden">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight font-display">
          Shopping Cart ({cart.length})
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Review your digital selections. Downloadable files are unlocked instantly upon payment.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start w-full">
        {/* Cart Items List */}
        <div className="lg:col-span-8 bg-white border border-zinc-200 rounded-xl divide-y divide-zinc-200 overflow-hidden shadow-sm w-full max-w-full">
          {cart.map((item) => {
            const { amount } = getProductPrice(item.product);
            const primaryImg =
              item.product.images?.find((i) => i.isPrimary)?.url ||
              item.product.images?.[0]?.url ||
              "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=400&q=80";

            return (
              <div key={item.product.id} className="p-3.5 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-5 items-start sm:items-center justify-between w-full">
                <div className="flex gap-3 sm:gap-4 items-center flex-1 min-w-0 w-full sm:w-auto">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200 shrink-0">
                    <Image
                      src={primaryImg}
                      alt={item.product.title}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="text-sm sm:text-base font-bold text-zinc-900 hover:underline block truncate"
                      title={item.product.title}
                    >
                      {item.product.title}
                    </Link>
                    <p className="text-[11px] sm:text-xs text-zinc-500 mt-0.5 truncate">
                      Formats: STL / ZIP archive • Instant delivery
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[10px] sm:text-xs font-semibold text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded">
                        Qty: {item.quantity}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-0 border-zinc-100">
                  <span className="text-base sm:text-lg font-black text-zinc-950 font-mono">
                    {formatAmount(amount * item.quantity)}
                  </span>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 font-medium transition-colors p-1 touch-manipulation"
                    aria-label={`Remove ${item.product.title}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              </div>
            );
          })}

          <div className="p-3.5 sm:p-4 bg-zinc-50/60 flex items-center justify-between gap-2">
            <Link
              href="/products"
              className="text-xs font-semibold text-zinc-700 hover:text-zinc-950 flex items-center gap-1.5 truncate"
            >
              <ArrowLeft className="w-3.5 h-3.5 shrink-0" /> Continue Shopping
            </Link>
            <button
              onClick={clearCart}
              className="text-xs text-zinc-500 hover:text-zinc-800 transition-colors shrink-0"
            >
              Clear Cart
            </button>
          </div>
        </div>

        {/* Order Summary Component */}
        <div className="lg:col-span-4 w-full max-w-full">
          <CartSummary cartTotal={cartTotal} formatAmount={formatAmount} currency={currency} />
        </div>
      </div>
    </div>
  );
}

