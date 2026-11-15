"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useStore } from "@/context/StoreContext";
import { Trash2, ArrowRight, ShoppingBag, ShieldCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-zinc-950 tracking-tight font-display">
          Shopping Cart ({cart.length})
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Review your digital selections. Downloadable files are unlocked instantly upon payment.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-8 bg-white border border-zinc-200 rounded-xl divide-y divide-zinc-200 overflow-hidden shadow-sm">
          {cart.map((item) => {
            const { amount } = getProductPrice(item.product);
            const primaryImg =
              item.product.images?.find((i) => i.isPrimary)?.url ||
              item.product.images?.[0]?.url ||
              "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=400&q=80";

            return (
              <div key={item.product.id} className="p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
                <div className="flex gap-4 items-center">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200 flex-shrink-0">
                    <Image
                      src={primaryImg}
                      alt={item.product.title}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="text-base font-bold text-zinc-900 hover:underline"
                    >
                      {item.product.title}
                    </Link>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Formats: STL / ZIP archive • Instant delivery
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded">
                        Qty: {item.quantity}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-0 border-zinc-100">
                  <span className="text-lg font-black text-zinc-950 font-mono">
                    {formatAmount(amount * item.quantity)}
                  </span>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 font-medium transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              </div>
            );
          })}

          <div className="p-4 bg-zinc-50/60 flex items-center justify-between">
            <Link
              href="/products"
              className="text-xs font-semibold text-zinc-700 hover:text-zinc-950 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
            </Link>
            <button
              onClick={clearCart}
              className="text-xs text-zinc-500 hover:text-zinc-800 transition-colors"
            >
              Clear Entire Cart
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4 bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-zinc-950">Order Summary</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-zinc-600">
              <span>Subtotal ({currency})</span>
              <span className="font-semibold text-zinc-950 font-mono">
                {formatAmount(cartTotal)}
              </span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Digital Delivery</span>
              <span className="font-medium text-emerald-600">Instant (Free)</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Taxes</span>
              <span className="text-zinc-400">Included</span>
            </div>
            <div className="pt-3 border-t border-zinc-200 flex justify-between text-base font-black text-zinc-950">
              <span>Estimated Total</span>
              <span className="font-mono">{formatAmount(cartTotal)}</span>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              href="/checkout"
              className="w-full flex items-center justify-center gap-2 bg-zinc-950 text-white font-bold py-3.5 px-6 rounded-lg hover:bg-zinc-800 transition-colors shadow-md text-sm"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="pt-4 border-t border-zinc-100 flex items-center gap-2 text-xs text-zinc-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Official Razorpay Standard Checkout & Encrypted Downloads</span>
          </div>
        </div>
      </div>
    </div>
  );
}
