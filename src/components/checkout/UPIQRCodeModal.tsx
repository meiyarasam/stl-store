"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { QrCode, X, CheckCircle, ExternalLink, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UPIQRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  upiIntentUrl: string;
  orderNumber: string;
  amount: number;
  currency: string;
  onSimulateVerified?: () => void;
}

export function UPIQRCodeModal({
  isOpen,
  onClose,
  upiIntentUrl,
  orderNumber,
  amount,
  currency,
  onSimulateVerified,
}: UPIQRCodeModalProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  useEffect(() => {
    if (upiIntentUrl && isOpen) {
      QRCode.toDataURL(upiIntentUrl, {
        width: 260,
        margin: 2,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error("Error generating QR code:", err));
    }
  }, [upiIntentUrl, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-xl max-w-xs sm:max-w-sm w-full p-4 sm:p-6 text-center shadow-2xl border border-zinc-200 relative my-auto">
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 text-zinc-400 hover:text-zinc-600 transition-colors touch-manipulation"
          aria-label="Close UPI modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2.5 sm:mb-3">
          <QrCode className="w-5 h-5" />
        </div>

        <h3 className="text-base sm:text-lg font-bold text-zinc-900">Scan to Pay via UPI</h3>
        <p className="text-xs text-zinc-500 mt-1">
          Scan with Google Pay, PhonePe, Paytm, BHIM, or any banking UPI app.
        </p>

        {/* Amount */}
        <div className="my-3 sm:my-4 py-2 bg-zinc-50 rounded-lg border border-zinc-200 font-mono">
          <div className="text-[11px] sm:text-xs text-zinc-500">Order #{orderNumber}</div>
          <div className="text-lg sm:text-xl font-black text-zinc-900">
            ₹{amount.toFixed(2)} {currency}
          </div>
        </div>

        {/* QR Code Canvas/Image */}
        <div className="flex justify-center my-3 sm:my-4">
          {qrCodeDataUrl ? (
            <div className="p-2 sm:p-3 bg-white border-2 border-zinc-900 rounded-xl shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrCodeDataUrl}
                alt="Dynamic UPI QR Code"
                className="w-44 h-44 sm:w-52 sm:h-52 object-contain"
              />
            </div>
          ) : (
            <div className="w-44 h-44 sm:w-52 sm:h-52 bg-zinc-100 flex items-center justify-center rounded-xl animate-pulse text-xs text-zinc-400">
              Generating Dynamic QR...
            </div>
          )}
        </div>

        <div className="text-[11px] text-zinc-500 flex items-center justify-center gap-1.5 mb-4">
          <ShieldAlert className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <span className="leading-tight">Payment automatically matches to your order upon bank clearance</span>
        </div>

        {/* Direct UPI Intent Link for mobile browsers */}
        <div className="space-y-2">
          <a
            href={upiIntentUrl}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold transition-colors"
          >
            Open in UPI App <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* Fallback button to simulate or complete verification */}
          {onSimulateVerified && (
            <Button
              onClick={onSimulateVerified}
              variant="primary"
              size="sm"
              className="w-full text-xs"
            >
              <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
              I Have Completed Payment
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

