"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CurrencyCode, ProductDTO } from "@/types";
import { COUNTRIES_LIST, getCurrencyConfig, getEffectiveProductPrice } from "@/lib/currency/currencies";

export interface CartItem {
  product: ProductDTO;
  quantity: number;
}

interface StoreContextType {
  // Currency & Country
  country: string;
  currency: CurrencyCode;
  setCountry: (countryCode: string) => void;
  setCurrency: (currencyCode: CurrencyCode) => void;
  formatAmount: (amount: number) => string;
  getProductPrice: (product: ProductDTO) => { amount: number; isConfiguredExplicitly: boolean };

  // Cart
  cart: CartItem[];
  addToCart: (product: ProductDTO, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [country, setCountryState] = useState<string>("US");
  const [currency, setCurrencyState] = useState<CurrencyCode>("USD");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Initialize from localStorage or browser locale
  useEffect(() => {
    try {
      const savedCountry = localStorage.getItem("stlforge_country");
      const savedCurrency = localStorage.getItem("stlforge_currency") as CurrencyCode;
      const savedCart = localStorage.getItem("stlforge_cart");

      if (savedCountry) {
        setCountryState(savedCountry);
      }
      if (savedCurrency) {
        setCurrencyState(savedCurrency);
      } else if (!savedCountry) {
        // Try guessing country / currency
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
        if (timeZone.includes("Calcutta") || timeZone.includes("Kolkata") || timeZone.includes("India")) {
          setCountryState("IN");
          setCurrencyState("INR");
        } else if (timeZone.includes("London")) {
          setCountryState("GB");
          setCurrencyState("GBP");
        } else if (timeZone.includes("Berlin") || timeZone.includes("Paris") || timeZone.includes("Madrid")) {
          setCountryState("DE");
          setCurrencyState("EUR");
        } else if (timeZone.includes("Tokyo")) {
          setCountryState("JP");
          setCurrencyState("JPY");
        }
      }

      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (e) {
      console.warn("Storage initialization notice:", e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save Cart Changes
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem("stlforge_cart", JSON.stringify(cart));
    } catch (e) {}
  }, [cart, isInitialized]);

  // Set Country and update default currency
  const setCountry = (countryCode: string) => {
    setCountryState(countryCode);
    try {
      localStorage.setItem("stlforge_country", countryCode);
    } catch (e) {}

    const countryObj = COUNTRIES_LIST.find((c) => c.code === countryCode);
    if (countryObj) {
      setCurrency(countryObj.defaultCurrency);
    }
  };

  // Set Currency
  const setCurrency = (currencyCode: CurrencyCode) => {
    setCurrencyState(currencyCode);
    try {
      localStorage.setItem("stlforge_currency", currencyCode);
      document.cookie = `stlforge_currency=${currencyCode}; path=/; max-age=2592000`;
    } catch (e) {}
  };

  const getProductPrice = (product: ProductDTO) => {
    return getEffectiveProductPrice(product.prices, currency);
  };

  const formatAmount = (amount: number): string => {
    const config = getCurrencyConfig(currency);
    const formatted = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
    }).format(amount);

    return `${config.symbol}${formatted}`;
  };

  const addToCart = (product: ProductDTO, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        // Digital STL items typically 1 per order to avoid accidental duplicate charges
        return prev;
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((total, item) => {
    const { amount } = getEffectiveProductPrice(item.product.prices, currency);
    return total + amount * item.quantity;
  }, 0);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <StoreContext.Provider
      value={{
        country,
        currency,
        setCountry,
        setCurrency,
        formatAmount,
        getProductPrice,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        cartTotal,
        cartCount,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}

