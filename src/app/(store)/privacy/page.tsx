import React from "react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div>
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          Privacy Policy
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-zinc-950 tracking-tight font-display mt-1">
          Privacy & Data Protection Policy
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Last Updated: November 2026
        </p>
      </div>

      <div className="prose prose-zinc prose-sm max-w-none text-zinc-600 leading-relaxed space-y-6">
        <p>
          At The Print Factory, we respect your personal data and privacy. This Privacy Policy details the types of information we collect and how we utilize and safeguard your information.
        </p>

        <h2 className="text-lg font-bold text-zinc-950">1. Information We Collect</h2>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Account Data:</strong> Name, email address, password hash, country, and phone number.</li>
          <li><strong>Transaction Data:</strong> Order reference, purchased items, currency, transaction ID, and timestamp. We do NOT store your credit card numbers, CVVs, or bank PINs on our servers. All sensitive financial data is handled directly by Razorpay through PCI-DSS Level 1 compliant infrastructure.</li>
          <li><strong>Download Logs:</strong> IP address, browser user-agent, and download timestamp for security and fraud prevention.</li>
        </ul>

        <h2 className="text-lg font-bold text-zinc-950">2. How We Use Your Information</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>To generate secure, signed download links for your purchased 3D models.</li>
          <li>To email transactional order confirmations, invoices, and password reset instructions.</li>
          <li>To prevent fraudulent payments, chargebacks, and digital piracy.</li>
        </ul>

        <h2 className="text-lg font-bold text-zinc-950">3. Data Sharing</h2>
        <p>
          We do not sell, rent, or trade your personal information to third-party data brokers. We share data only with necessary service providers: Razorpay (for payment processing), Supabase (for secure cloud storage), and Resend (for transactional emails).
        </p>

        <h2 className="text-lg font-bold text-zinc-950">4. Contact Information</h2>
        <p>
          If you have questions regarding your data or wish to request data deletion under applicable privacy laws, please contact <a href="mailto:theprintfactory2026@gmail.com" className="font-semibold text-zinc-900 underline font-mono">theprintfactory2026@gmail.com</a>.
        </p>
      </div>
    </div>
  );
}

