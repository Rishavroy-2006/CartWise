"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, CartItem, Order } from "@/lib/types";

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, delta: number) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  estimatedTax: number;
  total: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isReviewOpen: boolean;
  setIsReviewOpen: (open: boolean) => void;
  isConfirmedOpen: boolean;
  setIsConfirmedOpen: (open: boolean) => void;
  confirmedOrder: Order | null;
  setConfirmedOrder: (order: Order | null) => void;
  buyDirectly: (productId: number) => Promise<{ success: boolean; order?: Order; error?: string }>;
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

  // Initialize with initial items matching Stitch design if needed
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cartwise_cart");
      if (saved) {
        setCart(JSON.parse(saved));
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("cartwise_cart", JSON.stringify(cart));
    } catch {
      // Ignore storage errors
    }
  }, [cart]);

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = Number(
    cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0).toFixed(2)
  );
  const estimatedTax = Number((subtotal * 0.05).toFixed(2));
  const total = Number((subtotal + estimatedTax).toFixed(2));

  const buyDirectly = async (productId: number) => {
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (data.success && data.order) {
        setConfirmedOrder(data.order);
        setIsConfirmedOpen(true);
        return { success: true, order: data.order };
      }
      return { success: false, error: data.error || "Order placement failed." };
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
        estimatedTax,
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
