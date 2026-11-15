import { NextResponse } from "next/server";
import { processFileDownload } from "@/lib/database/downloads";

export async function GET(
  req: Request,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token;
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    const result = await processFileDownload({
      downloadToken: token,
      ipAddress: ip,
      userAgent,
    });

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    if (result.isStream) {
      return NextResponse.redirect(new URL(result.downloadUrl, req.url));
    }

    // Redirect to signed URL
    return NextResponse.redirect(result.downloadUrl, 302);
  } catch (err: any) {
    console.error("Download route error:", err);
    return NextResponse.json(
      { error: "Failed to process download request" },
      { status: 500 }
    );
  }
}

