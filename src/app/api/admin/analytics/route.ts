import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { getAdminAnalytics } from "@/services/analytics.service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role?.toUpperCase();
    const userEmail = session?.user?.email?.toLowerCase().trim();
    const adminEmail = (process.env.ADMIN_DEFAULT_EMAIL || "admin@theprintfactory.com")
      .toLowerCase()
      .trim();

    const isAuthorized = userRole === "ADMIN" || userEmail === adminEmail;

    if (!isAuthorized && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Unauthorized: Administrator privileges required to access analytics." },
        { status: 403 }
      );
    }

    const analytics = await getAdminAnalytics();

    return NextResponse.json(
      {
        success: true,
        analytics,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (err: any) {
    console.error("GET /api/admin/analytics error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to retrieve real-time analytics from database.",
      },
      { status: 500 }
    );
  }
}
