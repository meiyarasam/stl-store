import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { redirect } from "next/navigation";
import { getUserDownloads } from "@/lib/database/downloads";
import { Download, Box, ArrowLeft, ShieldCheck, AlertCircle } from "lucide-react";

export default async function AccountDownloadsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/account/downloads");
  }

  const userId = (session.user as any).id || "admin_super_user";
  const downloads = await getUserDownloads(userId);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/account"
            className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight font-display">
            My Downloads ({downloads.length})
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Access and download your verified STL files and complete ZIP archives.
          </p>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
        {downloads.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Download className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-zinc-900">No Downloads Available</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
              Any 3D files you purchase will automatically appear here with signed instant download links.
            </p>
            <div className="mt-6">
              <Link
                href="/products"
                className="px-4 py-2 bg-zinc-950 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800"
              >
                Browse 3D Models
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-zinc-200">
            {downloads.map((dl) => (
              <div
                key={dl.id}
                className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700 flex-shrink-0 mt-0.5">
                    <Box className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                      {dl.productTitle}
                    </span>
                    <h3 className="text-sm font-bold text-zinc-950 font-mono">
                      {dl.fileName}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                      <span>Order #{dl.orderNumber}</span>
                      <span>•</span>
                      <span>{(dl.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB</span>
                      <span>•</span>
                      <span>
                        Downloaded: {dl.downloadCount} / {dl.maxDownloads}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between gap-2 pt-3 sm:pt-0 border-t sm:border-0 border-zinc-100">
                  {dl.isExpired ? (
                    <span className="px-3 py-1.5 bg-zinc-100 text-zinc-400 rounded text-xs font-medium flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Expired
                    </span>
                  ) : (
                    <a
                      href={`/api/downloads/${dl.downloadToken}`}
                      className="w-full sm:w-auto px-4 py-2 bg-zinc-950 text-white rounded-lg text-xs font-bold hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download File
                    </a>
                  )}
                  <span className="text-[11px] text-zinc-400">
                    Signed link valid 1 year
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
