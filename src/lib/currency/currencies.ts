import { CurrencyCode, CurrencyConfig } from "@/types";
import { SUPPORTED_CURRENCIES, COUNTRIES_LIST } from "@/constants/currencies";

export { SUPPORTED_CURRENCIES, COUNTRIES_LIST };

export function getCurrencyConfig(code: string): CurrencyConfig {
  const normalized = (code || "USD").toUpperCase() as CurrencyCode;
  return SUPPORTED_CURRENCIES[normalized] || SUPPORTED_CURRENCIES.USD;
}

export function formatPrice(amount: number, currency: CurrencyCode): string {
  const config = getCurrencyConfig(currency);
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  }).format(amount);

  return `${config.symbol}${formatted}`;
}

export function toRazorpaySubunits(amount: number, currency: CurrencyCode): number {
  const config = getCurrencyConfig(currency);
  return Math.round(amount * config.minUnitMultiplier);
}

export function fromRazorpaySubunits(amountSubunits: number, currency: CurrencyCode): number {
  const config = getCurrencyConfig(currency);
  return amountSubunits / config.minUnitMultiplier;
}

export function getEffectiveProductPrice(
  prices: { currency: string; amount: number | string | any; isEnabled?: boolean }[],
  targetCurrency: CurrencyCode
): { amount: number; isConfiguredExplicitly: boolean } {
  const matched = prices?.find(
    (p) => p.currency.toUpperCase() === targetCurrency.toUpperCase() && p.isEnabled !== false
  );

  if (matched && Number(matched.amount) > 0) {
    return {
      amount: Number(matched.amount),
      isConfiguredExplicitly: true,
    };
  }

  // Fallback: look for USD price and convert using reference exchange rate
  const usdPrice = prices?.find((p) => p.currency.toUpperCase() === "USD");
  const baseUsd = usdPrice ? Number(usdPrice.amount) : (Number(prices?.[0]?.amount) || 9.99);

  const targetConfig = getCurrencyConfig(targetCurrency);
  const converted = baseUsd * targetConfig.rateAgainstUSD;
  
  // Clean rounding
  const rounded = targetConfig.decimals === 0 ? Math.round(converted) : Number(converted.toFixed(2));

  return {
    amount: rounded,
    isConfiguredExplicitly: false,
  };
}
