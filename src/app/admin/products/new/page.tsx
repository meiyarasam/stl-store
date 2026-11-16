"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Box,
  DollarSign,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileCode,
  FileArchive,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function NewProductPage() {
  const router = useRouter();

  // General Details
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("cat_miniatures");
  const [shortDescription, setShortDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [supportedPrinters, setSupportedPrinters] = useState("FDM / SLA / Resin");
  const [printingSettings, setPrintingSettings] = useState(
    "Layer Height: 0.16mm | Infill: 20% Gyroid | Supports: None | Material: PLA+"
  );
  const [licenceType, setLicenceType] = useState("Personal Use Only (Non-Commercial)");

  // Media & Previews
  const [imageUrl, setImageUrl] = useState(
    "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1200&q=80"
  );
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Digital Files
  const [stlFileName, setStlFileName] = useState("model_source.stl");
  const [stlFileSize, setStlFileSize] = useState<number>(45000000);
  const [stlStoragePath, setStlStoragePath] = useState<string>("");
  const [isUploadingStl, setIsUploadingStl] = useState(false);

  const [zipFileName, setZipFileName] = useState("model_complete_package.zip");
  const [zipFileSize, setZipFileSize] = useState<number>(95000000);
  const [zipStoragePath, setZipStoragePath] = useState<string>("");
  const [isUploadingZip, setIsUploadingZip] = useState(false);

  // Product Base Price & Live Currency Conversion (Only INR is manually editable)
  const [priceINR, setPriceINR] = useState("999");
  const [exchangeRates, setExchangeRates] = useState<Record<string, number> | null>(null);
  const [ratesLastUpdated, setRatesLastUpdated] = useState<string | null>(null);
  const [isLoadingRates, setIsLoadingRates] = useState<boolean>(true);
  const [ratesError, setRatesError] = useState<string | null>(null);

  // Fetch live exchange rates on mount and on user refresh
  const fetchRates = async (forceRefresh = false) => {
    setIsLoadingRates(true);
    setRatesError(null);
    try {
      const res = await fetch(`/api/currency/rates${forceRefresh ? "?refresh=true" : ""}`);
      const data = await res.json();
      if (!res.ok || !data.success || !data.rates) {
        throw new Error(data.error || "Failed to load live exchange rates.");
      }
      setExchangeRates(data.rates);
      setRatesLastUpdated(data.lastUpdated || new Date().toUTCString());
    } catch (err: any) {
      console.error("Exchange rate fetch error:", err);
      setRatesError(err.message || "Failed to retrieve live exchange rates.");
    } finally {
      setIsLoadingRates(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  // Compute converted prices in real-time based on INR input
  const inrNumeric = Math.max(0, parseFloat(priceINR) || 0);

  const convertedPrices = useMemo(() => {
    if (!exchangeRates || inrNumeric <= 0) {
      return {
        USD: 0,
        EUR: 0,
        GBP: 0,
        CAD: 0,
        AUD: 0,
        JPY: 0,
      };
    }
    return {
      USD: Number((inrNumeric * (exchangeRates.USD || 0.01059)).toFixed(2)),
      EUR: Number((inrNumeric * (exchangeRates.EUR || 0.00962)).toFixed(2)),
      GBP: Number((inrNumeric * (exchangeRates.GBP || 0.00803)).toFixed(2)),
      CAD: Number((inrNumeric * (exchangeRates.CAD || 0.01514)).toFixed(2)),
      AUD: Number((inrNumeric * (exchangeRates.AUD || 0.01563)).toFixed(2)),
      JPY: Number((inrNumeric * (exchangeRates.JPY || 1.69658)).toFixed(2)),
    };
  }, [inrNumeric, exchangeRates]);

  // Form State
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
    );
  };

  // Upload Public Preview Image
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "image");
      formData.append("slug", slug || "preview");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload preview image.");
      }

      if (data.url) {
        setImageUrl(data.url);
      }
    } catch (err: any) {
      setMessage({
        text: err.message || "Failed to upload image. You may also paste an image URL directly.",
        type: "error",
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Upload Private 3D STL Model
  const handleStlFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStlFileName(file.name);
    setStlFileSize(file.size);
    setIsUploadingStl(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "stl");
      formData.append("slug", slug || "model");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload STL model.");
      }

      if (data.storagePath) {
        setStlStoragePath(data.storagePath);
      }
    } catch (err: any) {
      setMessage({
        text: err.message || "Failed to upload STL file to private storage.",
        type: "error",
      });
    } finally {
      setIsUploadingStl(false);
    }
  };

  // Upload Private ZIP Package
  const handleZipFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setZipFileName(file.name);
    setZipFileSize(file.size);
    setIsUploadingZip(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "zip");
      formData.append("slug", slug || "package");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload ZIP archive.");
      }

      if (data.storagePath) {
        setZipStoragePath(data.storagePath);
      }
    } catch (err: any) {
      setMessage({
        text: err.message || "Failed to upload ZIP file to private storage.",
        type: "error",
      });
    } finally {
      setIsUploadingZip(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setMessage(null);

    // Form Client Validation
    if (!title.trim()) {
      setMessage({ text: "Please enter a product title.", type: "error" });
      return;
    }

    if (!priceINR.trim() || inrNumeric <= 0) {
      setMessage({
        text: "Please enter a valid INR base price (₹) greater than 0.",
        type: "error",
      });
      return;
    }

    if (ratesError || !exchangeRates) {
      setMessage({
        text: "Cannot publish product: Live currency exchange rates could not be retrieved. Please check your connection and click Retry.",
        type: "error",
      });
      return;
    }

    if (!imageUrl.trim()) {
      setMessage({ text: "Please provide a valid preview image URL or upload an image.", type: "error" });
      return;
    }

    if (!stlFileName.trim()) {
      setMessage({ text: "Please specify or upload an STL 3D model file.", type: "error" });
      return;
    }

    setIsLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 18000);

    try {
      const cleanSlug =
        slug.trim() ||
        title
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");

      const payload = {
        title: title.trim(),
        slug: cleanSlug,
        categoryId: categoryId || "cat_miniatures",
        shortDescription: shortDescription.trim() || title.trim(),
        fullDescription: fullDescription.trim() || shortDescription.trim() || title.trim(),
        supportedPrinters: supportedPrinters.trim() || "FDM / SLA / Resin",
        printingSettings: printingSettings.trim() || "Standard 3D Print Settings",
        licenceType: licenceType.trim() || "Personal Use Only (Non-Commercial)",
        isPublished: true,
        isFeatured: false,
        inrPrice: inrNumeric,
        exchangeRates: exchangeRates,
        prices: {
          INR: inrNumeric,
          USD: convertedPrices.USD,
          EUR: convertedPrices.EUR,
          GBP: convertedPrices.GBP,
          CAD: convertedPrices.CAD,
          AUD: convertedPrices.AUD,
          JPY: convertedPrices.JPY,
        },
        images: [imageUrl.trim()],
        files: [
          {
            fileName: stlFileName.trim() || "model.stl",
            fileType: "STL",
            fileSizeBytes: stlFileSize || 45000000,
            storagePath: stlStoragePath || `products/${cleanSlug}/${stlFileName.trim() || "model.stl"}`,
          },
          ...(zipFileName.trim()
            ? [
                {
                  fileName: zipFileName.trim(),
                  fileType: "ZIP",
                  fileSizeBytes: zipFileSize || 95000000,
                  storagePath: zipStoragePath || `products/${cleanSlug}/${zipFileName.trim()}`,
                },
              ]
            : []),
        ],
      };

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create product.");
      }

      setMessage({ text: "Product successfully published to the marketplace!", type: "success" });
      setTimeout(() => {
        router.push("/admin/products");
      }, 1200);
    } catch (err: any) {
      clearTimeout(timeoutId);
      const isAbort = err.name === "AbortError";
      setMessage({
        text: isAbort
          ? "Request timed out after 18 seconds. Please check your network connection and try again."
          : err.message || "An unexpected error occurred while publishing the product.",
        type: "error",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 pb-16">
      <AdminNav />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
        <div>
          <Link
            href="/admin/products"
            className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 flex items-center gap-1 mb-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Products
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight font-display">
            Add New 3D Printable Product
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Configure product metadata, multi-currency independent pricing, and digital STL file attachments.
          </p>
        </div>

        {/* Top Notification Banner */}
        {message && (
          <div
            className={`p-4 rounded-xl text-xs flex items-center gap-2.5 transition-all shadow-sm ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            )}
            <span className="font-medium leading-relaxed">{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          {/* Section 1: Core Information */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider pb-2 border-b border-zinc-100 flex items-center gap-2">
              <Box className="w-4 h-4 text-blue-600" />
              1. General Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Product Name *
                </label>
                <Input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Cyberpunk Katana Display Stand"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  URL Slug *
                </label>
                <Input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="cyberpunk-katana-display-stand"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Category *
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="flex h-11 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950 font-medium"
                >
                  <option value="cat_miniatures">Miniatures & Figures</option>
                  <option value="cat_functional">Functional & Mechanical</option>
                  <option value="cat_home_decor">Home & Decor</option>
                  <option value="cat_cosplay">Cosplay & Props</option>
                  <option value="cat_gadgets">Tech & Organization</option>
                  <option value="cat_articulated">Articulated & Toys</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Supported Printers *
                </label>
                <Input
                  type="text"
                  required
                  value={supportedPrinters}
                  onChange={(e) => setSupportedPrinters(e.target.value)}
                  placeholder="FDM / SLA Resin"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Short Description (Card view) *
              </label>
              <Input
                type="text"
                required
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="High-precision print-in-place desk stand with zero assembly required."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Detailed Product Description
              </label>
              <textarea
                rows={4}
                value={fullDescription}
                onChange={(e) => setFullDescription(e.target.value)}
                placeholder="Provide detailed instructions, mechanical tolerance details, print settings, and post-processing recommendations."
                className="w-full rounded-md border border-zinc-300 bg-white p-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Recommended Print Settings
                </label>
                <Input
                  type="text"
                  value={printingSettings}
                  onChange={(e) => setPrintingSettings(e.target.value)}
                  placeholder="Layer Height: 0.16mm | Infill: 20%"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Licence Type
                </label>
                <Input
                  type="text"
                  value={licenceType}
                  onChange={(e) => setLicenceType(e.target.value)}
                  placeholder="Personal Use Only (Non-Commercial)"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Product Pricing & Automated Currency Conversion */}
          <div className="space-y-5 pt-4 border-t border-zinc-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-100">
              <div>
                <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  2. Product Base Pricing & Currency Conversion
                </h2>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  INR is the base currency. All other currency prices are automatically calculated using current exchange rates.
                </p>
              </div>

              {/* Live Exchange Rate Status */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                {isLoadingRates ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    <Loader2 className="w-3 h-3 animate-spin" /> Fetching live rates...
                  </span>
                ) : ratesError ? (
                  <button
                    type="button"
                    onClick={() => fetchRates(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors"
                  >
                    <AlertCircle className="w-3 h-3 text-red-600" /> Rates failed · Retry
                  </button>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Live Exchange Rates</span>
                    <button
                      type="button"
                      title="Refresh Exchange Rates"
                      onClick={() => fetchRates(true)}
                      className="hover:text-emerald-900 p-0.5 rounded transition-colors ml-0.5"
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {ratesError && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-semibold">Live Exchange Rate Notice:</span> {ratesError}
                  <button
                    type="button"
                    onClick={() => fetchRates(true)}
                    className="ml-2 font-bold underline hover:text-red-950"
                  >
                    Click to retry
                  </button>
                </div>
              </div>
            )}

            {/* Product Base Price (INR) - The ONLY editable price field */}
            <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white border border-blue-200/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div>
                  <label className="block text-xs font-bold text-zinc-950 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    Product Base Price — INR Price (₹) *
                  </label>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Enter the master product price in Indian Rupees. All 6 international currencies convert from this value.
                  </p>
                </div>
                <span className="text-[11px] font-bold text-blue-700 bg-white px-2.5 py-1 rounded-lg border border-blue-200/90 shadow-2xs self-start sm:self-auto">
                  Editable Base Currency
                </span>
              </div>

              <div className="relative max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-600 font-bold text-base">
                  ₹
                </div>
                <Input
                  type="number"
                  step="1"
                  min="1"
                  required
                  value={priceINR}
                  onChange={(e) => setPriceINR(e.target.value)}
                  placeholder="e.g. 999"
                  className="pl-8 text-base font-bold text-zinc-950 bg-white shadow-sm border-blue-300 focus:border-blue-600 focus:ring-blue-600 h-11"
                />
              </div>
            </div>

            {/* Automatically Converted Prices - Read Only */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-1.5">
                  Automatically Converted Prices
                </h3>
                <span className="text-[11px] text-zinc-400 font-medium">
                  Read-only · Rounded to 2 decimal places
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  {
                    code: "USD",
                    symbol: "$",
                    name: "US Dollar",
                    flag: "🇺🇸",
                    rate: exchangeRates?.USD || 0.01059,
                    amount: convertedPrices.USD,
                  },
                  {
                    code: "EUR",
                    symbol: "€",
                    name: "Euro",
                    flag: "🇪🇺",
                    rate: exchangeRates?.EUR || 0.00962,
                    amount: convertedPrices.EUR,
                  },
                  {
                    code: "GBP",
                    symbol: "£",
                    name: "British Pound",
                    flag: "🇬🇧",
                    rate: exchangeRates?.GBP || 0.00803,
                    amount: convertedPrices.GBP,
                  },
                  {
                    code: "CAD",
                    symbol: "CA$",
                    name: "Canadian Dollar",
                    flag: "🇨🇦",
                    rate: exchangeRates?.CAD || 0.01514,
                    amount: convertedPrices.CAD,
                  },
                  {
                    code: "AUD",
                    symbol: "A$",
                    name: "Australian Dollar",
                    flag: "🇦🇺",
                    rate: exchangeRates?.AUD || 0.01563,
                    amount: convertedPrices.AUD,
                  },
                  {
                    code: "JPY",
                    symbol: "¥",
                    name: "Japanese Yen",
                    flag: "🇯🇵",
                    rate: exchangeRates?.JPY || 1.69658,
                    amount: convertedPrices.JPY,
                  },
                ].map((item) => (
                  <div
                    key={item.code}
                    className="bg-zinc-50/80 border border-zinc-200/90 rounded-xl p-3 flex flex-col justify-between transition-all hover:bg-zinc-100/60 hover:border-zinc-300"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-zinc-700 flex items-center gap-1">
                        <span>{item.flag}</span>
                        <span>{item.code}</span>
                        <span className="text-zinc-400 font-normal">({item.symbol})</span>
                      </span>
                      <span className="text-[9px] uppercase tracking-wider font-semibold text-zinc-500 bg-zinc-200/80 px-1 py-0.5 rounded">
                        Read-Only
                      </span>
                    </div>

                    <div className="my-1">
                      <div className="text-lg font-black text-zinc-950 font-mono tracking-tight">
                        {item.symbol}{item.amount.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-zinc-500 truncate">
                        {item.name}
                      </div>
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-zinc-200/60 text-[10px] text-zinc-400 font-mono truncate">
                      1 ₹ = {item.rate < 0.1 ? item.rate.toFixed(5) : item.rate.toFixed(3)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Note Banner */}
              <div className="p-3.5 bg-zinc-50 border border-zinc-200/80 rounded-xl text-xs text-zinc-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p className="flex items-center gap-1.5">
                  <span className="text-blue-600 font-bold">ℹ</span>
                  <span>
                    <strong>Note:</strong> INR is the base currency. All other currency prices are automatically calculated using current exchange rates.
                  </span>
                </p>
                {ratesLastUpdated && (
                  <span className="text-zinc-400 text-[11px] font-mono whitespace-nowrap">
                    Last updated: {ratesLastUpdated}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Visual Previews & Downloadable Files */}
          <div className="space-y-5 pt-4 border-t border-zinc-100">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-600" />
                3. Visual Previews & Downloadable Files
              </h2>
              <span className="text-[11px] text-zinc-400">Upload directly or link assets</span>
            </div>

            {/* Preview Image Card */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  Product Preview Image *
                </label>
                {isUploadingImage && (
                  <span className="text-[11px] text-blue-600 flex items-center gap-1 font-semibold">
                    <Loader2 className="w-3 h-3 animate-spin" /> Uploading image...
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-8 space-y-2">
                  <Input
                    type="url"
                    required
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="text-xs font-mono"
                  />
                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-300 hover:bg-zinc-100 rounded-lg text-xs font-semibold text-zinc-800 cursor-pointer transition-colors shadow-sm">
                      <Upload className="w-3.5 h-3.5 text-zinc-600" />
                      <span>Upload from Device</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[11px] text-zinc-400">JPG, PNG, WebP up to 15MB</span>
                  </div>
                </div>

                <div className="md:col-span-4 flex justify-center md:justify-end">
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-zinc-200 bg-white shadow-sm flex items-center justify-center">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt="Preview"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-zinc-300" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 3D STL File Card */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-emerald-600" />
                  Primary 3D STL Model File *
                </label>
                {isUploadingStl ? (
                  <span className="text-[11px] text-blue-600 flex items-center gap-1 font-semibold">
                    <Loader2 className="w-3 h-3 animate-spin" /> Uploading STL to secure storage...
                  </span>
                ) : (
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {(stlFileSize / (1024 * 1024)).toFixed(1)} MB
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <Input
                  type="text"
                  required
                  value={stlFileName}
                  onChange={(e) => setStlFileName(e.target.value)}
                  placeholder="model_source.stl"
                  className="text-xs font-mono"
                />
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-300 hover:bg-zinc-100 rounded-lg text-xs font-semibold text-zinc-800 cursor-pointer transition-colors shadow-sm">
                    <Upload className="w-3.5 h-3.5 text-zinc-600" />
                    <span>Upload .STL / .3MF File</span>
                    <input
                      type="file"
                      accept=".stl,.obj,.3mf"
                      onChange={handleStlFileUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-zinc-400">STL, OBJ, 3MF up to 150MB</span>
                </div>
              </div>
            </div>

            {/* Optional ZIP Archive Card */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                  <FileArchive className="w-4 h-4 text-amber-600" />
                  Complete ZIP Package Archive (Optional)
                </label>
                {isUploadingZip ? (
                  <span className="text-[11px] text-blue-600 flex items-center gap-1 font-semibold">
                    <Loader2 className="w-3 h-3 animate-spin" /> Uploading ZIP...
                  </span>
                ) : (
                  <span className="text-[11px] text-zinc-500 font-semibold">
                    {(zipFileSize / (1024 * 1024)).toFixed(1)} MB
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <Input
                  type="text"
                  value={zipFileName}
                  onChange={(e) => setZipFileName(e.target.value)}
                  placeholder="model_complete_package.zip"
                  className="text-xs font-mono"
                />
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-300 hover:bg-zinc-100 rounded-lg text-xs font-semibold text-zinc-800 cursor-pointer transition-colors shadow-sm">
                    <Upload className="w-3.5 h-3.5 text-zinc-600" />
                    <span>Upload .ZIP Archive</span>
                    <input
                      type="file"
                      accept=".zip,.rar,.7z"
                      onChange={handleZipFileUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-zinc-400">Multi-part ZIP/RAR up to 250MB</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Error & Action Bar */}
          <div className="pt-4 border-t border-zinc-100 space-y-4">
            {message && (
              <div
                className={`p-4 rounded-xl text-xs flex items-center gap-2.5 transition-all shadow-sm ${
                  message.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                )}
                <span className="font-semibold leading-relaxed">{message.text}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              disabled={isLoading || Boolean(ratesError) || !exchangeRates}
              className="w-full text-sm font-bold shadow-md bg-zinc-950 text-white hover:bg-zinc-800 active:bg-zinc-900 transition-all py-3.5 h-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? "Publishing Product to The Print Factory..."
                : ratesError
                ? "Exchange Rates Required to Publish"
                : "Publish Product to Marketplace"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
