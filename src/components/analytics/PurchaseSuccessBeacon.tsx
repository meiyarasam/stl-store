"use client";

import { useEffect } from "react";
import { trackPurchaseCompleted } from "@/lib/analytics/tracker";

interface PurchaseSuccessBeaconProps {
  orderNumber?: string;
  total?: number;
  currency?: string;
}

export function PurchaseSuccessBeacon({ orderNumber, total, currency }: PurchaseSuccessBeaconProps) {
  useEffect(() => {
    if (orderNumber) {
      trackPurchaseCompleted({ orderNumber, total, currency });
    }
  }, [orderNumber, total, currency]);

  return null;
}
