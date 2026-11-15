import React from "react";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div>
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          Terms of Service
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-zinc-950 tracking-tight font-display mt-1">
          Terms and Conditions
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Last Updated: November 2026
        </p>
      </div>

      <div className="prose prose-zinc prose-sm max-w-none text-zinc-600 leading-relaxed space-y-6">
        <p>
          Welcome to STLForge. By accessing our platform, registering an account, or purchasing digital 3D models, you agree to comply with and be bound by the following terms and conditions.
        </p>

        <h2 className="text-lg font-bold text-zinc-950">1. Account Registration and Security</h2>
        <p>
          To purchase and download files, you must create a verified customer account. You are responsible for safeguarding your login credentials. You agree to notify us immediately of any unauthorized use of your account.
        </p>

        <h2 className="text-lg font-bold text-zinc-950">2. Intellectual Property Rights</h2>
        <p>
          All 3D digital designs, render previews, typography, and website assets are protected by copyright and intellectual property laws. Purchasing a product grants a non-exclusive license under our STL Licence Agreement. Ownership of all intellectual property remains strictly with the original creators and STLForge.
        </p>

        <h2 className="text-lg font-bold text-zinc-950">3. Pricing and Payments</h2>
        <p>
          All prices are quoted in your selected currency (INR, USD, EUR, GBP, CAD, AUD, JPY). Razorpay Standard Checkout processes all financial transactions. We reserve the right to correct pricing errors or update product prices at any time prior to checkout confirmation.
        </p>

        <h2 className="text-lg font-bold text-zinc-950">4. Limitation of Liability</h2>
        <p>
          STLForge will not be liable for any physical damage to your 3D printer, print bed, nozzle, or wasted filament resulting from slicing errors or printer hardware malfunctions. Users are responsible for inspecting sliced toolpaths before starting long prints.
        </p>
      </div>
    </div>
  );
}
