import React from "react";
import Link from "next/link";
import { Layers, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="space-y-3">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
          About The Print Factory
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-zinc-950 tracking-tight font-display">
          Crafting Precision 3D Digital Assets for Global Makers.
        </h1>
        <p className="text-base text-zinc-600 leading-relaxed">
          The Print Factory was created to bridge high-end parametric industrial design and precision digital manufacturing.
        </p>
      </div>

      <div className="prose prose-zinc prose-sm max-w-none space-y-6 text-zinc-600 leading-relaxed">
        <p>
          Founded with a relentless commitment to print quality, The Print Factory provides a curated, international marketplace for creators, hobbyists, engineers, and miniature artists. Unlike generic open repositories where corrupted polygons and fragile geometry lead to failed 15-hour prints, every design hosted on The Print Factory is validated through slicing tests and physical print verification.
        </p>

        <h2 className="text-xl font-bold text-zinc-950 pt-4">Our Guiding Philosophy</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 not-prose">
          <div className="p-5 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <h3 className="font-bold text-zinc-900 text-sm">Watertight Quality Control</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Every mesh is inspected for non-manifold edges, flipped normals, and geometric integrity before being approved for sale.
            </p>
          </div>

          <div className="p-5 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
            <Layers className="w-6 h-6 text-zinc-800" />
            <h3 className="font-bold text-zinc-900 text-sm">Tested Slicer Profiles</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              We test files on standard 0.4mm brass nozzles, hardened steel nozzles, and 8K SLA resin printers, including recommended infill and tree support recommendations.
            </p>
          </div>
        </div>

        <h2 className="text-xl font-bold text-zinc-950 pt-4">International Commerce Standards</h2>
        <p>
          We support makers worldwide by offering native localized pricing in Indian Rupees (INR), US Dollars (USD), Euros (EUR), British Pounds (GBP), Canadian Dollars (CAD), Australian Dollars (AUD), and Japanese Yen (JPY) via Razorpay Standard Checkout and dynamic UPI QR payments.
        </p>
      </div>

      <div className="pt-8 border-t border-zinc-200 flex items-center justify-between">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-950 text-white rounded-lg text-xs font-bold hover:bg-zinc-800 transition-colors shadow-sm"
        >
          Explore the Catalog <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/contact"
          className="text-xs font-semibold text-zinc-600 hover:text-zinc-950"
        >
          Get in Touch With Our Team →
        </Link>
      </div>
    </div>
  );
}

