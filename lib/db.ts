import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { Product, Order, Review, OrderItem } from "./types";

let dbInstance: Database.Database | null = null;

const PRODUCT_IMAGE_MAP: Record<number, string> = {
  1: "/images/honey.png",
  2: "/images/wildflower_honey.png",
  3: "/images/honey.png",
  4: "/images/honey.png",
  5: "/images/honey.png",
  6: "/images/orange_blossom_honey.png",
  7: "/images/honey.png",
  8: "/images/honey.png",
  9: "/images/olive_oil.png",
  10: "/images/olive_oil.png",
  11: "/images/olive_oil.png",
  12: "/images/avocado_oil.png",
  13: "/images/honey.png",
  14: "/images/honey.png",
  15: "/images/honey.png",
  16: "/images/honey.png",
  17: "/images/oats.png",
  18: "/images/rolled_oats.png",
  19: "/images/oats.png",
  20: "/images/steel_cut_oats.png",
  21: "/images/honey.png",
  22: "/images/honey.png",
  23: "/images/honey.png",
  24: "/images/honey.png",
  25: "/images/oats.png",
  26: "/images/oats.png",
  27: "/images/honey.png",
  28: "/images/honey.png",
  29: "/images/oats.png",
  30: "/images/oats.png",
  31: "/images/oats.png",
  32: "/images/oats.png",
};

export function getDb(): Database.Database {
  if (dbInstance) {
    return dbInstance;
  }

  const primaryPath = path.join(process.cwd(), "data", "store.db");
  const dataDir = path.dirname(primaryPath);

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  dbInstance = new Database(primaryPath);
  dbInstance.pragma("journal_mode = WAL");
  dbInstance.pragma("foreign_keys = ON");
  return dbInstance;
}

export interface SearchProductsOptions {
  query?: string;
  category?: string;
  maxPrice?: number;
  isOrganic?: boolean;
  minRating?: number;
  limit?: number;
}

export function searchProducts(options: SearchProductsOptions = {}): {
  products: Product[];
  sql: string;
} {
  const db = getDb();
  let sql = `
    SELECT p.id, p.name, p.category, p.price, p.description, p.is_organic, p.stock,
           rs.average_rating,
           rs.review_count
    FROM products p
    LEFT JOIN ratings_summary rs ON p.id = rs.product_id
    WHERE 1=1
  `;
  const params: (string | number)[] = [];

  if (options.query) {
    sql += ` AND (p.name LIKE ? OR p.description LIKE ? OR p.category LIKE ?)`;
    const like = `%${options.query}%`;
    params.push(like, like, like);
  }

  if (options.category) {
    sql += ` AND p.category = ?`;
    params.push(options.category);
  }

  if (options.maxPrice !== undefined) {
    sql += ` AND p.price <= ?`;
    params.push(options.maxPrice);
  }

  if (options.isOrganic !== undefined) {
    sql += ` AND p.is_organic = ?`;
    params.push(options.isOrganic ? 1 : 0);
  }

  if (options.minRating !== undefined) {
    sql += ` AND rs.average_rating >= ?`;
    params.push(options.minRating);
  }

  sql += ` ORDER BY p.id ASC`;

  if (options.limit !== undefined) {
    sql += ` LIMIT ?`;
    params.push(options.limit);
  }

  const stmt = db.prepare(sql);
  const rows = stmt.all(...params) as Array<{
    id: number;
    name: string;
    category: string;
    price: number;
    description: string;
    is_organic: number;
    stock: number;
    average_rating: number | null;
    review_count: number | null;
  }>;

  const products: Product[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    category: r.category,
    price: r.price,
    description: r.description,
    is_organic: Boolean(r.is_organic),
    stock: r.stock,
    average_rating: r.average_rating ? Number(r.average_rating) : 0,
    review_count: r.review_count || 0,
    image_url: PRODUCT_IMAGE_MAP[r.id] || "/images/honey.png",
  }));

  return { products, sql };
}

export function getProductById(id: number): Product | null {
  const db = getDb();
  const sql = `
    SELECT p.id, p.name, p.category, p.price, p.description, p.is_organic, p.stock,
           rs.average_rating,
           rs.review_count
    FROM products p
    LEFT JOIN ratings_summary rs ON p.id = rs.product_id
    WHERE p.id = ?
  `;
  const row = db.prepare(sql).get(id) as {
    id: number;
    name: string;
    category: string;
    price: number;
    description: string;
    is_organic: number;
    stock: number;
    average_rating: number | null;
    review_count: number | null;
  } | undefined;

  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: row.price,
    description: row.description,
    is_organic: Boolean(row.is_organic),
    stock: row.stock,
    average_rating: row.average_rating ? Number(row.average_rating) : 0,
    review_count: row.review_count || 0,
    image_url: PRODUCT_IMAGE_MAP[row.id] || "/images/honey.png",
  };
}

export function createOrder(productId: number): { order: Order; success: boolean } {
  const product = getProductById(productId);
  if (!product) {
    throw new Error(`Product with ID ${productId} does not exist in store.`);
  }

  const db = getDb();
  let orderRow: Order | null = null;

  db.transaction(() => {
    const stmt = db.prepare(
      "INSERT INTO orders (total, status) VALUES (?, ?)"
    );
    const info = stmt.run(product.price, 'delivered');
    
    const itemStmt = db.prepare(
      "INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity) VALUES (?, ?, ?, ?, ?)"
    );
    itemStmt.run(info.lastInsertRowid, product.id, product.name, product.price, 1);

    const orderStmt = db.prepare("SELECT * FROM orders WHERE id = ?");
    orderRow = orderStmt.get(info.lastInsertRowid) as Order;
    
    if (orderRow) {
      const itemsStmt = db.prepare("SELECT * FROM order_items WHERE order_id = ?");
      orderRow.items = itemsStmt.all(orderRow.id) as OrderItem[];
    }
  })();

  return { order: orderRow!, success: true };
}

export function getOrders(): Order[] {
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM orders ORDER BY id DESC");
  const orders = stmt.all() as Order[];

  const itemsStmt = db.prepare("SELECT * FROM order_items WHERE order_id = ?");
  for (const order of orders) {
    order.items = itemsStmt.all(order.id) as OrderItem[];
  }

  return orders;
}

export function getProductReviews(productId: number): Review[] {
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM reviews WHERE product_id = ? ORDER BY rating DESC");
  return stmt.all(productId) as Review[];
}
