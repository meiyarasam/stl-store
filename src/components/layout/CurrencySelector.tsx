"use client";

import React, { useState, useRef, useEffect } from "react";
import { useStore } from "@/context/StoreContext";
import { COUNTRIES_LIST, SUPPORTED_CURRENCIES } from "@/lib/currency/currencies";
import { Globe, ChevronDown, Check } from "lucide-react";
import { CurrencyCode } from "@/types";

export function CurrencySelector() {
  const { country, currency, setCountry, setCurrency } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentCountry = COUNTRIES_LIST.find((c) => c.code === country) || COUNTRIES_LIST[0];
  const currentCurrency = SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES.USD;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 hover:text-zinc-900 rounded-md border border-zinc-200 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="text-sm">{currentCountry.flag}</span>
        <span className="font-semibold text-zinc-900">{currentCurrency.code}</span>
        <span className="text-zinc-500">({currentCurrency.symbol})</span>
        <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-lg bg-white shadow-xl border border-zinc-200 z-50 py-2 focus:outline-none animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-2 border-b border-zinc-100">
            <p className="text-xs font-semibold text-zinc-900 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-zinc-500" /> Regional & Currency Preferences
            </p>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Pricing is authoritatively calculated in your selected currency.
            </p>
          </div>

          <div className="max-h-64 overflow-y-auto py-1">
            <div className="px-3 py-1 text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
              Select Your Country
            </div>
            {COUNTRIES_LIST.map((c) => {
              const isSelected = c.code === country;
              return (
                <button
                  key={c.code}
                  onClick={() => {
                    setCountry(c.code);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-zinc-50 transition-colors ${
                    isSelected ? "bg-zinc-50 font-semibold text-zinc-950" : "text-zinc-700"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">{c.flag}</span>
                    <span>{c.name}</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-zinc-500 font-mono text-[11px]">
                    {c.defaultCurrency}
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="border-t border-zinc-100 pt-2 px-3 pb-1">
            <div className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase mb-1">
              Override Currency
            </div>
            <div className="grid grid-cols-4 gap-1">
              {(Object.keys(SUPPORTED_CURRENCIES) as CurrencyCode[]).map((cur) => (
                <button
                  key={cur}
                  onClick={() => {
                    setCurrency(cur);
                    setIsOpen(false);
                  }}
                  className={`px-2 py-1 text-center text-xs rounded border transition-colors ${
                    currency === cur
                      ? "bg-zinc-900 text-white border-zinc-900 font-medium"
                      : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50"
                  }`}
                >
                  {cur}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

