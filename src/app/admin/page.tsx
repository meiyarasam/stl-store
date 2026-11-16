import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";
import { getAdminAnalytics } from "@/services/analytics.service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role?.toUpperCase();
  const userEmail = session?.user?.email?.toLowerCase().trim();
  const adminEmail = (process.env.ADMIN_DEFAULT_EMAIL || "admin@theprintfactory.com")
    .toLowerCase()
    .trim();

  const isAuthorized = userRole === "ADMIN" || userEmail === adminEmail;

  if (!isAuthorized && process.env.NODE_ENV === "production") {
    redirect("/login?callbackUrl=/admin");
  }

  // Fetch 100% REAL data from Supabase PostgreSQL
  const analytics = await getAdminAnalytics();

  return (
    <div className="min-h-screen bg-zinc-50/50 pb-16">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <AdminDashboardClient initialAnalytics={analytics} />
      </div>
    </div>
  );
}
