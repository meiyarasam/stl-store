import { NextResponse } from "next/server";
import { getAllProducts } from "@/lib/database/products";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;
    const featuredOnly = searchParams.get("featured") === "true";
    const sort = (searchParams.get("sort") as any) || "newest";

    const products = await getAllProducts({
      categorySlug,
      search,
      featuredOnly,
      sort,
    });

    return NextResponse.json(
      { success: true, count: products.length, products },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error: any) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch products from database",
        message: error?.message || "Unknown database error",
      },
      { status: 500 }
    );
  }
}
