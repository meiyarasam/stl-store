import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { getAllCategories } from "@/lib/database/categories";
import { AdminCategoriesClient } from "@/components/admin/AdminCategoriesClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminCategoriesPage() {
  const session = await getServerSession(authOptions);

  if ((session?.user as any)?.role !== "ADMIN" && process.env.NODE_ENV === "production") {
    redirect("/login?callbackUrl=/admin/categories");
  }

  // Fetch all categories including disabled/inactive categories for admin controls
  const categories = await getAllCategories({ includeInactive: true });

  return (
    <div className="min-h-screen bg-zinc-50/50">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <AdminCategoriesClient initialCategories={categories} />
      </div>
    </div>
  );
}
