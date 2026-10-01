import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb, getProductById } from "@/lib/db";

async function getSessionId() {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get("cartwise_session")?.value;
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    cookieStore.set("cartwise_session", sessionId, { path: "/", maxAge: 60 * 60 * 24 * 30 });
  }
  return sessionId;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionId = await getSessionId();
    const resolvedParams = await params;
    const orderId = Number(resolvedParams.id);

    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const db = getDb();

    const getItemsStmt = db.prepare("SELECT product_id, quantity FROM order_items WHERE order_id = ?");
    const items = getItemsStmt.all(orderId) as { product_id: number, quantity: number }[];

    if (items.length === 0) {
      return NextResponse.json({ error: "Order not found or has no items" }, { status: 404 });
    }

    const transaction = db.transaction(() => {
      const getExisting = db.prepare("SELECT quantity FROM cart_items WHERE session_id = ? AND product_id = ?");
      const insertCart = db.prepare("INSERT INTO cart_items (session_id, product_id, quantity) VALUES (?, ?, ?)");
      const updateCart = db.prepare("UPDATE cart_items SET quantity = ? WHERE session_id = ? AND product_id = ?");

      for (const item of items) {
        // Option to check stock here? Requirements do not mention checking stock during reorder,
        // it just says "Add all items to the current session cart". Stock validation happens on checkout anyway.
        // We'll just add them.
        const existing = getExisting.get(sessionId, item.product_id) as { quantity: number } | undefined;
        if (existing) {
          updateCart.run(existing.quantity + item.quantity, sessionId, item.product_id);
        } else {
          insertCart.run(sessionId, item.product_id, item.quantity);
        }
      }
    });

    transaction();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Reorder failed:", error);
    return NextResponse.json({ error: error?.message || "Reorder failed" }, { status: 500 });
  }
}
