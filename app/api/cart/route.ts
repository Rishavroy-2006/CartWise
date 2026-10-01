import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb, getProductById } from "@/lib/db";

// Fallback to randomUUID from crypto if needed, but in edge/Node we can use crypto.randomUUID
async function getSessionId() {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get("cartwise_session")?.value;
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    cookieStore.set("cartwise_session", sessionId, { path: "/", maxAge: 60 * 60 * 24 * 30 });
  }
  return sessionId;
}

export async function GET() {
  try {
    const sessionId = await getSessionId();
    const db = getDb();
    const stmt = db.prepare(`
      SELECT c.id as cart_item_id, c.quantity, p.*
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      WHERE c.session_id = ?
    `);
    const rows = stmt.all(sessionId) as any[];

    // Transform into CartItem array
    const cart = rows.map((r) => ({
      product: {
        id: r.id,
        name: r.name,
        category: r.category,
        price: r.price,
        description: r.description,
        is_organic: Boolean(r.is_organic),
        stock: r.stock,
        // Since we are returning cart items, UI might need images. 
        // We'll rely on the client or re-fetch from getProductById logic if needed.
        image_url: r.image_url || "/images/honey.png"
      },
      quantity: r.quantity,
    }));

    // Actually, getProductById includes average_rating, review_count, and image_url mapping.
    // Let's reuse getProductById for each row to get the full product object.
    const enrichedCart = rows.map((r) => {
      const product = getProductById(r.id);
      return {
        product: product,
        quantity: r.quantity
      };
    });

    return NextResponse.json({ success: true, cart: enrichedCart });
  } catch (error) {
    console.error("Failed to fetch cart:", error);
    return NextResponse.json({ error: "Failed to retrieve cart" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionId = await getSessionId();
    const body = await req.json();
    const productId = Number(body.productId);
    const quantity = Number(body.quantity) || 1;

    if (!productId) {
      return NextResponse.json({ error: "Valid productId required" }, { status: 400 });
    }

    const db = getDb();
    
    // Check stock
    const product = getProductById(productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    
    // Get existing quantity in cart
    const existingStmt = db.prepare("SELECT quantity FROM cart_items WHERE session_id = ? AND product_id = ?");
    const existing = existingStmt.get(sessionId, productId) as { quantity: number } | undefined;
    const newTotalQuantity = (existing?.quantity || 0) + quantity;

    if (newTotalQuantity > product.stock) {
      return NextResponse.json({ error: `Item '${product.name}' is currently out of stock.` }, { status: 400 });
    }

    if (existing) {
      db.prepare("UPDATE cart_items SET quantity = ? WHERE session_id = ? AND product_id = ?")
        .run(newTotalQuantity, sessionId, productId);
    } else {
      db.prepare("INSERT INTO cart_items (session_id, product_id, quantity) VALUES (?, ?, ?)")
        .run(sessionId, productId, quantity);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to add to cart:", error);
    return NextResponse.json({ error: error?.message || "Failed to add to cart" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const sessionId = await getSessionId();
    const body = await req.json();
    const productId = Number(body.productId);
    const quantity = Number(body.quantity);

    if (!productId || isNaN(quantity)) {
      return NextResponse.json({ error: "Valid productId and quantity required" }, { status: 400 });
    }

    const db = getDb();
    const product = getProductById(productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (quantity > product.stock) {
      return NextResponse.json({ error: `Item '${product.name}' is currently out of stock.` }, { status: 400 });
    }

    if (quantity <= 0) {
      db.prepare("DELETE FROM cart_items WHERE session_id = ? AND product_id = ?")
        .run(sessionId, productId);
    } else {
      db.prepare("UPDATE cart_items SET quantity = ? WHERE session_id = ? AND product_id = ?")
        .run(quantity, sessionId, productId);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to update cart:", error);
    return NextResponse.json({ error: error?.message || "Failed to update cart" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const sessionId = getSessionId();
    const url = new URL(req.url);
    const productIdStr = url.searchParams.get("productId");
    const db = getDb();

    if (productIdStr) {
      const productId = Number(productIdStr);
      db.prepare("DELETE FROM cart_items WHERE session_id = ? AND product_id = ?")
        .run(sessionId, productId);
    } else {
      // Clear entire cart
      db.prepare("DELETE FROM cart_items WHERE session_id = ?").run(sessionId);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to delete cart items:", error);
    return NextResponse.json({ error: error?.message || "Failed to delete cart items" }, { status: 500 });
  }
}
