import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/database/prisma";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const VALID_EVENT_TYPES = [
  "PAGE_VIEW",
  "PRODUCT_VIEW",
  "ADD_TO_CART",
  "CHECKOUT_INITIATED",
  "PURCHASE_COMPLETED",
];

export async function POST(req: NextRequest) {
  try {
    let body: any;
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      body = await req.json();
    } else {
      const text = await req.text();
      body = JSON.parse(text);
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
    }

    const { eventType, visitorId, sessionId, path, referrer, productId, metadata } = body;

    // Validate event type
    if (!eventType || !VALID_EVENT_TYPES.includes(eventType)) {
      return NextResponse.json({ success: false, error: "Invalid event type" }, { status: 400 });
    }

    // STRICT: Exclude any admin or API paths
    const cleanPath = typeof path === "string" ? path.trim() : "";
    if (
      !cleanPath ||
      cleanPath === "/admin" ||
      cleanPath.startsWith("/admin/") ||
      cleanPath.startsWith("/api/")
    ) {
      return NextResponse.json({ success: false, message: "Admin/API routes excluded" });
    }

    // Validate visitor ID
    if (!visitorId || typeof visitorId !== "string") {
      return NextResponse.json({ success: false, error: "Missing visitor identifier" }, { status: 400 });
    }

    // Compute privacy-preserving salted IP hash
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const salt = process.env.AUTH_SECRET || "tpf_analytics_salt";
    const ipHash = crypto.createHash("sha256").update(ip + salt).digest("hex").substring(0, 16);
    const userAgent = (req.headers.get("user-agent") || "").substring(0, 500);

    // Save event to database
    await prisma.analyticsEvent.create({
      data: {
        eventType,
        visitorId: visitorId.substring(0, 64),
        sessionId: typeof sessionId === "string" ? sessionId.substring(0, 64) : null,
        path: cleanPath.substring(0, 255),
        referrer: typeof referrer === "string" ? referrer.substring(0, 500) : null,
        productId: typeof productId === "string" ? productId : null,
        metadata: metadata && typeof metadata === "object" ? metadata : undefined,
        ipHash,
        userAgent,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    // Fail gracefully without leaking errors or breaking visitor flows
    return NextResponse.json(
      { success: false, error: "Failed to record event" },
      { status: 500 }
    );
  }
}
