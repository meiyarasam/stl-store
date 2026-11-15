"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Box, DollarSign, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function NewProductPage() {
  const router = useRouter();

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
  const [imageUrl, setImageUrl] = useState(
    "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1200&q=80"
  );

  // Multi-Currency Prices
  const [priceUSD, setPriceUSD] = useState("9.99");
  const [priceINR, setPriceINR] = useState("699");
  const [priceEUR, setPriceEUR] = useState("9.49");
  const [priceGBP, setPriceGBP] = useState("8.49");
  const [priceCAD, setPriceCAD] = useState("13.99");
  const [priceAUD, setPriceAUD] = useState("15.99");
  const [priceJPY, setPriceJPY] = useState("1500");

  const [stlFileName, setStlFileName] = useState("model_source.stl");
  const [zipFileName, setZipFileName] = useState("model_complete_package.zip");

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const payload = {
        title,
        slug,
        categoryId,
        shortDescription,
        fullDescription,
        supportedPrinters,
        printingSettings,
        licenceType,
        isPublished: true,
        isFeatured: false,
        prices: {
          USD: parseFloat(priceUSD),
          INR: parseFloat(priceINR),
          EUR: parseFloat(priceEUR),
          GBP: parseFloat(priceGBP),
          CAD: parseFloat(priceCAD),
          AUD: parseFloat(priceAUD),
          JPY: parseFloat(priceJPY),
        },
        images: [imageUrl],
        files: [
          { fileName: stlFileName, fileType: "STL", fileSizeBytes: 45000000 },
          { fileName: zipFileName, fileType: "ZIP", fileSizeBytes: 95000000 },
        ],
      };

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create product");
      }

      setMessage({ text: "Product successfully created and published!", type: "success" });
      setTimeout(() => {
        router.push("/admin/products");
      }, 1200);
    } catch (err: any) {
      setMessage({ text: err.message || "An error occurred", type: "error" });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50/50">
      <AdminNav />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div>
          <Link
            href="/admin/products"
            className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Products
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight font-display">
            Add New 3D Printable Product
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Configure metadata, multi-currency independent pricing, and digital STL file attachments.
          </p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg text-xs flex items-center gap-2 ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 bg-white border border-zinc-200 rounded-xl p-8 shadow-sm">
          {/* Core Information */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider pb-2 border-b border-zinc-100">
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
                  className="flex h-11 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950"
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
                placeholder="High precision display stand with angled weapon cradle."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Full Description *
              </label>
              <textarea
                required
                rows={4}
                value={fullDescription}
                onChange={(e) => setFullDescription(e.target.value)}
                className="w-full rounded-md border border-zinc-300 bg-white p-3 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950 leading-relaxed"
                placeholder="Comprehensive overview of design, geometry notes, and assembly instructions..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Tested Slicer & Printing Settings
              </label>
              <textarea
                rows={2}
                value={printingSettings}
                onChange={(e) => setPrintingSettings(e.target.value)}
                className="w-full rounded-md border border-zinc-300 bg-white p-3 text-xs font-mono text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950"
              />
            </div>
          </div>

          {/* International Multi-Currency Pricing */}
          <div className="space-y-4 pt-4 border-t border-zinc-100">
            <div>
              <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
                2. Multi-Currency Independent Pricing
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Configure explicit prices for each international currency (no automatic lossy exchange rate conversions).
              </p>
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
                  CAD Price (CA$) *
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
                  AUD Price (A$) *
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

          {/* Media & Digital File Assets */}
          <div className="space-y-4 pt-4 border-t border-zinc-100">
            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider pb-2 border-b border-zinc-100">
              3. Visual Previews & Downloadable Files
            </h2>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Preview Image URL *
              </label>
              <Input
                type="url"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  STL File Name *
                </label>
                <Input
                  type="text"
                  required
                  value={stlFileName}
                  onChange={(e) => setStlFileName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  ZIP Package Archive Name *
                </label>
                <Input
                  type="text"
                  required
                  value={zipFileName}
                  onChange={(e) => setZipFileName(e.target.value)}
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full text-sm font-bold shadow-md"
          >
            Publish Product to Marketplace
          </Button>
        </form>
      </div>
    </div>
  );
}
