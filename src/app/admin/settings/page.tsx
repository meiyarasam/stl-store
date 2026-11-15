import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import {
  CreditCard,
  HardDrive,
  Mail,
  Coins,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { isRazorpayConfigured, MERCHANT_PROFILE_URL } from "@/lib/razorpay/client";
import { isResendConfigured } from "@/lib/email/resend";
import { PRIVATE_BUCKET, PUBLIC_BUCKET } from "@/lib/storage/supabase";

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions);

  if ((session?.user as any)?.role !== "ADMIN" && process.env.NODE_ENV === "production") {
    redirect("/login?callbackUrl=/admin/settings");
  }

  const isSupabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")
  );

  return (
    <div className="min-h-screen bg-zinc-50/50">
      <AdminNav />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight font-display">
            System & Infrastructure Settings
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Audit payment processors, private storage buckets, email dispatch, and security rules.
          </p>
        </div>

        <div className="space-y-6">
          {/* Payment Gateway Settings */}
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-100">
              <CreditCard className="w-5 h-5 text-zinc-800" />
              <div>
                <h2 className="text-base font-bold text-zinc-950">
                  Razorpay Payment Integration
                </h2>
                <p className="text-xs text-zinc-500">
                  Standard checkout, Orders API, and Webhooks
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 space-y-1">
                <span className="text-zinc-500 font-medium block">Razorpay Orders Status</span>
                <div className="flex items-center gap-1.5 font-bold text-zinc-900">
                  {isRazorpayConfigured ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Production Live Keys Connected</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Test Sandbox / Dev Mode Active</span>
                    </>
                  )}
                </div>
              </div>

              <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 space-y-1">
                <span className="text-zinc-500 font-medium block">Merchant Payment Profile</span>
                <a
                  href={MERCHANT_PROFILE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-zinc-900 hover:underline flex items-center gap-1"
                >
                  {MERCHANT_PROFILE_URL}
                </a>
              </div>
            </div>
          </div>

          {/* Supabase Storage Settings */}
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-100">
              <HardDrive className="w-5 h-5 text-zinc-800" />
              <div>
                <h2 className="text-base font-bold text-zinc-950">
                  Private Digital Storage
                </h2>
                <p className="text-xs text-zinc-500">
                  Supabase private buckets for original STL & ZIP archives
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 space-y-1">
                <span className="text-zinc-500 font-medium block">Private Bucket (STL & ZIP)</span>
                <span className="font-mono font-bold text-zinc-900 block">
                  {PRIVATE_BUCKET}
                </span>
                <span className="text-[11px] text-zinc-400">
                  Permanent public access blocked; signed URLs with 300s expiry
                </span>
              </div>

              <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 space-y-1">
                <span className="text-zinc-500 font-medium block">Public Previews Bucket</span>
                <span className="font-mono font-bold text-zinc-900 block">
                  {PUBLIC_BUCKET}
                </span>
                <span className="text-[11px] text-zinc-400">
                  Renders product card images and gallery previews
                </span>
              </div>
            </div>
          </div>

          {/* Resend Email Notifications */}
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-100">
              <Mail className="w-5 h-5 text-zinc-800" />
              <div>
                <h2 className="text-base font-bold text-zinc-950">
                  Resend Transactional Email
                </h2>
                <p className="text-xs text-zinc-500">
                  Order confirmations and secure download access notifications
                </p>
              </div>
            </div>

            <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 text-xs space-y-1">
              <span className="text-zinc-500 font-medium block">Email Dispatcher</span>
              <div className="flex items-center gap-1.5 font-bold text-zinc-900">
                {isResendConfigured ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Resend Production Delivery Active</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Console Email Dispatch Logger Active (Local Dev)</span>
                  </>
                )}
              </div>
              <span className="text-[11px] text-zinc-400 block pt-1">
                Sender: orders@stlforge.com
              </span>
            </div>
          </div>

          {/* Currencies & Pricing Standards */}
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-100">
              <Coins className="w-5 h-5 text-zinc-800" />
              <div>
                <h2 className="text-base font-bold text-zinc-950">
                  Supported Currencies
                </h2>
                <p className="text-xs text-zinc-500">
                  INR, USD, EUR, GBP, CAD, AUD, JPY independent pricing architecture
                </p>
              </div>
            </div>

            <div className="text-xs text-zinc-600 space-y-2">
              <p>
                Each product is configured with independent amounts for each currency.
                If an administrator leaves a regional price empty, the system authoritatively
                computes a clean rounded estimate based on the reference standard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
