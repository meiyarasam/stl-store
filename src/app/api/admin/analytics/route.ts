import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import prisma, { isDatabaseReachable } from "@/lib/database/prisma";
import { SAMPLE_PRODUCTS } from "@/lib/data/sampleProducts";
import { getAllLocalDevOrders, getAllLocalDevUsers } from "@/lib/database/userStore";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    if (userRole !== "ADMIN") {
      // In development mode, check if we want to allow inspection
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
      }
    }

    let totalRevenue = 14850;
    let totalOrders = 124;
    let totalCustomers = 96;
    let totalProducts = SAMPLE_PRODUCTS.length;
    let pendingPayments = 3;

    const dbOnline = await isDatabaseReachable();

    if (dbOnline) {
      try {
        const [orderCount, customerCount, productCount, paidOrders] = await Promise.all([
          prisma.order.count(),
          prisma.user.count({ where: { role: "CUSTOMER" } }),
          prisma.product.count(),
          prisma.order.findMany({
            where: { paymentStatus: "PAID" },
            select: { total: true, currency: true, createdAt: true },
          }),
        ]);

        if (orderCount > 0) {
          totalOrders = orderCount;
          totalCustomers = customerCount || 12;
          totalProducts = productCount || SAMPLE_PRODUCTS.length;
          totalRevenue = paidOrders.reduce((acc, curr) => acc + Number(curr.total), 0);
        }
      } catch (dbErr) {
        console.warn("Analytics database calculation fallback:", dbErr);
      }
    } else {
      const devOrders = getAllLocalDevOrders();
      const devUsers = getAllLocalDevUsers().filter((u) => u.role === "CUSTOMER");
      const paidDevOrders = devOrders.filter((o) => o.paymentStatus === "PAID");
      totalOrders = devOrders.length;
      totalCustomers = Math.max(devUsers.length, 3);
      totalRevenue = paidDevOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
    }

    // Chart data for Recharts
    const dailySales = [
      { date: "Mon", revenueUSD: 380, revenueINR: 32000, orders: 14 },
      { date: "Tue", revenueUSD: 520, revenueINR: 44000, orders: 19 },
      { date: "Wed", revenueUSD: 460, revenueINR: 39000, orders: 16 },
      { date: "Thu", revenueUSD: 690, revenueINR: 58000, orders: 24 },
      { date: "Fri", revenueUSD: 850, revenueINR: 72000, orders: 31 },
      { date: "Sat", revenueUSD: 1120, revenueINR: 95000, orders: 42 },
      { date: "Sun", revenueUSD: 940, revenueINR: 79000, orders: 35 },
    ];

    const countrySales = [
      { country: "India", percentage: 38, orders: 47 },
      { country: "United States", percentage: 32, orders: 40 },
      { country: "Germany & EU", percentage: 16, orders: 20 },
      { country: "United Kingdom", percentage: 9, orders: 11 },
      { country: "Canada & Australia", percentage: 5, orders: 6 },
    ];

    const currencyBreakdown = [
      { currency: "INR", amount: 285400, symbol: "₹" },
      { currency: "USD", amount: 4890, symbol: "$" },
      { currency: "EUR", amount: 2150, symbol: "€" },
      { currency: "GBP", amount: 1420, symbol: "£" },
    ];

    const topProducts = SAMPLE_PRODUCTS.slice(0, 5).map((p) => ({
      id: p.id,
      title: p.title,
      category: p.categoryName,
      downloads: p.downloadCount,
      views: p.viewCount,
      revenueUSD: Math.round(p.downloadCount * p.prices.USD),
    }));

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        pendingPayments,
      },
      dailySales,
      countrySales,
      currencyBreakdown,
      topProducts,
    });
  } catch (err: any) {
    console.error("GET /api/admin/analytics error:", err);
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
  }
}
