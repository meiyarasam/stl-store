import React from "react";
import Link from "next/link";
import { Download, ArrowRight, Box } from "lucide-react";

interface DownloadItemSummary {
  id: string;
  fileName: string;
  productTitle: string;
  downloadToken: string;
}

interface RecentDownloadsListProps {
  downloads: DownloadItemSummary[];
}

export function RecentDownloadsList({ downloads }: RecentDownloadsListProps) {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-zinc-950 font-display">
          Ready to Download
        </h2>
        <Link
          href="/account/downloads"
          className="text-xs font-semibold text-zinc-600 hover:text-zinc-950 flex items-center gap-1"
        >
          All Files <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-zinc-100">
        {downloads.length > 0 ? (
          downloads.map((dl) => (
            <div
              key={dl.id}
              className="py-3 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2.5">
                <Box className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-zinc-900 block font-mono">
                    {dl.fileName}
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    {dl.productTitle}
                  </span>
                </div>
              </div>
              <a
                href={`/api/downloads/${dl.downloadToken}`}
                className="px-3 py-1 bg-zinc-950 hover:bg-zinc-800 text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors shadow-sm"
              >
                <Download className="w-3 h-3" /> Download
              </a>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-xs text-zinc-500">
            No active downloads. Browse our collection to download your first 3D design!
          </div>
        )}
      </div>
    </div>
  );
}
