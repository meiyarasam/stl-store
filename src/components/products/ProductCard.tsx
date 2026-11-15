"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ProductDTO } from "@/types";
import { useStore } from "@/context/StoreContext";
import { ShoppingBag, Zap, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: ProductDTO;
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { getProductPrice, formatAmount, addToCart } = useStore();

  const { amount } = getProductPrice(product);
  const primaryImg =
    product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80";

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product, 1);

    if (!session?.user) {
      // Redirect to register with callback to checkout
      router.push(`/register?redirect=/checkout`);
    } else {
      router.push(`/checkout`);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product, 1);
  };

  return (
    <div className="group flex flex-col bg-white rounded-xl border border-zinc-200 overflow-hidden hover:shadow-lg transition-all duration-200">
      {/* Product Image Link */}
      <Link href={`/products/${product.slug}`} className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100">
        <Image
          src={primaryImg}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.isFeatured && (
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 bg-zinc-950/80 backdrop-blur-md text-white text-[11px] font-semibold tracking-wider uppercase rounded shadow-sm">
              Featured
            </span>
          </div>
        )}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="px-2 py-0.5 bg-white/90 backdrop-blur-md text-zinc-800 text-[11px] font-medium rounded shadow-sm flex items-center gap-1">
            <Download className="w-3 h-3" /> STL + ZIP
          </span>
        </div>
      </Link>

      {/* Details */}
      <div className="flex-1 p-5 flex flex-col">
        {product.category && (
          <Link
            href={`/categories/${product.category.slug}`}
            className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider hover:text-zinc-900 transition-colors mb-1"
          >
            {product.category.name}
          </Link>
        )}

        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="font-bold text-zinc-900 text-base group-hover:text-zinc-700 transition-colors line-clamp-1">
            {product.title}
          </h3>
        </Link>

        <p className="text-xs text-zinc-500 mt-1.5 line-clamp-2 leading-relaxed flex-1">
          {product.shortDescription}
        </p>

        {/* Pricing */}
        <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 block font-medium">Digital Download</span>
            <span className="text-lg font-black text-zinc-950 font-mono tracking-tight">
              {formatAmount(amount)}
            </span>
          </div>
          <span className="text-[11px] text-zinc-500 bg-zinc-100 px-2 py-1 rounded font-mono">
            Instant Access
          </span>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button
            onClick={handleAddToCart}
            variant="secondary"
            size="sm"
            className="w-full text-xs"
          >
            <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
            Add to Cart
          </Button>

          <Button
            onClick={handleBuyNow}
            variant="primary"
            size="sm"
            className="w-full text-xs"
          >
            <Zap className="w-3.5 h-3.5 mr-1.5 text-amber-300" />
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
}

