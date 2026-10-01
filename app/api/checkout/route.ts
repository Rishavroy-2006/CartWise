import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb, getProductById } from "@/lib/db";
import { Order } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("cartwise_session")?.value;
    if (!sessionId) {
      return NextResponse.json({ error: "Session not found. Cart is empty." }, { status: 400 });
    }

    const db = getDb();
    
    // 1. Fetch cart items
    const cartStmt = db.prepare("SELECT product_id, quantity FROM cart_items WHERE session_id = ?");
    const cartRows = cartStmt.all(sessionId) as { product_id: number, quantity: number }[];
    
    if (cartRows.length === 0) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }

    let orderRow: Order | null = null;
    let outOfStockError = "";

    // Run checkout inside a transaction
    const checkoutTransaction = db.transaction(() => {
      let total = 0;
      const orderItemsToInsert: any[] = [];

      // Verify stock for all items
      for (const item of cartRows) {
        const product = getProductById(item.product_id);
        if (!product) {
          outOfStockError = `Item with ID ${item.product_id} no longer exists.`;
          throw new Error("ROLLBACK_TRIGGER");
        }

        if (product.stock < item.quantity) {
          outOfStockError = `Item '${product.name}' is currently out of stock.`;
          throw new Error("ROLLBACK_TRIGGER");
        }

        total += product.price * item.quantity;
        orderItemsToInsert.push({
          product_id: product.id,
          product_name: product.name,
          unit_price: product.price,
          quantity: item.quantity
        });
      }

      // Insert into orders
      const orderStmt = db.prepare("INSERT INTO orders (total, status) VALUES (?, ?)");
      const orderInfo = orderStmt.run(total, 'delivered'); // or 'transit'
      const orderId = orderInfo.lastInsertRowid;

      // Insert into order_items and decrement stock
      const insertItemStmt = db.prepare(
        "INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity) VALUES (?, ?, ?, ?, ?)"
      );
      const updateStockStmt = db.prepare(
        "UPDATE products SET stock = stock - ? WHERE id = ?"
      );

      for (const oItem of orderItemsToInsert) {
        insertItemStmt.run(orderId, oItem.product_id, oItem.product_name, oItem.unit_price, oItem.quantity);
        updateStockStmt.run(oItem.quantity, oItem.product_id);
      }

      // Clear cart
      db.prepare("DELETE FROM cart_items WHERE session_id = ?").run(sessionId);

      // Return created order
      const getOrderStmt = db.prepare("SELECT * FROM orders WHERE id = ?");
      orderRow = getOrderStmt.get(orderId) as Order;
      
      const getItemsStmt = db.prepare("SELECT * FROM order_items WHERE order_id = ?");
      orderRow.items = getItemsStmt.all(orderId) as any[];
    });

    try {
      checkoutTransaction();
    } catch (err: any) {
      if (err.message === "ROLLBACK_TRIGGER") {
        // Handled by our custom throw
      } else {
        throw err;
      }
    }

    if (outOfStockError) {
      return NextResponse.json({ error: outOfStockError }, { status: 400 });
    }

    return NextResponse.json({ success: true, order: orderRow });
  } catch (error: any) {
    console.error("Checkout failed:", error);
    return NextResponse.json({ error: error?.message || "Checkout failed" }, { status: 500 });
  }
}
