import { NextResponse } from "next/server";
import { getLiveExchangeRates } from "@/services/currency.service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const forceFresh = searchParams.get("refresh") === "true";

    const data = await getLiveExchangeRates(forceFresh);

    return NextResponse.json({
      success: true,
      base: data.base,
      rates: data.rates,
      lastUpdated: data.lastUpdated,
      lastUpdatedUnix: data.lastUpdatedUnix,
      source: data.source,
    });
  } catch (error: any) {
    console.error("GET /api/currency/rates error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error.message ||
          "Failed to retrieve up-to-date exchange rates. Please check network connectivity.",
      },
      { status: 503 }
    );
  }
}
