"use client";

import { useEffect } from "react";
import { trackProductView } from "@/lib/analytics/tracker";

interface ProductViewBeaconProps {
  productId: string;
  slug: string;
  title: string;
}

export function ProductViewBeacon({ productId, slug, title }: ProductViewBeaconProps) {
  useEffect(() => {
    if (productId) {
      trackProductView(productId, { slug, title });
    }
  }, [productId, slug, title]);

  return null;
}
