import React from "react";
import Link from "next/link";
import { AlertOctagon, ArrowRight, RefreshCw, HelpCircle } from "lucide-react";

export default function PaymentFailedPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-sm">
        <AlertOctagon className="w-9 h-9" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-zinc-950">Payment Unsuccessful</h1>
        <p className="text-xs text-zinc-500 leading-relaxed">
          The transaction could not be completed by your banking institution or payment gateway. No funds were captured for this order.
        </p>
      </div>

      <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-xs text-zinc-600 space-y-2 text-left">
        <span className="font-semibold text-zinc-900 block">Recommended Steps:</span>
        <ul className="list-disc list-inside space-y-1 text-zinc-500">
          <li>Check that international card payments are enabled if purchasing in foreign currency.</li>
          <li>For Indian customers, ensure UPI PIN was entered correctly within the banking timeout.</li>
          <li>Verify your card balance and 3D-Secure SMS authentication.</li>
        </ul>
      </div>

      <div className="space-y-3">
        <Link
          href="/checkout"
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-zinc-950 text-white rounded-lg text-xs font-bold hover:bg-zinc-800 transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" /> Try Checkout Again
        </Link>
        <Link
          href="/contact"
          className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 bg-zinc-100 text-zinc-700 rounded-lg text-xs font-medium hover:bg-zinc-200 transition-colors"
        >
          <HelpCircle className="w-4 h-4" /> Contact Support Team
        </Link>
      </div>
    </div>
  );
}

