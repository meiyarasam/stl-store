"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Clock, ShieldCheck, Check, Copy, ArrowRight, HelpCircle } from "lucide-react";

export default function ContactPage() {
  const [copied, setCopied] = useState(false);
  const supportEmail = "theprintfactory2026@gmail.com";

  const handleCopy = () => {
    navigator.clipboard.writeText(supportEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-10">
      {/* Page Header */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          Direct Support & Inquiries
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-zinc-950 tracking-tight font-display">
          Contact Our Team
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
          Have questions about slicing parameters, download access, or commercial licensing? Reach out to our dedicated support team directly via email.
        </p>
      </div>

      {/* Main Support Card */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-10 shadow-sm space-y-8">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-100 border border-zinc-200 text-zinc-900 flex items-center justify-center mx-auto shadow-sm">
            <Mail className="w-7 h-7 text-zinc-950" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-950">Official Email Support</h2>
            <p className="text-xs text-zinc-500 mt-1">
              Click below to write to us or copy the address to your clipboard.
            </p>
          </div>

          <div className="inline-flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href={`mailto:${supportEmail}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-950 text-white font-mono text-sm font-semibold hover:bg-zinc-800 transition-colors shadow-sm"
            >
              <Mail className="w-4 h-4" />
              {supportEmail}
            </a>

            <button
              onClick={handleCopy}
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-zinc-500" />
                  <span>Copy Address</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Support Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-100">
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1.5">
            <div className="flex items-center gap-2 text-zinc-900 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Customer & Order Support</span>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Assistance with digital download access, order confirmation, and payment receipts.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1.5">
            <div className="flex items-center gap-2 text-zinc-900 font-bold text-xs">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Response Window</span>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed">
              We usually respond within 24 business hours. Please include your Order ID if applicable.
            </p>
          </div>
        </div>
      </div>

      {/* Helpful Quick Links */}
      <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 text-zinc-700">
          <HelpCircle className="w-4 h-4 text-zinc-500 shrink-0" />
          <span>Looking for immediate answers regarding printing, slicing, or file formats?</span>
        </div>
        <Link
          href="/faq"
          className="font-semibold text-zinc-950 hover:underline flex items-center gap-1 shrink-0"
        >
          Browse FAQ <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
