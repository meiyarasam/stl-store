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
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10 pointer-events-none">
        <div className="w-full max-w-[100vw] sm:w-[420px] sm:max-w-md bg-white shadow-2xl flex flex-col pointer-events-auto h-full overflow-hidden">
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-zinc-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-zinc-900" />
              <h2 className="text-base sm:text-lg font-bold text-zinc-900">Your Cart ({cart.length})</h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-md hover:bg-zinc-100 transition-colors touch-manipulation"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-4 text-zinc-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-zinc-900">Your cart is empty</h3>
                <p className="text-xs sm:text-sm text-zinc-500 mt-1 max-w-xs mx-auto">
                  Explore our curated catalogue of digital 3D printable designs and models.
                </p>
                <div className="mt-6">
                  <Button
                    onClick={() => setIsCartOpen(false)}
                    variant="primary"
                    size="md"
                    className="w-full min-h-[44px]"
                  >
                    <Link href="/products">Explore 3D Models</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {cart.map((item) => {
                  const { amount } = getProductPrice(item.product);
                  const primaryImg = item.product.images?.find((i) => i.isPrimary)?.url || item.product.images?.[0]?.url || "/images/logo.png";

                  return (
                    <div key={item.product.id} className="py-3.5 sm:py-4 flex gap-3 sm:gap-4 items-start">
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200 shrink-0">
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
                          className="text-xs sm:text-sm font-semibold text-zinc-900 hover:underline line-clamp-1 block truncate"
                        >
                          {item.product.title}
                        </Link>
                        <p className="text-[11px] sm:text-xs text-zinc-500 mt-0.5 truncate">
                          Instant Digital Download (STL / ZIP)
                        </p>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <span className="text-xs sm:text-sm font-bold text-zinc-950 font-mono">
                            {formatAmount(amount * item.quantity)}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-zinc-400 hover:text-red-600 transition-colors p-1.5 touch-manipulation"
                            title="Remove item"
                            aria-label={`Remove ${item.product.title}`}
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
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-t border-zinc-200 bg-zinc-50/90 space-y-3 sm:space-y-4 shrink-0">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs sm:text-sm text-zinc-600">
                  <span>Subtotal ({currency})</span>
                  <span className="font-semibold text-zinc-900 font-mono">
                    {formatAmount(cartTotal)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] sm:text-xs text-zinc-500">
                  <span>Digital Delivery</span>
                  <span className="text-emerald-600 font-medium">Instant / Free</span>
                </div>
                <div className="pt-2 border-t border-zinc-200 flex justify-between text-sm sm:text-base font-bold text-zinc-950">
                  <span>Total</span>
                  <span className="font-mono">{formatAmount(cartTotal)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full min-h-[48px] flex items-center justify-center gap-2 bg-zinc-950 text-white font-semibold py-3 px-4 rounded-lg hover:bg-zinc-800 transition-colors touch-manipulation text-xs sm:text-sm shadow-sm"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </Link>
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500 pt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">Secure 256-bit encrypted checkout via Razorpay</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CartDrawer;
