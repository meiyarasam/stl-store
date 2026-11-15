import { CurrencyCode, CurrencyConfig, CountryConfig } from "@/types";

export const SUPPORTED_CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    flag: "🇺🇸",
    decimals: 2,
    rateAgainstUSD: 1.0,
    minUnitMultiplier: 100, // cents
  },
  INR: {
    code: "INR",
    symbol: "₹",
    name: "Indian Rupee",
    flag: "🇮🇳",
    decimals: 2,
    rateAgainstUSD: 85.0,
    minUnitMultiplier: 100, // paise
  },
  EUR: {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    flag: "🇪🇺",
    decimals: 2,
    rateAgainstUSD: 0.95,
    minUnitMultiplier: 100, // cents
  },
  GBP: {
    code: "GBP",
    symbol: "£",
    name: "British Pound",
    flag: "🇬🇧",
    decimals: 2,
    rateAgainstUSD: 0.80,
    minUnitMultiplier: 100, // pence
  },
  CAD: {
    code: "CAD",
    symbol: "CA$",
    name: "Canadian Dollar",
    flag: "🇨🇦",
    decimals: 2,
    rateAgainstUSD: 1.40,
    minUnitMultiplier: 100, // cents
  },
  AUD: {
    code: "AUD",
    symbol: "A$",
    name: "Australian Dollar",
    flag: "🇦🇺",
    decimals: 2,
    rateAgainstUSD: 1.55,
    minUnitMultiplier: 100, // cents
  },
  JPY: {
    code: "JPY",
    symbol: "¥",
    name: "Japanese Yen",
    flag: "🇯🇵",
    decimals: 0,
    rateAgainstUSD: 155.0,
    minUnitMultiplier: 1, // zero-decimal currency
  },
};

export const COUNTRIES_LIST: CountryConfig[] = [
  { code: "IN", name: "India", defaultCurrency: "INR", dialCode: "+91", flag: "🇮🇳" },
  { code: "US", name: "United States", defaultCurrency: "USD", dialCode: "+1", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", defaultCurrency: "GBP", dialCode: "+44", flag: "🇬🇧" },
  { code: "DE", name: "Germany", defaultCurrency: "EUR", dialCode: "+49", flag: "🇩🇪" },
  { code: "FR", name: "France", defaultCurrency: "EUR", dialCode: "+33", flag: "🇫🇷" },
  { code: "CA", name: "Canada", defaultCurrency: "CAD", dialCode: "+1", flag: "🇨🇦" },
  { code: "AU", name: "Australia", defaultCurrency: "AUD", dialCode: "+61", flag: "🇦🇺" },
  { code: "JP", name: "Japan", defaultCurrency: "JPY", dialCode: "+81", flag: "🇯🇵" },
  { code: "IT", name: "Italy", defaultCurrency: "EUR", dialCode: "+39", flag: "🇮🇹" },
  { code: "ES", name: "Spain", defaultCurrency: "EUR", dialCode: "+34", flag: "🇪🇸" },
  { code: "NL", name: "Netherlands", defaultCurrency: "EUR", dialCode: "+31", flag: "🇳🇱" },
  { code: "SE", name: "Sweden", defaultCurrency: "EUR", dialCode: "+46", flag: "🇸🇪" },
  { code: "SG", name: "Singapore", defaultCurrency: "USD", dialCode: "+65", flag: "🇸🇬" },
  { code: "AE", name: "United Arab Emirates", defaultCurrency: "USD", dialCode: "+971", flag: "🇦🇪" },
  { code: "CH", name: "Switzerland", defaultCurrency: "EUR", dialCode: "+41", flag: "🇨🇭" },
  { code: "BR", name: "Brazil", defaultCurrency: "USD", dialCode: "+55", flag: "🇧🇷" },
];

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

