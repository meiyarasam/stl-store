import React from "react";
import { ProductDTO } from "@/types";
import { Printer, Settings, FileArchive, ShieldAlert, CheckCircle2, Box } from "lucide-react";

interface PrintSpecsTableProps {
  product: ProductDTO;
}

export function PrintSpecsTable({ product }: PrintSpecsTableProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Supported Printers */}
        <div className="p-4 rounded-lg border border-zinc-200 bg-zinc-50/50">
          <div className="flex items-center gap-2 text-zinc-900 font-semibold text-sm mb-1.5">
            <Printer className="w-4 h-4 text-zinc-700" />
            <span>Supported Printers</span>
          </div>
          <p className="text-xs text-zinc-600 font-medium">
            {product.supportedPrinters || "FDM, SLA Resin, DLP, MSLA"}
          </p>
        </div>

        {/* Licence Details */}
        <div className="p-4 rounded-lg border border-zinc-200 bg-zinc-50/50">
          <div className="flex items-center gap-2 text-zinc-900 font-semibold text-sm mb-1.5">
            <ShieldAlert className="w-4 h-4 text-zinc-700" />
            <span>Licence Type</span>
          </div>
          <p className="text-xs text-zinc-600 font-medium">
            {product.licenceType || "Standard Personal Use Licence (Non-Commercial)"}
          </p>
        </div>
      </div>

      {/* Recommended Slicer Settings */}
      {product.printingSettings && (
        <div className="p-4 rounded-lg border border-zinc-200 bg-white">
          <div className="flex items-center gap-2 text-zinc-900 font-semibold text-sm mb-2">
            <Settings className="w-4 h-4 text-zinc-700" />
            <span>Tested Slicer & Printing Parameters</span>
          </div>
          <div className="bg-zinc-50 p-3 rounded border border-zinc-200 font-mono text-xs text-zinc-700 leading-relaxed whitespace-pre-wrap">
            {product.printingSettings}
          </div>
        </div>
      )}

      {/* Package Contents */}
      <div className="p-4 rounded-lg border border-zinc-200 bg-white">
        <div className="flex items-center gap-2 text-zinc-900 font-semibold text-sm mb-3">
          <FileArchive className="w-4 h-4 text-zinc-700" />
          <span>Included Digital Files</span>
        </div>
        <div className="divide-y divide-zinc-100">
          {product.files && product.files.length > 0 ? (
            product.files.map((file) => (
              <div key={file.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Box className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="font-mono text-zinc-800 font-medium">{file.fileName}</span>
                  <span className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 text-[10px] font-bold">
                    {file.fileType}
                  </span>
                </div>
                <span className="text-zinc-400 font-mono text-[11px]">
                  {file.fileSizeBytes > 0 ? `${(file.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB` : "Ready"}
                </span>
              </div>
            ))
          ) : (
            <div className="py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Box className="w-3.5 h-3.5 text-zinc-400" />
                <span className="font-mono text-zinc-800 font-medium">{product.slug}_complete_pack.zip</span>
                <span className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 text-[10px] font-bold">
                  ZIP / STL
                </span>
              </div>
              <span className="text-zinc-400 font-mono text-[11px]">Direct Download</span>
            </div>
          )}
        </div>
      </div>

      {/* Guarantees */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-600">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>100% Watertight manifold geometry</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Tested on Bambu Studio, Cura & PrusaSlicer</span>
        </div>
      </div>
    </div>
  );
}
