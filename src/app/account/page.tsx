import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { redirect } from "next/navigation";
import { getUserOrders } from "@/lib/database/orders";
import { getUserDownloads } from "@/lib/database/downloads";
import {
  AccountHeader,
  QuickStatsGrid,
  RecentDownloadsList,
  RecentOrdersList,
} from "@/components/dashboard";

export default async function AccountOverviewPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/account");
  }

  const userId = (session.user as any).id || "admin_super_user";
  const [orders, downloads] = await Promise.all([
    getUserOrders(userId),
    getUserDownloads(userId),
  ]);

  const recentOrders = orders.slice(0, 3);
  const recentDownloads = downloads.slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Account Header */}
      <AccountHeader
        userName={session.user.name || "Maker"}
        userEmail={session.user.email || ""}
        country={(session.user as any).country || "Global"}
        downloadsCount={downloads.length}
      />

      {/* Quick Stats Grid */}
      <QuickStatsGrid
        ordersCount={orders.length}
        downloadsCount={downloads.length}
        isVerified={true}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Downloads */}
        <div className="lg:col-span-7">
          <RecentDownloadsList downloads={recentDownloads} />
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-5">
          <RecentOrdersList orders={recentOrders} />
        </div>
      </div>
    </div>
  );
}

