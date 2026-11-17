"use client";

import React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CartSummaryProps {
  cartTotal: number;
  formatAmount: (amount: number) => string;
  currency: string;
}

export function CartSummary({ cartTotal, formatAmount, currency }: CartSummaryProps) {
  const { data: session } = useSession();

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-6 space-y-4 sm:space-y-6 shadow-sm sticky top-24 w-full max-w-full overflow-hidden">
      <h2 className="text-base font-black text-zinc-950 tracking-tight font-display border-b border-zinc-100 pb-3">
        Order Summary
      </h2>

      <div className="space-y-2.5 sm:space-y-3 text-xs w-full">
        <div className="flex justify-between text-zinc-600">
          <span>Digital Subtotal</span>
          <span className="font-mono font-medium text-zinc-900">{formatAmount(cartTotal)}</span>
        </div>
        <div className="flex justify-between text-zinc-600">
          <span>Taxes & Processing</span>
          <span className="font-mono text-emerald-600 font-medium">Included</span>
        </div>
        <div className="flex justify-between text-zinc-600">
          <span>Delivery</span>
          <span className="text-emerald-600 font-medium">Instant Download</span>
        </div>
        <div className="pt-3 border-t border-zinc-200 flex justify-between items-baseline">
          <span className="text-xs sm:text-sm font-bold text-zinc-950">Total Amount</span>
          <span className="text-xl sm:text-2xl font-black text-zinc-950 font-mono">
            {formatAmount(cartTotal)}
          </span>
        </div>
        <p className="text-[10px] text-zinc-400 text-right">
          Billed in {currency}. No hidden charges.
        </p>
      </div>

      <div className="space-y-3 pt-2 w-full">
        {session?.user ? (
          <Link href="/checkout" className="block w-full">
            <Button variant="primary" size="lg" className="w-full text-xs sm:text-sm font-bold gap-2 min-h-[48px] touch-manipulation shadow-sm">
              Proceed to Secure Checkout <ArrowRight className="w-4 h-4 shrink-0" />
            </Button>
          </Link>
        ) : (
          <>
            <Link href="/register?redirect=/checkout" className="block w-full">
              <Button variant="primary" size="lg" className="w-full text-xs sm:text-sm font-bold gap-2 min-h-[48px] touch-manipulation shadow-sm">
                Create Account & Checkout <ArrowRight className="w-4 h-4 shrink-0" />
              </Button>
            </Link>
            <div className="text-center pt-0.5">
              <Link
                href="/login?redirect=/checkout"
                className="text-[11px] font-medium text-zinc-500 hover:text-zinc-950 underline underline-offset-2"
              >
                Already have an account? Sign In
              </Link>
            </div>
          </>
        )}

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="truncate">Encrypted Razorpay Checkout</span>
        </div>
      </div>
    </div>
  );
}
export default CartSummary;
