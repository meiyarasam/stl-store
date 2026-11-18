import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import prisma from "@/lib/database/prisma";
import {
  getCustomerAnalyticsData,
  AnalyticsTimeframe,
} from "@/services/customer-analytics.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
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
      return NextResponse.json(
        { success: false, error: "Unauthorized: Administrator access required." },
        { status: 403 }
      );
    }

    // 2. Parse query parameters
    const { searchParams } = new URL(req.url);
    const filter = (searchParams.get("filter") || "30d") as AnalyticsTimeframe;
    const start = searchParams.get("start") || undefined;
    const end = searchParams.get("end") || undefined;

    // 3. Fetch comprehensive analytics from database
    const data = await getCustomerAnalyticsData(filter, start, end);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err: any) {
    console.error("GET /api/admin/customer-analytics error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to retrieve analytics data from database.",
      },
      { status: 500 }
    );
  }
}
