import React from "react";
import Link from "next/link";
import { ShieldCheck, HelpCircle } from "lucide-react";

export default function RefundPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div>
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          Cancellation & Refunds
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-zinc-950 tracking-tight font-display mt-1">
          Refund and Cancellation Policy
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Last Updated: November 2026 • Digital Goods Policy
        </p>
      </div>

      <div className="prose prose-zinc prose-sm max-w-none text-zinc-600 leading-relaxed space-y-6">
        <p>
          At STLForge, we take immense pride in the geometric precision and slicing fidelity of our 3D models. Because digital files (.STL, .ZIP, .3MF) cannot be physically returned once delivered or downloaded, all purchases are generally final.
        </p>

        <h2 className="text-lg font-bold text-zinc-950">1. Eligible Circumstances for Refunds</h2>
        <p>
          We will happily issue a full refund or provide replacement digital assets under the following verified conditions:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Corrupted or Unrepairable 3D Geometry:</strong> If a file possesses verified non-manifold geometry, inverted normals, or structural errors that cause consistent slicer failure, and our design team cannot supply a corrected revision within 48 hours.</li>
          <li><strong>Accidental Duplicate Charges:</strong> If you accidentally placed two identical orders for the same file within a 24-hour window, the duplicate transaction will be refunded in full.</li>
          <li><strong>Undelivered Digital Files:</strong> If a technical error prevented you from receiving the download links and our support team could not resolve access within 3 business days.</li>
        </ul>

        <h2 className="text-lg font-bold text-zinc-950">2. Ineligible Circumstances</h2>
        <p>
          Refunds will not be granted for:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>User hardware limitations (e.g. your physical 3D printer bed is smaller than the model dimensions, which are clearly specified on the product page).</li>
          <li>Buyer&apos;s remorse or accidental purchase after files have already been downloaded.</li>
          <li>Inability to operate third-party slicing software.</li>
        </ul>

        <h2 className="text-lg font-bold text-zinc-950">3. How to Request a Refund</h2>
        <p>
          To initiate a refund request, please email <a href="mailto:support@stlforge.com" className="font-semibold text-zinc-900 underline">support@stlforge.com</a> within 7 days of purchase. Include your Order Number (e.g., #STL-XXXXXX), your Razorpay payment transaction reference, and screenshots of any slicing errors encountered. Approved refunds are credited back to your original payment method (bank account, card, or UPI) within 5–7 business days.
        </p>
      </div>
    </div>
  );
}
