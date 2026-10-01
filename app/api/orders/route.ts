import { NextRequest, NextResponse } from "next/server";
import { getOrders, createOrder } from "@/lib/db";

export async function GET() {
  try {
    const orders = getOrders();
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json(
      { error: "Failed to retrieve orders from database." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const productId = Number(body.productId);

    if (!productId || isNaN(productId)) {
      return NextResponse.json(
        { error: "A valid numeric productId is required to place an order." },
        { status: 400 }
      );
    }

    const { order, success } = createOrder(productId);
    return NextResponse.json({ success, order });
  } catch (error: any) {
    console.error("Order creation failed:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create order." },
      { status: 400 }
    );
  }
}
