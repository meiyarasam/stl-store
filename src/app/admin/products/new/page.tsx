"use client";

import React, { useState } from "react";
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

  // Multi-Currency Prices
  const [priceUSD, setPriceUSD] = useState("9.99");
  const [priceINR, setPriceINR] = useState("699");
  const [priceEUR, setPriceEUR] = useState("9.49");
  const [priceGBP, setPriceGBP] = useState("8.49");
  const [priceCAD, setPriceCAD] = useState("13.99");
  const [priceAUD, setPriceAUD] = useState("15.99");
  const [priceJPY, setPriceJPY] = useState("1500");

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
        prices: {
          USD: parseFloat(priceUSD) || 9.99,
          INR: parseFloat(priceINR) || 699,
          EUR: parseFloat(priceEUR) || 9.49,
          GBP: parseFloat(priceGBP) || 8.49,
          CAD: parseFloat(priceCAD) || 13.99,
          AUD: parseFloat(priceAUD) || 15.99,
          JPY: parseFloat(priceJPY) || 1500,
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

          {/* Section 2: Multi-Currency Pricing */}
          <div className="space-y-4 pt-4 border-t border-zinc-100">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                2. Multi-Currency Pricing
              </h2>
              <span className="text-[11px] text-zinc-400">Independent manual pricing per currency</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  USD Price ($) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  required
                  value={priceUSD}
                  onChange={(e) => setPriceUSD(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  INR Price (₹) *
                </label>
                <Input
                  type="number"
                  step="1"
                  required
                  value={priceINR}
                  onChange={(e) => setPriceINR(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  EUR Price (€) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  required
                  value={priceEUR}
                  onChange={(e) => setPriceEUR(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  GBP Price (£) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  required
                  value={priceGBP}
                  onChange={(e) => setPriceGBP(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  CAD Price ($) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  required
                  value={priceCAD}
                  onChange={(e) => setPriceCAD(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  AUD Price ($) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  required
                  value={priceAUD}
                  onChange={(e) => setPriceAUD(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  JPY Price (¥) *
                </label>
                <Input
                  type="number"
                  step="1"
                  required
                  value={priceJPY}
                  onChange={(e) => setPriceJPY(e.target.value)}
                />
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
              className="w-full text-sm font-bold shadow-md bg-zinc-950 text-white hover:bg-zinc-800 active:bg-zinc-900 transition-all py-3.5 h-auto"
            >
              {isLoading ? "Publishing Product to The Print Factory..." : "Publish Product to Marketplace"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
