import React from "react";
import Link from "next/link";
import { Layers, ShieldCheck, Download, Sparkles, Mail, Lock } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-charcoal-950 text-zinc-300 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-white text-zinc-950 flex items-center justify-center font-bold">
                <Layers className="w-5 h-5 text-zinc-950" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-display">
                STL<span className="text-zinc-400">FORGE</span>
              </span>
            </Link>
            <p className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">
              Design. Download. Create.
            </p>
            <p className="text-sm text-zinc-400 max-w-sm leading-relaxed">
              STLForge is a premier international digital marketplace for precision 3D-printable models, print-in-place mechanisms, collectible busts, and functional designs.
            </p>

            <div className="pt-2 flex items-center gap-4 text-xs text-zinc-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified Manifold STLs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Download className="w-4 h-4 text-zinc-300" />
                <span>Instant Digital Delivery</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold tracking-wider text-white uppercase">
              Explore Catalog
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  All 3D Models
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-white transition-colors">
                  Browse Categories
                </Link>
              </li>
              <li>
                <Link href="/products?featured=true" className="hover:text-white transition-colors">
                  Featured Designs
                </Link>
              </li>
              <li>
                <Link href="/categories/functional-mechanical" className="hover:text-white transition-colors">
                  Print-in-Place Mechanisms
                </Link>
              </li>
              <li>
                <Link href="/categories/miniatures-figures" className="hover:text-white transition-colors">
                  Collectible Miniatures
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer & Account */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold tracking-wider text-white uppercase">
              Account & Help
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/account" className="hover:text-white transition-colors">
                  Customer Dashboard
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="hover:text-white transition-colors">
                  My Orders
                </Link>
              </li>
              <li>
                <Link href="/account/downloads" className="hover:text-white transition-colors">
                  My Downloads
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About STLForge
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li className="pt-1">
                <Link
                  href="/admin/login"
                  className="hover:text-white transition-colors inline-flex items-center gap-1.5 text-amber-400 font-semibold"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Admin Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold tracking-wider text-white uppercase">
              Legal & Licencing
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/licence" className="hover:text-white transition-colors">
                  STL Licence Agreement
                </Link>
              </li>
              <li>
                <Link href="/delivery-policy" className="hover:text-white transition-colors">
                  Digital Delivery Policy
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-white transition-colors">
                  Refund & Cancellation Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment & Verification Banner */}
        <div className="mt-12 pt-8 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex flex-wrap items-center gap-4">
            <p>© {new Date().getFullYear()} STLForge. All rights reserved. Precision 3D Digital Assets.</p>
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors font-semibold text-[11px]"
            >
              <Lock className="w-3 h-3 text-amber-400" />
              Admin Portal
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-medium text-zinc-400">Payment Gateway:</span>
            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono">
              Razorpay Standard
            </span>
            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono">
              UPI Dynamic QR
            </span>
            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono">
              International Cards
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
