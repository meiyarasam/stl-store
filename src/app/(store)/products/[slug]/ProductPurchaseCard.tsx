"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ProductDTO } from "@/types";
import { useStore } from "@/context/StoreContext";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Zap, ShieldCheck, Download, Check, Sparkles } from "lucide-react";

interface ProductPurchaseCardProps {
  product: ProductDTO;
}

export function ProductPurchaseCard({ product }: ProductPurchaseCardProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { getProductPrice, formatAmount, addToCart } = useStore();
  const [isAdded, setIsAdded] = useState(false);

  const { amount } = getProductPrice(product);

  const handleAddToCart = () => {
    addToCart(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, 1);
    if (!session?.user) {
      router.push(`/register?redirect=/checkout`);
    } else {
      router.push(`/checkout`);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm space-y-6">
      {/* Pricing Header */}
      <div>
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-black text-zinc-950 font-mono tracking-tight">
            {formatAmount(amount)}
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
            Digital STL & ZIP
          </span>
        </div>
        <p className="text-xs text-zinc-500 mt-1">
          One-time digital purchase. Lifetime access to downloadable source files.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          onClick={handleBuyNow}
          variant="primary"
          size="lg"
          className="w-full text-sm font-bold shadow-md"
        >
          <Zap className="w-4 h-4 mr-2 text-amber-300 fill-amber-300" />
          Buy Now – Instant Download
        </Button>

        <Button
          onClick={handleAddToCart}
          variant="secondary"
          size="lg"
          className="w-full text-sm font-semibold"
        >
          {isAdded ? (
            <>
              <Check className="w-4 h-4 mr-2 text-emerald-600" />
              Added to Cart!
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4 mr-2" />
              Add to Shopping Cart
            </>
          )}
        </Button>
      </div>

      {/* Feature Checkpoints */}
      <div className="pt-4 border-t border-zinc-100 space-y-2.5 text-xs text-zinc-600">
        <div className="flex items-center gap-2">
          <Download className="w-4 h-4 text-zinc-700 flex-shrink-0" />
          <span>Immediate digital access upon payment confirmation</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>100% Manifold watertight verified geometry</span>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span>Tested on SLA resin and FDM slicing profiles</span>
        </div>
      </div>
    </div>
  );
}

