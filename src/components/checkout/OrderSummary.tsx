"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";
import { ProductDTO } from "@/types";

interface OrderSummaryProps {
  cart: { product: ProductDTO; quantity: number }[];
  cartTotal: number;
  currency: string;
  formatAmount: (amount: number) => string;
  getProductPrice: (product: ProductDTO) => { amount: number };
}

export function OrderSummary({
  cart,
  cartTotal,
  currency,
  formatAmount,
  getProductPrice,
}: OrderSummaryProps) {
  return (
    <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-zinc-900">Your Order ({cart.length})</h2>
        <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-zinc-200 rounded text-zinc-800">
          Currency: {currency}
        </span>
      </div>

      {/* Items Summary */}
      <div className="divide-y divide-zinc-200 max-h-60 overflow-y-auto pr-1">
        {cart.map((item) => {
          const { amount } = getProductPrice(item.product);
          return (
            <div key={item.product.id} className="py-3 flex justify-between items-start text-xs">
              <div>
                <span className="font-semibold text-zinc-900 block line-clamp-1">
                  {item.product.title}
                </span>
                <span className="text-zinc-500 text-[11px]">
                  Formats: STL, ZIP • Qty: {item.quantity}
                </span>
              </div>
              <span className="font-mono font-bold text-zinc-950 ml-4">
                {formatAmount(amount * item.quantity)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Pricing calculations */}
      <div className="space-y-2 pt-4 border-t border-zinc-200 text-xs">
        <div className="flex justify-between text-zinc-600">
          <span>Subtotal</span>
          <span className="font-mono font-semibold text-zinc-900">
            {formatAmount(cartTotal)}
          </span>
        </div>
        <div className="flex justify-between text-zinc-600">
          <span>Instant Digital Delivery</span>
          <span className="text-emerald-600 font-semibold">Free</span>
        </div>
        <div className="pt-2 border-t border-zinc-200 flex justify-between text-base font-black text-zinc-950">
          <span>Total to Pay</span>
          <span className="font-mono">{formatAmount(cartTotal)}</span>
        </div>
      </div>

      <div className="p-3 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-600 space-y-1">
        <div className="flex items-center gap-1.5 font-semibold text-zinc-900">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Safe Digital Fulfillment</span>
        </div>
        <p className="text-[11px] text-zinc-500 leading-relaxed">
          Files are watermarked with your private order token and become available immediately in your dashboard upon payment authorization.
        </p>
      </div>
    </div>
  );
}
export default OrderSummary;
