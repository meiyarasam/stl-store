"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useStore } from "@/context/StoreContext";
import { X, Trash2, ArrowRight, ShoppingBag, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CartDrawer() {
  const { cart, removeFromCart, clearCart, cartTotal, formatAmount, isCartOpen, setIsCartOpen, currency, getProductPrice } = useStore();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 border-b border-zinc-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-zinc-900" />
              <h2 className="text-lg font-bold text-zinc-900">Your Cart ({cart.length})</h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-md hover:bg-zinc-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-4 text-zinc-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-zinc-900">Your cart is empty</h3>
                <p className="text-sm text-zinc-500 mt-1 max-w-xs mx-auto">
                  Explore our curated catalogue of digital 3D printable designs and models.
                </p>
                <div className="mt-6">
                  <Button
                    onClick={() => setIsCartOpen(false)}
                    variant="primary"
                    size="md"
                    className="w-full"
                  >
                    <Link href="/products">Explore 3D Models</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {cart.map((item) => {
                  const { amount } = getProductPrice(item.product);
                  const primaryImg = item.product.images?.find((i) => i.isPrimary)?.url || item.product.images?.[0]?.url || "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=400&q=80";

                  return (
                    <div key={item.product.id} className="py-4 flex gap-4 items-start">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200 flex-shrink-0">
                        <Image
                          src={primaryImg}
                          alt={item.product.title}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${item.product.slug}`}
                          onClick={() => setIsCartOpen(false)}
                          className="text-sm font-semibold text-zinc-900 hover:underline line-clamp-1"
                        >
                          {item.product.title}
                        </Link>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          Instant Digital Download (STL / ZIP)
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-sm font-bold text-zinc-950 font-mono">
                            {formatAmount(amount * item.quantity)}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-zinc-400 hover:text-red-600 transition-colors p-1"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && (
            <div className="px-6 py-5 border-t border-zinc-200 bg-zinc-50/70 space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm text-zinc-600">
                  <span>Subtotal ({currency})</span>
                  <span className="font-semibold text-zinc-900 font-mono">
                    {formatAmount(cartTotal)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>Digital Delivery</span>
                  <span className="text-emerald-600 font-medium">Instant / Free</span>
                </div>
                <div className="pt-2 border-t border-zinc-200 flex justify-between text-base font-bold text-zinc-950">
                  <span>Total</span>
                  <span className="font-mono">{formatAmount(cartTotal)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full flex items-center justify-center gap-2 bg-zinc-950 text-white font-semibold py-3 px-4 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </Link>
                <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-500 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Secure 256-bit encrypted checkout via Razorpay</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

