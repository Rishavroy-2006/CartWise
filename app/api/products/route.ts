import { NextRequest, NextResponse } from "next/server";
import { searchProducts, getProductById } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const product = getProductById(Number(id));
      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, product });
    }

    const query = searchParams.get("q") || undefined;
    const category = searchParams.get("category") || undefined;
    const isOrganic = searchParams.get("is_organic") === "true" ? true : undefined;
    const maxPrice = searchParams.get("max_price") ? Number(searchParams.get("max_price")) : undefined;
    const minRating = searchParams.get("min_rating") ? Number(searchParams.get("min_rating")) : undefined;

    const { products, sql } = searchProducts({
      query,
      category,
      isOrganic,
      maxPrice,
      minRating,
    });

    return NextResponse.json({ success: true, products, sql });
  } catch (error) {
    console.error("Products API error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
