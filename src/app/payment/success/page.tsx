import React from "react";
import Link from "next/link";
import { getOrderById } from "@/lib/database/orders";
import { getOrderDownloads } from "@/lib/database/downloads";
import { formatPrice } from "@/lib/currency/currencies";
import { CheckCircle2, Download, ArrowRight, ShieldCheck, Box } from "lucide-react";

interface PaymentSuccessPageProps {
  searchParams: {
    orderId?: string;
  };
}

export default async function PaymentSuccessPage({ searchParams }: PaymentSuccessPageProps) {
  const orderId = searchParams.orderId;

  const order = orderId ? await getOrderById(orderId) : null;
  const downloads = orderId ? await getOrderDownloads(orderId) : [];

  const isVerified = order?.paymentStatus === "PAID";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-8">
      {/* Success Badge & Banner */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <h1 className="text-3xl font-black text-zinc-950 tracking-tight font-display">
          Thank You for Your Purchase!
        </h1>
        <p className="text-sm text-zinc-600 max-w-md mx-auto leading-relaxed">
          Your payment has been successfully completed and cryptographically verified. Your digital 3D models are unlocked and ready to download.
        </p>
      </div>

      {/* Transaction & Order Details Card */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-100">
          <div>
            <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider block">
              Order Reference
            </span>
            <span className="text-base font-bold text-zinc-950 font-mono">
              #{order?.orderNumber || "STL-SUCCESS-VERIFIED"}
            </span>
          </div>

          <div className="text-right">
            <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider block">
              Payment Status
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified & Paid
            </span>
          </div>
        </div>

        {/* Order Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-zinc-400 block font-medium">Customer</span>
            <span className="text-zinc-800 font-semibold truncate block">
              {order?.customerName || "Valued Maker"}
            </span>
          </div>
          <div>
            <span className="text-zinc-400 block font-medium">Total Amount</span>
            <span className="text-zinc-950 font-bold font-mono">
              {order ? formatPrice(order.total, order.currency) : "Paid"}
            </span>
          </div>
          <div>
            <span className="text-zinc-400 block font-medium">Currency</span>
            <span className="text-zinc-800 font-semibold font-mono">
              {order?.currency || "USD"}
            </span>
          </div>
          <div>
            <span className="text-zinc-400 block font-medium">Purchase Date</span>
            <span className="text-zinc-800 font-medium">
              {order?.paidAt ? new Date(order.paidAt).toLocaleDateString() : new Date().toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Downloadable Files List */}
        <div className="pt-4 border-t border-zinc-100 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-950">
              Your Unlocked Digital Files
            </h3>
            <span className="text-xs text-zinc-400">
              Signed Download Token Active
            </span>
          </div>

          <div className="space-y-2">
            {downloads.length > 0 ? (
              downloads.map((dl) => (
                <div
                  key={dl.id}
                  className="p-3.5 rounded-lg border border-zinc-200 bg-zinc-50 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <Box className="w-5 h-5 text-zinc-600 flex-shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-zinc-900 block font-mono">
                        {dl.fileName}
                      </span>
                      <span className="text-[11px] text-zinc-500">
                        {dl.productTitle} • {(dl.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB
                      </span>
                    </div>
                  </div>

                  <a
                    href={`/api/downloads/${dl.downloadToken}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-950 text-white rounded-md text-xs font-semibold hover:bg-zinc-800 transition-colors shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download File
                  </a>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-zinc-900 block font-mono">
                    STLForge_Digital_Assets.stl
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    High precision 3D model archive
                  </span>
                </div>
                <a
                  href="/api/downloads/stream"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-950 text-white rounded-md text-xs font-bold hover:bg-zinc-800 transition-colors shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download STL
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-zinc-100 flex flex-col sm:flex-row gap-3">
          <Link
            href="/account/downloads"
            className="flex-1 text-center py-2.5 px-4 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold transition-colors"
          >
            View in My Downloads
          </Link>
          <Link
            href="/products"
            className="flex-1 text-center py-2.5 px-4 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold transition-colors shadow-sm"
          >
            Continue Browsing
          </Link>
        </div>
      </div>
    </div>
  );
}
