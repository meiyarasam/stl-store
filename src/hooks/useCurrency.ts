"use client";

import { useStore } from "@/context/StoreContext";
import { formatPrice as formatPriceUtil, getEffectiveProductPrice, getCurrencyConfig } from "@/lib/currency/currencies";
import { CurrencyCode } from "@/types";

export function useCurrency() {
  const { currency, setCurrency, country, setCountry } = useStore();

  const format = (amount: number, customCurrency?: CurrencyCode) => {
    return formatPriceUtil(amount, customCurrency || currency);
  };

  const getPrice = (prices: { currency: string; amount: number | string | any; isEnabled?: boolean }[]) => {
    return getEffectiveProductPrice(prices, currency);
  };

  const config = getCurrencyConfig(currency);

  return {
    currency,
    setCurrency,
    country,
    setCountry,
    format,
    getPrice,
    config,
  };
}
