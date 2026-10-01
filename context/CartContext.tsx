"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Product, CartItem, Order } from "@/lib/types";

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => Promise<{ success: boolean; error?: string }>;
  removeFromCart: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, delta: number) => Promise<{ success: boolean; error?: string }>;
  clearCart: () => Promise<void>;
  cartCount: number;
  subtotal: number;
  total: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isReviewOpen: boolean;
  setIsReviewOpen: (open: boolean) => void;
  isConfirmedOpen: boolean;
  setIsConfirmedOpen: (open: boolean) => void;
  confirmedOrder: Order | null;
  setConfirmedOrder: (order: Order | null) => void;
  buyDirectly: (orderId: number) => Promise<{ success: boolean; error?: string }>;
  activeTab: "chat" | "orders";
  setActiveTab: (tab: "chat" | "orders") => void;
  selectedTrace: any | null;
  setSelectedTrace: (trace: any | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isConfirmedOpen, setIsConfirmedOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<"chat" | "orders">("chat");
  const [selectedTrace, setSelectedTrace] = useState<any | null>(null);

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      const data = await res.json();
      if (data.success && data.cart) {
        setCart(data.cart);
      }
    } catch (e) {
      console.error("Failed to fetch cart", e);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (product: Product, quantity = 1) => {
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchCart();
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  };

  const removeFromCart = async (productId: number) => {
    try {
      await fetch(`/api/cart?productId=${productId}`, { method: "DELETE" });
      await fetchCart();
    } catch (e) {
      console.error("Failed to remove from cart", e);
    }
  };

  const updateQuantity = async (productId: number, delta: number) => {
    const item = cart.find(i => i.product.id === productId);
    if (!item) return { success: false, error: "Item not in cart" };

    const newQty = item.quantity + delta;
    
    try {
      const res = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: newQty }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchCart();
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  };

  const clearCart = async () => {
    try {
      await fetch("/api/cart", { method: "DELETE" });
      await fetchCart();
    } catch (e) {
      console.error("Failed to clear cart", e);
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = Number(
    cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0).toFixed(2)
  );
  const total = subtotal;

  const buyDirectly = async (orderId: number) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/reorder`, {
        method: "POST"
      });
      const data = await res.json();
      if (data.success) {
        await fetchCart();
        setIsCartOpen(true);
        return { success: true };
      }
      return { success: false, error: data.error || "Reorder failed." };
    } catch (e: any) {
      return { success: false, error: e?.message || "Network error" };
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        subtotal,
        total,
        isCartOpen,
        setIsCartOpen,
        isReviewOpen,
        setIsReviewOpen,
        isConfirmedOpen,
        setIsConfirmedOpen,
        confirmedOrder,
        setConfirmedOrder,
        buyDirectly,
        activeTab,
        setActiveTab,
        selectedTrace,
        setSelectedTrace,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
