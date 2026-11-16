import React from "react";
import Link from "next/link";
import { HelpCircle } from "lucide-react";

export default function FAQPage() {
  const faqs = [
    {
      q: "What file formats will I receive upon purchase?",
      a: "All models are supplied as high-resolution manifold .STL files, and where applicable, complete zipped archive packages (.ZIP) containing modular assembly parts, pre-supported resin files, and slicer documentation.",
    },
    {
      q: "How do I download my purchased files?",
      a: "Immediately following verified payment clearance via Razorpay, you will be redirected to the Order Success page with instant download links. In addition, all your purchased 3D models remain permanently accessible in your The Print Factory Customer Dashboard under 'My Downloads'.",
    },
    {
      q: "What slicers are these models compatible with?",
      a: "Our STLs are standard watertight 3D geometries compatible with all modern slicing software, including Bambu Studio, PrusaSlicer, OrcaSlicer, Ultimaker Cura, Lychee Slicer, and Chitubox.",
    },
    {
      q: "Can I sell physical 3D prints of these designs?",
      a: "Standard purchases come with our Standard Personal Use Licence (non-commercial, physical or digital resale prohibited). If you are interested in commercial mass-production or selling printed versions, please contact our licensing team at licensing@theprintfactory.com.",
    },
    {
      q: "What payment methods are supported?",
      a: "Through our authorized Razorpay integration, we accept international credit and debit cards (Visa, MasterCard, American Express), Indian UPI apps (Google Pay, PhonePe, Paytm), and dynamic UPI QR code scanning for eligible payments.",
    },
    {
      q: "What is your refund policy for digital downloads?",
      a: "Because digital STL and ZIP files are irrevocable once downloaded, sales are generally non-refundable. However, if a model has a verified, unfixable geometric defect or you made an accidental duplicate purchase, our support team will promptly review your request within 7 days of purchase.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      <div>
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          Frequently Asked Questions
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-zinc-950 tracking-tight font-display mt-1">
          Everything You Need to Know
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Got questions about our digital STL files, printing specifications, or payments? Find quick answers below.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="p-6 bg-white border border-zinc-200 rounded-xl shadow-sm space-y-2"
          >
            <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-zinc-100 text-zinc-700 flex items-center justify-center text-xs font-mono">
                {idx + 1}
              </span>
              {faq.q}
            </h3>
            <p className="text-xs text-zinc-600 pl-7 leading-relaxed">
              {faq.a}
            </p>
          </div>
        ))}
      </div>

      <div className="p-6 bg-zinc-50 border border-zinc-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-zinc-900">Still have questions?</h4>
          <p className="text-xs text-zinc-500">
            Our support engineers are ready to assist with slicer parameters or order questions.
          </p>
        </div>
        <Link
          href="/contact"
          className="px-4 py-2 bg-zinc-950 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800 transition-colors shadow-sm"
        >
          Contact Support
        </Link>
      </div>
    </div>
  );
}

