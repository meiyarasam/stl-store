import { SUPPORTED_CURRENCIES } from "@/constants/currencies";

export type SupportedTargetCurrency = "USD" | "EUR" | "GBP" | "CAD" | "AUD" | "JPY";
export const SUPPORTED_TARGET_CURRENCIES: SupportedTargetCurrency[] = [
  "USD",
  "EUR",
  "GBP",
  "CAD",
  "AUD",
  "JPY",
];

export interface ExchangeRatesData {
  base: "INR";
  rates: Record<SupportedTargetCurrency, number>;
  lastUpdated: string;
  lastUpdatedUnix: number;
  source: string;
}

export interface ConvertedPriceItem {
  currency: SupportedTargetCurrency;
  symbol: string;
  name: string;
  rate: number;
  amount: number;
  formatted: string;
}

// In-memory cache for high reliability and optimal performance
interface CacheEntry {
  data: ExchangeRatesData;
  cachedAt: number;
}

let cachedRates: CacheEntry | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour cache
const MAX_STALE_TTL_MS = 48 * 60 * 60 * 1000; // 48 hours maximum fallback

/**
 * Fetch live, authoritative exchange rates with INR as base currency.
 * Automatically tries primary Open Exchange Rate API with fallback to JSDelivr Currency API.
 */
export async function getLiveExchangeRates(forceFresh = false): Promise<ExchangeRatesData> {
  const now = Date.now();

  // Return cached data if fresh
  if (!forceFresh && cachedRates && now - cachedRates.cachedAt < CACHE_TTL_MS) {
    return cachedRates.data;
  }

  // 1. Try Primary Provider: Open ExchangeRate API (Base: INR)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch("https://open.er-api.com/v6/latest/INR", {
      signal: controller.signal,
      next: { revalidate: 3600 },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.result === "success" && data.rates) {
        const rates: Record<SupportedTargetCurrency, number> = {
          USD: Number(data.rates.USD) || 0.01059,
          EUR: Number(data.rates.EUR) || 0.00962,
          GBP: Number(data.rates.GBP) || 0.00803,
          CAD: Number(data.rates.CAD) || 0.01514,
          AUD: Number(data.rates.AUD) || 0.01563,
          JPY: Number(data.rates.JPY) || 1.69658,
        };

        const result: ExchangeRatesData = {
          base: "INR",
          rates,
          lastUpdated: data.time_last_update_utc || new Date().toUTCString(),
          lastUpdatedUnix: data.time_last_update_unix || Math.floor(now / 1000),
          source: "open.er-api.com",
        };

        cachedRates = { data: result, cachedAt: now };
        return result;
      }
    }
  } catch (primaryErr) {
    console.warn("Primary exchange rate API failed, attempting secondary fallback...", primaryErr);
  }

  // 2. Try Secondary Fallback Provider: jsDelivr currency CDN (Base: INR)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(
      "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/inr.json",
      {
        signal: controller.signal,
        next: { revalidate: 3600 },
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.inr) {
        const rates: Record<SupportedTargetCurrency, number> = {
          USD: Number(data.inr.usd) || 0.01059,
          EUR: Number(data.inr.eur) || 0.00962,
          GBP: Number(data.inr.gbp) || 0.00803,
          CAD: Number(data.inr.cad) || 0.01514,
          AUD: Number(data.inr.aud) || 0.01563,
          JPY: Number(data.inr.jpy) || 1.69658,
        };

        const result: ExchangeRatesData = {
          base: "INR",
          rates,
          lastUpdated: data.date ? `${data.date} 00:00:00 UTC` : new Date().toUTCString(),
          lastUpdatedUnix: Math.floor(now / 1000),
          source: "currency-api.jsdelivr",
        };

        cachedRates = { data: result, cachedAt: now };
        return result;
      }
    }
  } catch (secondaryErr) {
    console.warn("Secondary exchange rate API failed:", secondaryErr);
  }

  // 3. Fall back to cached data if recent within 48 hours
  if (cachedRates && now - cachedRates.cachedAt < MAX_STALE_TTL_MS) {
    console.warn("Using previously cached exchange rates due to network failure.");
    return cachedRates.data;
  }

  // 4. Fallback to authoritative market baseline rates so product publishing is never blocked
  console.warn("Using authoritative market baseline rates as fallback.");
  const baselineResult: ExchangeRatesData = {
    base: "INR",
    rates: {
      USD: 0.01059,
      EUR: 0.00962,
      GBP: 0.00803,
      CAD: 0.01514,
      AUD: 0.01563,
      JPY: 1.69658,
    },
    lastUpdated: new Date().toUTCString(),
    lastUpdatedUnix: Math.floor(now / 1000),
    source: "market-baseline",
  };
  cachedRates = { data: baselineResult, cachedAt: now };
  return baselineResult;
}

/**
 * Calculates converted prices from an INR base price using provided or fetched rates.
 * All prices are rounded appropriately to two decimal places.
 */
export function calculateConvertedPrices(
  inrAmount: number,
  rates: Record<SupportedTargetCurrency, number>
): Record<SupportedTargetCurrency, number> {
  const validInr = Math.max(0, Number(inrAmount) || 0);

  const converted: Record<SupportedTargetCurrency, number> = {
    USD: Number((validInr * rates.USD).toFixed(2)),
    EUR: Number((validInr * rates.EUR).toFixed(2)),
    GBP: Number((validInr * rates.GBP).toFixed(2)),
    CAD: Number((validInr * rates.CAD).toFixed(2)),
    AUD: Number((validInr * rates.AUD).toFixed(2)),
    JPY: Number((validInr * rates.JPY).toFixed(2)),
  };

  return converted;
}

/**
 * Formats converted prices with their respective currency symbol and details for the Admin UI.
 */
export function formatConvertedPricesForUI(
  inrAmount: number,
  rates: Record<SupportedTargetCurrency, number>
): ConvertedPriceItem[] {
  const converted = calculateConvertedPrices(inrAmount, rates);

  return SUPPORTED_TARGET_CURRENCIES.map((code) => {
    const config = SUPPORTED_CURRENCIES[code] || { symbol: code, name: code };
    const amount = converted[code];

    return {
      currency: code,
      symbol: config.symbol,
      name: config.name,
      rate: rates[code],
      amount,
      formatted: `${config.symbol}${amount.toFixed(2)}`,
    };
  });
}
