import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { redirect } from "next/navigation";
import { User, ArrowLeft, Mail, Globe, Phone, ShieldCheck } from "lucide-react";

export default async function AccountProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/account/profile");
  }

  const user = session.user as any;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div>
        <Link
          href="/account"
          className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 flex items-center gap-1 mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight font-display">
          My Profile & Settings
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Manage your personal details and currency preferences.
        </p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-zinc-100">
          <div className="w-14 h-14 rounded-full bg-zinc-950 text-white flex items-center justify-center font-bold text-lg">
            {user.name ? user.name.charAt(0).toUpperCase() : "M"}
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-950">{user.name || "Valued Maker"}</h2>
            <span className="text-xs text-zinc-500 font-mono">{user.email}</span>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Customer Account ({user.role || "CUSTOMER"})</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-200 space-y-1">
            <span className="text-zinc-400 font-medium block">Account Full Name</span>
            <span className="text-sm font-semibold text-zinc-900 block">
              {user.name || "Not specified"}
            </span>
          </div>

          <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-200 space-y-1">
            <span className="text-zinc-400 font-medium block">Email Address</span>
            <span className="text-sm font-semibold text-zinc-900 block font-mono">
              {user.email}
            </span>
          </div>

          <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-200 space-y-1">
            <span className="text-zinc-400 font-medium block">Default Regional Country</span>
            <span className="text-sm font-semibold text-zinc-900 block">
              {user.country || "United States (US)"}
            </span>
          </div>

          <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-200 space-y-1">
            <span className="text-zinc-400 font-medium block">Security Level</span>
            <span className="text-sm font-semibold text-emerald-700 block">
              Bcrypt Hashed & Salted Credentials
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

