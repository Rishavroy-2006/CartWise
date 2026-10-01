import { test, expect, describe, beforeAll } from 'vitest';
import crypto from 'crypto';

const API_URL = 'http://localhost:3000/api';

describe('Cart & Checkout API', () => {
  let sessionId: string;
  let cookieHeader: string;

  beforeAll(() => {
    sessionId = crypto.randomUUID();
    cookieHeader = `cartwise_session=${sessionId}`;
  });

  test('Cart starts empty', async () => {
    const res = await fetch(`${API_URL}/cart`, {
      headers: { Cookie: cookieHeader }
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.cart).toEqual([]);
  });

  test('Cannot add out-of-stock item (Product 6)', async () => {
    const res = await fetch(`${API_URL}/cart`, {
      method: 'POST',
      headers: { Cookie: cookieHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: 6, quantity: 1 })
    });
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toContain('out of stock');
  });

  test('Can add in-stock items to cart', async () => {
    // Add Product 1
    let res = await fetch(`${API_URL}/cart`, {
      method: 'POST',
      headers: { Cookie: cookieHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: 1, quantity: 2 })
    });
    expect(res.status).toBe(200);

    // Add Product 2
    res = await fetch(`${API_URL}/cart`, {
      method: 'POST',
      headers: { Cookie: cookieHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: 2, quantity: 1 })
    });
    expect(res.status).toBe(200);

    // Verify cart contents
    res = await fetch(`${API_URL}/cart`, {
      headers: { Cookie: cookieHeader }
    });
    const data = await res.json();
    expect(data.cart.length).toBe(2);
    expect(data.cart.find((c: any) => c.product.id === 1).quantity).toBe(2);
    expect(data.cart.find((c: any) => c.product.id === 2).quantity).toBe(1);
  });

  test('Checkout succeeds and clears cart', async () => {
    const res = await fetch(`${API_URL}/checkout`, {
      method: 'POST',
      headers: { Cookie: cookieHeader }
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.order.items.length).toBe(2);

    // Verify cart is empty
    const cartRes = await fetch(`${API_URL}/cart`, {
      headers: { Cookie: cookieHeader }
    });
    const cartData = await cartRes.json();
    expect(cartData.cart.length).toBe(0);
  });

  test('Reorder populates cart', async () => {
    // Reorder historic order #1039
    const res = await fetch(`${API_URL}/orders/1039/reorder`, {
      method: 'POST',
      headers: { Cookie: cookieHeader }
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);

    // Verify cart has the reordered items
    const cartRes = await fetch(`${API_URL}/cart`, {
      headers: { Cookie: cookieHeader }
    });
    const cartData = await cartRes.json();
    // Order #1039 has Organic Raw Honey (x1) and Rolled Oats (x2)
    expect(cartData.cart.length).toBeGreaterThan(0);
  });
});
