"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
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
  X,
  FolderUp,
  FolderArchive,
  Folder,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import JSZip from "jszip";
import { uploadFileToStorage } from "@/lib/storage/clientUpload";
import { safeFetchJson } from "@/lib/api/safeFetch";

export default function NewProductPage() {
  const router = useRouter();

  // General Details
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("cat_miniatures");
  const [shortDescription, setShortDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [supportedPrinters, setSupportedPrinters] = useState("FDM / SLA / Resin");
  const [printingSettings, setPrintingSettings] = useState("");
  const [licenceType, setLicenceType] = useState("Personal Use Only (Non-Commercial)");
  const [isPublished, setIsPublished] = useState<boolean>(true);
  const [isFeatured, setIsFeatured] = useState<boolean>(true);

  // 1. Product Preview Image (Strictly direct device upload, no external URLs)
  const [imageUrl, setImageUrl] = useState("");
  const [localImagePreview, setLocalImagePreview] = useState("");
  const [imageFileName, setImageFileName] = useState("");
  const [imageFileSize, setImageFileSize] = useState<number>(0);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageProgress, setImageProgress] = useState<number>(0);
  const [imageError, setImageError] = useState<string | null>(null);

  // 2. Primary 3D STL / 3MF Model File (Optional)
  const [stlFileName, setStlFileName] = useState("");
  const [stlFileSize, setStlFileSize] = useState<number>(0);
  const [stlStoragePath, setStlStoragePath] = useState<string>("");
  const [isUploadingStl, setIsUploadingStl] = useState(false);
  const [stlProgress, setStlProgress] = useState<number>(0);
  const [stlError, setStlError] = useState<string | null>(null);

  // 3. Package Archive (ZIP or Folder)
  const [packageMode, setPackageMode] = useState<"zip" | "folder">("zip");
  const [zipFileName, setZipFileName] = useState("");
  const [zipFileSize, setZipFileSize] = useState<number>(0);
  const [zipStoragePath, setZipStoragePath] = useState<string>("");
  const [isUploadingZip, setIsUploadingZip] = useState(false);
  const [zipProgress, setZipProgress] = useState<number>(0);
  const [zipError, setZipError] = useState<string | null>(null);
  const [isZippingFolder, setIsZippingFolder] = useState(false);
  const [zippingProgress, setZippingProgress] = useState<number>(0);
  const [folderFileCount, setFolderFileCount] = useState<number>(0);
  const [isPackagedFromFolder, setIsPackagedFromFolder] = useState<boolean>(false);

  // Product Base Price & Live Currency Conversion (Only INR is editable)
  const [priceINR, setPriceINR] = useState("999");
  const [exchangeRates, setExchangeRates] = useState<Record<string, number> | null>(null);
  const [ratesLastUpdated, setRatesLastUpdated] = useState<string | null>(null);
  const [isLoadingRates, setIsLoadingRates] = useState<boolean>(true);

  // Form State
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const stlInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Ensure folder upload attributes are active on webkit/chromium browsers
  useEffect(() => {
    if (folderInputRef.current) {
      folderInputRef.current.setAttribute("webkitdirectory", "");
      folderInputRef.current.setAttribute("directory", "");
    }
  }, []);

  // Fetch live exchange rates on mount and on user refresh
  const fetchRates = async (forceRefresh = false) => {
    setIsLoadingRates(true);
    try {
      const res = await safeFetchJson<{ rates: Record<string, number>; lastUpdated?: string }>(
        `/api/currency/rates${forceRefresh ? "?refresh=true" : ""}`
      );
      if (res.success && res.data?.rates) {
        setExchangeRates(res.data.rates);
        setRatesLastUpdated(res.data.lastUpdated || new Date().toUTCString());
      } else {
        throw new Error(res.error || "Failed to load rates");
      }
    } catch (err: any) {
      console.warn("Exchange rate fetch notice:", err);
      // Fallback baseline rates so publishing is never blocked
      setExchangeRates({
        USD: 0.01059,
        EUR: 0.00962,
        GBP: 0.00803,
        CAD: 0.01514,
        AUD: 0.01563,
        JPY: 1.69658,
      });
      setRatesLastUpdated(new Date().toUTCString());
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
    const rates = exchangeRates || {
      USD: 0.01059,
      EUR: 0.00962,
      GBP: 0.00803,
      CAD: 0.01514,
      AUD: 0.01563,
      JPY: 1.69658,
    };

    if (inrNumeric <= 0) {
      return { USD: 0, EUR: 0, GBP: 0, CAD: 0, AUD: 0, JPY: 0 };
    }

    return {
      USD: Number((inrNumeric * rates.USD).toFixed(2)),
      EUR: Number((inrNumeric * rates.EUR).toFixed(2)),
      GBP: Number((inrNumeric * rates.GBP).toFixed(2)),
      CAD: Number((inrNumeric * rates.CAD).toFixed(2)),
      AUD: Number((inrNumeric * rates.AUD).toFixed(2)),
      JPY: Number((inrNumeric * rates.JPY).toFixed(2)),
    };
  }, [inrNumeric, exchangeRates]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
    );
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes <= 0) return "0 MB";
    const mb = bytes / (1024 * 1024);
    if (mb < 0.1) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${mb.toFixed(1)} MB`;
  };

  // 1. Handle Product Image Upload
  const handleImageFileUpload = async (file: File) => {
    if (!file) return;

    // Validate format
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const allowed = ["jpg", "jpeg", "png", "webp"];
    if (!allowed.includes(ext)) {
      setImageError(`Invalid format .${ext}. Only JPG, JPEG, PNG, and WebP are allowed.`);
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setImageError(`File exceeds 15 MB limit (${formatBytes(file.size)}).`);
      return;
    }

    // Instant local preview
    try {
      const objUrl = URL.createObjectURL(file);
      setLocalImagePreview(objUrl);
    } catch (e) {}

    setImageFileName(file.name);
    setImageFileSize(file.size);
    setIsUploadingImage(true);
    setImageProgress(0);
    setImageError(null);
    setMessage(null);

    try {
      const result = await uploadFileToStorage({
        file,
        uploadType: "image",
        slug: slug || "preview",
        onProgress: (p) => setImageProgress(p),
      });

      if (result.publicUrl) {
        setImageUrl(result.publicUrl);
      } else if (result.storagePath) {
        setImageUrl(result.storagePath);
      }
      setImageProgress(100);
    } catch (err: any) {
      console.error("Image storage upload error:", err);
      setImageError(err.message || "Failed to upload image to Supabase Storage.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  // 2. Handle Primary 3D STL / 3MF Upload (Optional)
  const handleStlFileUpload = async (file: File) => {
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const allowed = ["stl", "obj", "3mf"];
    if (!allowed.includes(ext)) {
      setStlError(`Invalid format .${ext}. Only .STL, .3MF, and .OBJ 3D models are allowed.`);
      return;
    }

    if (file.size > 150 * 1024 * 1024) {
      setStlError(`File exceeds 150 MB limit (${formatBytes(file.size)}).`);
      return;
    }

    // Prevent duplicate upload
    if (stlFileName === file.name && stlFileSize === file.size && stlStoragePath) {
      return;
    }

    setStlFileName(file.name);
    setStlFileSize(file.size);
    setIsUploadingStl(true);
    setStlProgress(0);
    setStlError(null);
    setMessage(null);

    try {
      const result = await uploadFileToStorage({
        file,
        uploadType: "stl",
        slug: slug || "model",
        onProgress: (p) => setStlProgress(p),
      });

      if (!result.storagePath) {
        throw new Error("Storage provider did not return a confirmed storage path.");
      }

      setStlStoragePath(result.storagePath);
      setStlProgress(100);
    } catch (err: any) {
      console.error("STL storage upload error:", err);
      setStlError(err.message || "Failed to upload STL model to private storage.");
      setStlStoragePath("");
    } finally {
      setIsUploadingStl(false);
      if (stlInputRef.current) stlInputRef.current.value = "";
    }
  };

  // 3. Handle ZIP Package Upload (Option A)
  const handleZipFileUpload = async (file: File, fromFolder = false) => {
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (ext !== "zip") {
      setZipError(`Invalid package format .${ext}. Only .ZIP packages are allowed.`);
      return;
    }

    if (file.size > 250 * 1024 * 1024) {
      setZipError(`File exceeds 250 MB limit (${formatBytes(file.size)}).`);
      return;
    }

    // Prevent duplicate upload
    if (zipFileName === file.name && zipFileSize === file.size && zipStoragePath) {
      return;
    }

    setZipFileName(file.name);
    setZipFileSize(file.size);
    setIsPackagedFromFolder(fromFolder);
    setIsUploadingZip(true);
    setZipProgress(0);
    setZipError(null);
    setMessage(null);

    try {
      const result = await uploadFileToStorage({
        file,
        uploadType: "zip",
        slug: slug || "package",
        onProgress: (p) => setZipProgress(p),
      });

      if (!result.storagePath) {
        throw new Error("Storage provider did not return a confirmed storage path.");
      }

      setZipStoragePath(result.storagePath);
      setZipProgress(100);
    } catch (err: any) {
      console.error("ZIP storage upload error:", err);
      setZipError(err.message || "Failed to upload ZIP archive to private storage.");
      setZipStoragePath("");
    } finally {
      setIsUploadingZip(false);
      if (zipInputRef.current) zipInputRef.current.value = "";
    }
  };

  // 4. Handle Folder Upload (Option B: packages folder to ZIP preserving nested structure)
  const handleFolderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList);
    setZipError(null);
    setMessage(null);

    // Filter out OS-generated junk files
    const cleanFiles = files.filter(
      (f) => !f.name.startsWith("._") && f.name !== ".DS_Store" && f.name !== "Thumbs.db"
    );

    if (cleanFiles.length === 0) {
      setZipError("Selected folder contains no valid files.");
      if (folderInputRef.current) folderInputRef.current.value = "";
      return;
    }

    // 1. Calculate uncompressed folder size
    let totalBytes = 0;
    for (const f of cleanFiles) {
      totalBytes += f.size;
    }

    if (totalBytes > 250 * 1024 * 1024) {
      setZipError(`Folder total uncompressed size (${formatBytes(totalBytes)}) exceeds the 250 MB limit.`);
      if (folderInputRef.current) folderInputRef.current.value = "";
      return;
    }

    // 2. Derive root folder name
    const firstRel = cleanFiles[0].webkitRelativePath || cleanFiles[0].name;
    const rootName = firstRel.includes("/") ? firstRel.split("/")[0] : (slug || "folder_package");
    const zipName = `${rootName}.zip`;

    setFolderFileCount(cleanFiles.length);
    setIsZippingFolder(true);
    setZippingProgress(0);

    try {
      const zip = new JSZip();

      // Add each file with preserved relative path structure
      for (const file of cleanFiles) {
        const relativePath = file.webkitRelativePath || file.name;
        zip.file(relativePath, file);
      }

      // Generate ZIP blob with progress callback
      const zipBlob = await zip.generateAsync(
        {
          type: "blob",
          compression: "DEFLATE",
          compressionOptions: { level: 6 },
        },
        (metadata) => {
          setZippingProgress(Math.round(metadata.percent));
        }
      );

      setIsZippingFolder(false);

      // Create standard File from Blob preserving original folder name
      const packagedZipFile = new File([zipBlob], zipName, {
        type: "application/zip",
        lastModified: Date.now(),
      });

      // Upload to Supabase Storage
      await handleZipFileUpload(packagedZipFile, true);
    } catch (err: any) {
      console.error("Folder zipping error:", err);
      setZipError(`Failed to package folder: ${err.message || "Unknown error"}`);
      setIsZippingFolder(false);
    } finally {
      if (folderInputRef.current) folderInputRef.current.value = "";
    }
  };

  // Publish Product to Marketplace
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

    if (!imageUrl.trim()) {
      setMessage({
        text: "Please select and upload an actual product preview image.",
        type: "error",
      });
      return;
    }

    // At least one downloadable file (STL or ZIP/folder package) must exist
    const hasDownloadableFile = Boolean(stlStoragePath.trim() || zipStoragePath.trim());
    if (!hasDownloadableFile) {
      setMessage({
        text: "Please upload at least one downloadable file: either an individual STL model file or a ZIP/folder package.",
        type: "error",
      });
      return;
    }

    if (isUploadingImage || isUploadingStl || isUploadingZip || isZippingFolder) {
      setMessage({
        text: "File uploads or packaging are still in progress. Please wait for completion before publishing.",
        type: "error",
      });
      return;
    }

    setIsLoading(true);

    try {
      const cleanSlug =
        slug.trim() ||
        title
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");

      const activeRates = exchangeRates || {
        USD: 0.01059,
        EUR: 0.00962,
        GBP: 0.00803,
        CAD: 0.01514,
        AUD: 0.01563,
        JPY: 1.69658,
      };

      // Lightweight JSON payload (< 3 KB) - never exceeds Vercel limits
      const payload = {
        title: title.trim(),
        slug: cleanSlug,
        categoryId: categoryId || "cat_miniatures",
        shortDescription: shortDescription.trim() || title.trim(),
        fullDescription: fullDescription.trim() || shortDescription.trim() || title.trim(),
        supportedPrinters: supportedPrinters.trim() || "FDM / SLA / Resin",
        printingSettings: printingSettings.trim() || "",
        licenceType: licenceType.trim() || "Personal Use Only (Non-Commercial)",
        isPublished,
        isFeatured,
        inrPrice: inrNumeric,
        exchangeRates: activeRates,
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
          ...(stlFileName.trim() && stlStoragePath.trim()
            ? [
                {
                  fileName: stlFileName.trim(),
                  fileType: stlFileName.endsWith(".3mf")
                    ? "THREE_MF"
                    : stlFileName.endsWith(".obj")
                    ? "OBJ"
                    : "STL",
                  fileSizeBytes: stlFileSize || 45000000,
                  storagePath: stlStoragePath.trim(),
                },
              ]
            : []),
          ...(zipFileName.trim() && zipStoragePath.trim()
            ? [
                {
                  fileName: zipFileName.trim(),
                  fileType: "ZIP",
                  fileSizeBytes: zipFileSize || 95000000,
                  storagePath: zipStoragePath.trim(),
                },
              ]
            : []),
        ],
      };

      const res = await safeFetchJson<{ product: any }>("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.success) {
        throw new Error(res.error || res.message || "Failed to publish product.");
      }

      setMessage({
        text: "Product successfully published to The Print Factory marketplace!",
        type: "success",
      });

      setTimeout(() => {
        router.push("/admin/products");
      }, 1200);
    } catch (err: any) {
      setMessage({
        text: err.message || "An unexpected error occurred while publishing the product.",
        type: "error",
      });
      setIsLoading(false);
    }
  };

  const isPublishDisabled =
    isLoading ||
    isUploadingImage ||
    isUploadingStl ||
    isUploadingZip ||
    isZippingFolder ||
    !imageUrl.trim() ||
    (!stlStoragePath.trim() && !zipStoragePath.trim());

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
            Upload genuine 3D printable files, configure INR base pricing with live conversion, and publish to the marketplace.
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

            {/* Visibility & Showcase Options */}
            <div className="flex flex-wrap items-center gap-6 py-1 bg-zinc-50 border border-zinc-200/80 rounded-lg p-3">
              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-800 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-4 h-4 rounded text-zinc-950 border-zinc-300 focus:ring-zinc-950"
                />
                <span>Published on Marketplace</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-800 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-zinc-950 border-zinc-300 focus:ring-zinc-950"
                />
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Feature on Homepage (Featured 3D Models)
                </span>
              </label>
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
                  INR is the master currency. Converted prices update automatically in real-time.
                </p>
              </div>

              {/* Live Exchange Rate Status */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                {isLoadingRates ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    <Loader2 className="w-3 h-3 animate-spin" /> Fetching live rates...
                  </span>
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

          {/* Section 3: Visual Previews & Real File Uploads */}
          <div className="space-y-5 pt-4 border-t border-zinc-100">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-600" />
                3. Visual Previews & Downloadable Files
              </h2>
              <span className="text-[11px] text-zinc-400">Direct upload to Supabase Storage</span>
            </div>

            {/* 1. Product Preview Image Card */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    Product Preview Image *
                  </label>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Upload the main product photo shown on marketplace cards and the product page.
                  </p>
                </div>

                {isUploadingImage ? (
                  <span className="text-[11px] text-blue-600 flex items-center gap-1.5 font-semibold">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading: {imageProgress}%
                  </span>
                ) : (localImagePreview || imageUrl) ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Image Ready ({formatBytes(imageFileSize)})
                  </span>
                ) : (
                  <span className="text-[11px] text-amber-600 font-semibold">
                    Upload Required
                  </span>
                )}
              </div>

              {/* Error Banner */}
              {imageError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{imageError}</span>
                </div>
              )}

              {/* Progress Bar */}
              {isUploadingImage && (
                <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-150"
                    style={{ width: `${imageProgress}%` }}
                  />
                </div>
              )}

              {/* Hidden File Input */}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageFileUpload(file);
                }}
                className="hidden"
              />

              {(localImagePreview || imageUrl) ? (
                /* Active Image Uploaded Preview Card */
                <div className="bg-white border border-emerald-300 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4 shadow-2xs">
                  <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200 shrink-0 shadow-xs">
                    <Image
                      src={localImagePreview || imageUrl}
                      alt="Uploaded Product Preview"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 text-center sm:text-left space-y-1">
                    <div className="flex items-center justify-center sm:justify-start gap-1.5">
                      <span className="text-xs font-bold text-zinc-900 truncate">
                        {imageFileName || "Uploaded Preview Image"}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {imageUrl ? "Uploaded to Storage" : "Ready"}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 font-mono">
                      {formatBytes(imageFileSize)} · Stored in stl-images-public
                    </p>

                    <div className="pt-2 flex items-center justify-center sm:justify-start gap-2">
                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        disabled={isUploadingImage}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Replace Image</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setImageUrl("");
                          setLocalImagePreview("");
                          setImageFileName("");
                          setImageFileSize(0);
                        }}
                        disabled={isUploadingImage}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Upload Drop Area when no image */
                <div
                  onClick={() => imageInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleImageFileUpload(file);
                  }}
                  className="border-2 border-dashed border-zinc-300 hover:border-blue-500 hover:bg-blue-50/30 rounded-xl p-6 text-center cursor-pointer transition-all group"
                >
                  <Upload className="w-8 h-8 text-zinc-400 group-hover:text-blue-600 mx-auto mb-2 transition-colors" />
                  <p className="text-xs font-bold text-zinc-800">
                    Click to select preview image from your computer (or drag & drop)
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Accepts JPG, JPEG, PNG, and WebP up to 15MB
                  </p>
                </div>
              )}
            </div>

            {/* 2. Primary 3D STL Model File Upload (Optional) */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-emerald-600" />
                    Primary 3D STL / 3MF Model File (Optional)
                  </label>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Optional individual model upload to secure private storage (stl-files-private).
                  </p>
                </div>

                {isUploadingStl ? (
                  <span className="text-[11px] text-blue-600 flex items-center gap-1.5 font-semibold">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading: {stlProgress}%
                  </span>
                ) : stlStoragePath ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Stored: {formatBytes(stlFileSize)}
                  </span>
                ) : (
                  <span className="text-[11px] text-zinc-400 font-medium">
                    Optional
                  </span>
                )}
              </div>

              {/* Error Banner */}
              {stlError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{stlError}</span>
                </div>
              )}

              {/* Progress Bar */}
              {isUploadingStl && (
                <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-1.5 rounded-full transition-all duration-150"
                    style={{ width: `${stlProgress}%` }}
                  />
                </div>
              )}

              {/* Hidden STL File Input */}
              <input
                ref={stlInputRef}
                type="file"
                accept=".stl,.obj,.3mf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleStlFileUpload(file);
                }}
                className="hidden"
              />

              {stlStoragePath ? (
                <div className="bg-white border border-emerald-300 rounded-xl p-4 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                      STL
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-zinc-900 truncate">{stlFileName}</p>
                      <p className="text-[11px] text-zinc-500">
                        {formatBytes(stlFileSize)} · Stored securely in <span className="font-mono text-emerald-700">stl-files-private</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => stlInputRef.current?.click()}
                      disabled={isUploadingStl}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Replace</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setStlStoragePath("");
                        setStlFileName("");
                        setStlFileSize(0);
                      }}
                      disabled={isUploadingStl}
                      className="p-1.5 text-zinc-400 hover:text-red-600 rounded-md transition-colors"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => stlInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleStlFileUpload(file);
                  }}
                  className="border-2 border-dashed border-zinc-300 hover:border-emerald-500 hover:bg-emerald-50/30 rounded-xl p-6 text-center cursor-pointer transition-all group"
                >
                  <FileCode className="w-8 h-8 text-zinc-400 group-hover:text-emerald-600 mx-auto mb-2 transition-colors" />
                  <p className="text-xs font-bold text-zinc-800">
                    Click to select optional .STL / .3MF / .OBJ file from your computer (or drag & drop)
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Accepts genuine .STL, .3MF, and .OBJ binary models up to 150MB
                  </p>
                </div>
              )}
            </div>

            {/* 3. Package Archive (ZIP OR Folder Upload) */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <label className="block text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                    <FileArchive className="w-4 h-4 text-amber-600" />
                    Package Archive (ZIP or Folder)
                  </label>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Upload an existing .ZIP archive or select an entire folder from your computer.
                  </p>
                </div>

                {isZippingFolder ? (
                  <span className="text-[11px] text-amber-700 flex items-center gap-1.5 font-semibold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 shrink-0">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" /> Packaging Folder: {zippingProgress}%
                  </span>
                ) : isUploadingZip ? (
                  <span className="text-[11px] text-blue-600 flex items-center gap-1.5 font-semibold bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 shrink-0">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading to Storage: {zipProgress}%
                  </span>
                ) : zipStoragePath ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" /> Stored: {formatBytes(zipFileSize)}
                  </span>
                ) : (
                  <span className="text-[11px] text-zinc-400 font-medium">
                    Optional if STL is uploaded
                  </span>
                )}
              </div>

              {/* Two Clear Choices: Upload ZIP Archive vs Upload Folder */}
              {!zipStoragePath && !isUploadingZip && !isZippingFolder && (
                <div className="grid grid-cols-2 gap-2 bg-zinc-200/60 p-1 rounded-lg border border-zinc-200">
                  <button
                    type="button"
                    onClick={() => {
                      setPackageMode("zip");
                      setZipError(null);
                    }}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-bold transition-all ${
                      packageMode === "zip"
                        ? "bg-white text-zinc-950 shadow-xs border border-zinc-200"
                        : "text-zinc-600 hover:text-zinc-900"
                    }`}
                  >
                    <FileArchive className="w-4 h-4 text-amber-600" />
                    <span>Upload ZIP Archive</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPackageMode("folder");
                      setZipError(null);
                    }}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-bold transition-all ${
                      packageMode === "folder"
                        ? "bg-white text-zinc-950 shadow-xs border border-zinc-200"
                        : "text-zinc-600 hover:text-zinc-900"
                    }`}
                  >
                    <FolderUp className="w-4 h-4 text-blue-600" />
                    <span>Upload Folder</span>
                  </button>
                </div>
              )}

              {/* Error Banner */}
              {zipError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{zipError}</span>
                </div>
              )}

              {/* Packaging / Uploading Progress Bars */}
              {isZippingFolder && (
                <div className="space-y-1.5 bg-amber-50/60 p-3 rounded-lg border border-amber-200/70">
                  <div className="flex justify-between text-[11px] text-amber-900 font-medium">
                    <span>Compressing {folderFileCount} files preserving folder structure...</span>
                    <span className="font-mono font-bold">{zippingProgress}%</span>
                  </div>
                  <div className="w-full bg-amber-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-amber-600 h-1.5 rounded-full transition-all duration-150"
                      style={{ width: `${zippingProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {isUploadingZip && (
                <div className="space-y-1.5 bg-blue-50/60 p-3 rounded-lg border border-blue-200/70">
                  <div className="flex justify-between text-[11px] text-blue-900 font-medium">
                    <span>Uploading ZIP archive to private storage...</span>
                    <span className="font-mono font-bold">{zipProgress}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full transition-all duration-150"
                      style={{ width: `${zipProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Hidden ZIP File Input */}
              <input
                ref={zipInputRef}
                type="file"
                accept=".zip"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleZipFileUpload(file, false);
                }}
                className="hidden"
              />

              {/* Hidden Folder Input */}
              <input
                ref={folderInputRef}
                type="file"
                multiple
                {...({ webkitdirectory: "", directory: "" } as any)}
                onChange={handleFolderUpload}
                className="hidden"
              />

              {zipStoragePath ? (
                /* Confirmed Stored Package Card */
                <div className="bg-white border border-amber-300 rounded-xl p-4 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0">
                      {isPackagedFromFolder ? (
                        <FolderArchive className="w-5 h-5 text-amber-600" />
                      ) : (
                        "ZIP"
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-zinc-900 truncate">{zipFileName}</p>
                        {isPackagedFromFolder && (
                          <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded font-semibold shrink-0">
                            Folder Packaged ({folderFileCount} files)
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500">
                        {formatBytes(zipFileSize)} · Stored securely in <span className="font-mono text-amber-700">stl-files-private</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (isPackagedFromFolder) {
                          folderInputRef.current?.click();
                        } else {
                          zipInputRef.current?.click();
                        }
                      }}
                      disabled={isUploadingZip || isZippingFolder}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Replace</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setZipStoragePath("");
                        setZipFileName("");
                        setZipFileSize(0);
                        setIsPackagedFromFolder(false);
                        setFolderFileCount(0);
                      }}
                      disabled={isUploadingZip || isZippingFolder}
                      className="p-1.5 text-zinc-400 hover:text-red-600 rounded-md transition-colors"
                      title="Remove archive"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : packageMode === "folder" ? (
                /* Option B: Folder Selection Drop / Click Area */
                <div
                  onClick={() => folderInputRef.current?.click()}
                  className="border-2 border-dashed border-zinc-300 hover:border-blue-500 hover:bg-blue-50/30 rounded-xl p-6 text-center cursor-pointer transition-all group"
                >
                  <FolderUp className="w-8 h-8 text-zinc-400 group-hover:text-blue-600 mx-auto mb-2 transition-colors" />
                  <p className="text-xs font-bold text-zinc-800">
                    Click to select an entire Folder from your computer
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-1 max-w-md mx-auto">
                    Selects all files and nested subfolders, preserving folder structure and auto-packaging into a verified .ZIP archive before upload (up to 250MB).
                  </p>
                </div>
              ) : (
                /* Option A: ZIP Archive Drop / Click Area */
                <div
                  onClick={() => zipInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleZipFileUpload(file, false);
                  }}
                  className="border-2 border-dashed border-zinc-300 hover:border-amber-500 hover:bg-amber-50/30 rounded-xl p-6 text-center cursor-pointer transition-all group"
                >
                  <FileArchive className="w-8 h-8 text-zinc-400 group-hover:text-amber-600 mx-auto mb-2 transition-colors" />
                  <p className="text-xs font-bold text-zinc-800">
                    Click to select .ZIP archive from your computer (or drag & drop)
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Accepts genuine .ZIP packages containing model files, variations, or guides up to 250MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Action Bar */}
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
              disabled={isPublishDisabled}
              className="w-full text-sm font-bold shadow-md bg-zinc-950 text-white hover:bg-zinc-800 active:bg-zinc-900 transition-all py-3.5 h-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? "Publishing Product to The Print Factory..."
                : isZippingFolder
                ? `Packaging Folder to ZIP (${zippingProgress}%)...`
                : isUploadingImage
                ? `Uploading Preview Image (${imageProgress}%)...`
                : isUploadingStl
                ? `Uploading STL Model (${stlProgress}%)...`
                : isUploadingZip
                ? `Uploading Package to Storage (${zipProgress}%)...`
                : isPublishDisabled
                ? !imageUrl.trim()
                  ? "Upload Preview Image to Publish"
                  : "Upload STL Model or Package Archive to Publish"
                : "Publish Product to Marketplace"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
