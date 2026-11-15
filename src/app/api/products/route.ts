import { NextResponse } from "next/server";
import { getAllProducts } from "@/lib/database/products";

export const dynamic = "force-dynamic";

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

    return NextResponse.json({ products });
  } catch (error: any) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
