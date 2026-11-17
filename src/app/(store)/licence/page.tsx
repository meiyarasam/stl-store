import React from "react";
import Link from "next/link";
import { ShieldAlert, Check, X } from "lucide-react";

export default function LicencePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div>
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          Legal Agreement
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-zinc-950 tracking-tight font-display mt-1">
          The Print Factory Digital STL Licence Agreement
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Last Updated: November 2026 • Governing Terms for Digital 3D Assets
        </p>
      </div>

      <div className="prose prose-zinc prose-sm max-w-none text-zinc-600 leading-relaxed space-y-6">
        <p>
          By purchasing, downloading, or accessing digital 3D model files (including but not limited to .STL, .OBJ, .3MF, and compressed .ZIP archives) from The Print Factory, you agree to be bound by the terms of this Digital STL Licence Agreement.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 not-prose">
          <div className="p-5 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-3">
            <h3 className="font-bold text-emerald-900 text-sm flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-700" /> Permitted Uses
            </h3>
            <ul className="text-xs text-emerald-800 space-y-2">
              <li>• Printing physical copies for your personal, private, and non-commercial enjoyment.</li>
              <li>• Scaling, modifying, slicing, and painting prints for personal use.</li>
              <li>• Sharing photographs or videos of your physically finished and painted prints with credit to The Print Factory.</li>
              <li>• Storing backup copies for your personal use.</li>
            </ul>
          </div>

          <div className="p-5 bg-red-50/60 border border-red-200 rounded-xl space-y-3">
            <h3 className="font-bold text-red-900 text-sm flex items-center gap-2">
              <X className="w-4 h-4 text-red-700" /> Prohibited Actions
            </h3>
            <ul className="text-xs text-red-800 space-y-2">
              <li>• Re-uploading, sharing, sublicensing, or distributing the digital STL/ZIP files.</li>
              <li>• Selling or commercializing physical 3D prints without explicit merchant agreement.</li>
              <li>• Creating physical molds or mass casting replicas for commercial resale.</li>
              <li>• Uploading files to public repositories or shared torrent networks.</li>
            </ul>
          </div>
        </div>

        <h2 className="text-lg font-bold text-zinc-950 pt-4">Commercial Inquiries</h2>
        <p>
          If you run an Etsy shop, Kickstarter campaign, or print farm and wish to sell physical 3D prints produced from our designs, please reach out to <a href="mailto:theprintfactory2026@gmail.com" className="font-semibold text-zinc-900 underline font-mono">theprintfactory2026@gmail.com</a> to obtain an official Commercial Merchant Licence.
        </p>
      </div>
    </div>
  );
}

