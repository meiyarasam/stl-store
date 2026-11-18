import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { CustomerAnalyticsClient } from "@/components/admin/analytics/CustomerAnalyticsClient";
import { getCustomerAnalyticsData } from "@/services/customer-analytics.service";
import prisma from "@/lib/database/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminAnalyticsPage() {
  // 1. Authenticate Administrator
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role?.toUpperCase();
  const userEmail = session?.user?.email?.toLowerCase().trim();
  const adminEmail = (
    process.env.ADMIN_DEFAULT_EMAIL || "theprintfactory2026@gmail.com"
  )
    .toLowerCase()
    .trim();

  let isAuthorized =
    userRole === "ADMIN" ||
    userEmail === adminEmail ||
    userEmail === "theprintfactory2026@gmail.com" ||
    userEmail === "admin@theprintfactory.com";

  if (!isAuthorized && userEmail) {
    const dbUser = await prisma.user
      .findUnique({ where: { email: userEmail } })
      .catch(() => null);
    if (dbUser?.role === "ADMIN") {
      isAuthorized = true;
    }
  }

  if (!isAuthorized && process.env.NODE_ENV === "production") {
    redirect("/login?callbackUrl=/admin/analytics");
  }

  // 2. Fetch initial analytics data directly from PostgreSQL
  const initialData = await getCustomerAnalyticsData("30d");

  return (
    <div className="min-h-screen bg-zinc-50/50 pb-16">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <CustomerAnalyticsClient initialData={initialData} />
      </div>
    </div>
  );
}
