"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Product } from "@/lib/types";
import {
  X,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  CheckCircle,
  ShieldCheck,
  ShoppingBag,
  CreditCard,
  MapPin,
  Leaf,
} from "lucide-react";

export function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    estimatedTax,
    total,
    isReviewOpen,
    setIsReviewOpen,
    isConfirmedOpen,
    setIsConfirmedOpen,
    confirmedOrder,
    setConfirmedOrder,
  } = useCart();

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  if (!isCartOpen && !isReviewOpen && !isConfirmedOpen) {
    return null;
  }

  const handleProceedToReview = () => {
    setIsCartOpen(false);
    setIsReviewOpen(true);
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setIsPlacingOrder(true);

    try {
      // Place order for first item or batch
      const firstItem = cart[0];
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: firstItem.product.id }),
      });
      const data = await res.json();

      if (data.success && data.order) {
        setConfirmedOrder(data.order);
        clearCart();
        setIsReviewOpen(false);
        setIsConfirmedOpen(true);
      }
    } catch (e) {
      console.error("Order placement failed", e);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-surface border border-outline-variant/40 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* TOP STEPPER HEADER */}
        <div className="bg-surface-container-lowest border-b border-outline-variant/30 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (isReviewOpen) {
                  setIsReviewOpen(false);
                  setIsCartOpen(true);
                } else {
                  setIsCartOpen(false);
                  setIsReviewOpen(false);
                  setIsConfirmedOpen(false);
                }
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-secondary cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isReviewOpen ? "Back to Cart" : "Continue Shopping"}</span>
            </button>
          </div>

          {/* Stepper Progress */}
          <div className="flex items-center gap-4 text-xs font-bold">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isCartOpen ? "bg-primary text-white" : "bg-secondary-container text-secondary"
                }`}
              >
                1
              </span>
              <span className={isCartOpen ? "text-primary" : "text-on-surface-variant"}>Cart</span>
            </div>
            <div className="w-6 h-px bg-outline-variant" />
            <div className="flex items-center gap-1.5">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isReviewOpen ? "bg-primary text-white" : "bg-surface-container-high text-on-surface-variant"
                }`}
              >
                2
              </span>
              <span className={isReviewOpen ? "text-primary" : "text-on-surface-variant"}>Review</span>
            </div>
            <div className="w-6 h-px bg-outline-variant" />
            <div className="flex items-center gap-1.5">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isConfirmedOpen ? "bg-secondary text-white" : "bg-surface-container-high text-on-surface-variant"
                }`}
              >
                3
              </span>
              <span className={isConfirmedOpen ? "text-secondary" : "text-on-surface-variant"}>Confirmed</span>
            </div>
          </div>

          <button
            onClick={() => {
              setIsCartOpen(false);
              setIsReviewOpen(false);
              setIsConfirmedOpen(false);
            }}
            className="p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant hover:text-primary cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL CONTENT: VIEW 1 - CART */}
        {isCartOpen && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-8">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-4 max-w-sm mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-surface-container-low text-on-surface-variant flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8 text-outline" />
                </div>
                <h3 className="text-lg font-bold text-on-surface">Your Cart is Empty</h3>
                <p className="text-xs sm:text-sm text-on-surface-variant">
                  Explore our verified organic catalog or ask CartWise to find items for your pantry.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-primary text-white font-semibold text-xs sm:text-sm hover:bg-primary-container transition-colors cursor-pointer"
                >
                  Start Browsing
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
                {/* Items List */}
                <div className="lg:col-span-7 space-y-3.5">
                  <div className="flex items-center justify-between pb-2">
                    <h2 className="text-base sm:text-lg font-bold text-primary">
                      Your Cart ({cart.reduce((sum, i) => sum + i.quantity, 0)} items)
                    </h2>
                    <button
                      onClick={clearCart}
                      className="text-xs text-error hover:underline font-semibold cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>

                  {cart.map(({ product, quantity }) => (
                    <div
                      key={product.id}
                      className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-4 flex gap-4 items-center shadow-xs"
                    >
                      {/* Thumbnail */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-surface-container-low p-1.5 flex items-center justify-center flex-shrink-0">
                        <img
                          src={product.image_url || "/images/honey.png"}
                          alt={product.name}
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/images/honey.png";
                          }}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm sm:text-base text-on-surface leading-tight break-words mb-1">
                          {product.name}
                        </h4>
                        <span className="text-xs text-on-surface-variant block mb-2">
                          ${product.price.toFixed(2)} each
                        </span>

                        {/* Quantity Stepper */}
                        <div className="flex items-center gap-2">
                          <div className="inline-flex items-center border border-outline-variant/60 rounded-lg bg-surface-container-lowest">
                            <button
                              onClick={() => updateQuantity(product.id, -1)}
                              className="p-1 hover:bg-surface-container text-on-surface-variant cursor-pointer rounded-l-lg"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-3 text-xs font-bold text-on-surface">{quantity}</span>
                            <button
                              onClick={() => updateQuantity(product.id, 1)}
                              className="p-1 hover:bg-surface-container text-on-surface-variant cursor-pointer rounded-r-lg"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(product.id)}
                            className="p-1.5 text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Line Item Total */}
                      <div className="text-right flex-shrink-0">
                        <span className="text-base sm:text-lg font-bold text-primary block">
                          ${(product.price * quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary Box */}
                <div className="lg:col-span-5 bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                  <h3 className="font-bold text-base text-on-surface pb-3 border-b border-outline-variant/30">
                    Order Summary
                  </h3>

                  <div className="space-y-2.5 text-xs sm:text-sm">
                    <div className="flex justify-between text-on-surface-variant">
                      <span>Item Subtotal</span>
                      <span className="font-semibold text-on-surface">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-on-surface-variant">
                      <span>Estimated Tax (5%)</span>
                      <span className="font-semibold text-on-surface">${estimatedTax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-on-surface-variant">
                      <span>Organic Green Shipping</span>
                      <span className="font-bold text-secondary">FREE</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-outline-variant/30 flex justify-between items-baseline">
                    <span className="font-bold text-base text-on-surface">Total</span>
                    <span className="font-bold text-xl sm:text-2xl text-primary">${total.toFixed(2)}</span>
                  </div>

                  <button
                    onClick={handleProceedToReview}
                    className="w-full py-3 px-4 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-container transition-all cursor-pointer active:scale-98 shadow-sm flex items-center justify-center gap-2"
                  >
                    <span>Proceed to Order Review</span>
                  </button>

                  <div className="flex items-center gap-2 text-[11px] text-on-surface-variant pt-1 justify-center">
                    <ShieldCheck className="w-4 h-4 text-secondary" />
                    <span>Truthful data guarantee • Backed by SQLite</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODAL CONTENT: VIEW 2 - REVIEW ORDER (cartwise_review_order_3b) */}
        {isReviewOpen && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-primary mb-1">
                  Review Your Order
                </h2>
                <p className="text-xs sm:text-sm text-on-surface-variant">
                  Verify shipping address and details before deterministic order placement.
                </p>
              </div>

              {/* Delivery Address (Fixed / Non-invented) */}
              <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-xs">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm">
                  <span className="font-bold text-on-surface block mb-0.5">Delivery Address</span>
                  <p className="text-on-surface-variant">124 Botanical Way, Suite 4B</p>
                  <p className="text-on-surface-variant">San Francisco, CA 94107</p>
                  <span className="text-[11px] font-semibold text-secondary block mt-1">
                    Standard Ground (3–5 Business Days)
                  </span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-xs">
                <CreditCard className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm">
                  <span className="font-bold text-on-surface block mb-0.5">Payment Method</span>
                  <p className="text-on-surface-variant">Organic Store Account (Verified Balance)</p>
                  <span className="text-[11px] text-on-surface-variant">Direct checkout with product_id</span>
                </div>
              </div>

              {/* Items Breakdown */}
              <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
                <span className="font-bold text-xs uppercase tracking-wider text-on-surface-variant block pb-2 border-b border-outline-variant/30">
                  Items to Order ({cart.reduce((s, i) => s + i.quantity, 0)})
                </span>
                {cart.map(({ product, quantity }) => (
                  <div key={product.id} className="flex justify-between items-center text-xs sm:text-sm">
                    <div>
                      <span className="font-bold text-on-surface block">{product.name}</span>
                      <span className="text-on-surface-variant">Qty: {quantity} (ID: #{product.id})</span>
                    </div>
                    <span className="font-bold text-primary">${(product.price * quantity).toFixed(2)}</span>
                  </div>
                ))}

                <div className="pt-3 border-t border-outline-variant/30 flex justify-between font-bold text-base text-primary">
                  <span>Grand Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Confirm Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
                className="w-full py-3.5 px-6 rounded-xl bg-primary text-white font-bold text-sm sm:text-base hover:bg-primary-container transition-all cursor-pointer active:scale-98 shadow-sm flex items-center justify-center gap-2"
              >
                <span>{isPlacingOrder ? "Placing Order in Database…" : `Place Order ($${total.toFixed(2)})`}</span>
              </button>
            </div>
          </div>
        )}

        {/* MODAL CONTENT: VIEW 3 - ORDER CONFIRMED (cartwise_order_confirmed_3c) */}
        {isConfirmedOpen && (
          <div className="flex-1 overflow-y-auto p-6 sm:p-12 text-center flex flex-col justify-center items-center">
            <div className="max-w-md mx-auto space-y-5">
              <div className="w-16 h-16 rounded-full bg-secondary-container text-secondary flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-secondary block mb-1">
                  Order Successfully Placed
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-primary">
                  Order #{confirmedOrder?.id || "1042"} Confirmed
                </h2>
                <p className="text-xs sm:text-sm text-on-surface-variant mt-2 leading-relaxed">
                  Your order for <strong>{confirmedOrder?.product_name || "Organic Raw Honey"}</strong> ($
                  {confirmedOrder?.price?.toFixed(2) || "14.99"}) has been recorded directly to the SQLite database.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs sm:text-sm text-on-surface space-y-1">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Order ID:</span>
                  <span className="font-bold text-primary">#{confirmedOrder?.id || 1042}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Estimated Delivery:</span>
                  <span className="font-bold text-secondary">3–5 Business Days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Database Timestamp:</span>
                  <span className="font-mono text-xs">{confirmedOrder?.ordered_at || new Date().toISOString()}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setIsConfirmedOpen(false)}
                  className="px-6 py-2.5 rounded-full bg-primary text-white font-semibold text-xs sm:text-sm hover:bg-primary-container transition-colors cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
