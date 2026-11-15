import React from "react";
import Link from "next/link";
import { Download, ShieldCheck, Clock } from "lucide-react";

export default function DigitalDeliveryPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div>
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          Fulfillment Terms
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-zinc-950 tracking-tight font-display mt-1">
          Digital Product Delivery Policy
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Last Updated: November 2026
        </p>
      </div>

      <div className="prose prose-zinc prose-sm max-w-none text-zinc-600 leading-relaxed space-y-6">
        <p>
          STLForge strictly provides digital goods. No physical items, filament spools, or 3D printers will be mailed or physically shipped to your postal address.
        </p>

        <h2 className="text-lg font-bold text-zinc-950">1. Instant Automated Delivery</h2>
        <p>
          Upon successful payment clearance through our authorized Razorpay gateway (including UPI dynamic QR or international card payments), our backend automated delivery system immediately unlocks your digital files. You will be redirected to the confirmed Order Success page with immediate download buttons.
        </p>

        <h2 className="text-lg font-bold text-zinc-950">2. Email Delivery Notification</h2>
        <p>
          A confirmation email containing your order reference and permanent download access link is automatically dispatched via our transactional email service to the email address provided during checkout or registration.
        </p>

        <h2 className="text-lg font-bold text-zinc-950">3. Permanent Account Access</h2>
        <p>
          Purchased digital assets are securely tied to your registered customer account. You may log in to STLForge at any time, navigate to <strong>My Downloads</strong>, and retrieve your files using fresh, time-limited cryptographic signed URLs.
        </p>

        <h2 className="text-lg font-bold text-zinc-950">4. Delivery Troubleshooting</h2>
        <p>
          If your bank account was debited but your download has not unlocked within 10 minutes due to intermittent gateway delays, please email our support team at <a href="mailto:support@stlforge.com" className="font-semibold text-zinc-900 underline">support@stlforge.com</a> with your Razorpay transaction ID for instant manual clearance.
        </p>
      </div>
    </div>
  );
}

