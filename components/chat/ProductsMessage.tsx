"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Product, AgentTrace } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import { Leaf, Star, ShoppingCart, Zap, Check, ChevronDown, ChevronUp, Sparkles } from "lucide-react";

interface ProductsMessageProps {
  products: Product[];
  text?: string;
  trace?: AgentTrace;
  onOpenTrace?: (trace: AgentTrace) => void;
}

export function ProductsMessage({ products, text, trace, onOpenTrace }: ProductsMessageProps) {
  const { addToCart, buyDirectly } = useCart();
  const [addedIds, setAddedIds] = useState<Record<number, boolean>>({});
  const [buyingId, setBuyingId] = useState<number | null>(null);
  const [showTraceInline, setShowTraceInline] = useState(false);

  const handleAdd = (product: Product) => {
    addToCart(product, 1);
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1800);
  };

  const handleBuy = async (productId: number) => {
    setBuyingId(productId);
    await buyDirectly(productId);
    setBuyingId(null);
  };

  return (
    <div className="flex items-start gap-3 w-full max-w-4xl">
      <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
        <Leaf className="w-4 h-4" />
      </div>

      <div className="flex-1 space-y-3.5">
        {/* Assistant Header Intro */}
        {text && (
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl rounded-tl-xs p-4 sm:p-5 shadow-xs text-on-surface">
            <p className="text-sm sm:text-base font-medium leading-relaxed">{text}</p>

            {/* Trace Toggle Banner */}
            {trace && (
              <div className="mt-3 pt-3 border-t border-outline-variant/30 flex items-center justify-between text-xs text-on-surface-variant">
                <button
                  onClick={() => setShowTraceInline(!showTraceInline)}
                  className="flex items-center gap-1.5 font-semibold text-secondary hover:underline cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Agent Reasoning Trace ({trace.steps.length} steps)</span>
                  {showTraceInline ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {onOpenTrace && (
                  <button
                    onClick={() => onOpenTrace(trace)}
                    className="text-primary font-semibold hover:underline cursor-pointer"
                  >
                    View Full Inspector &rarr;
                  </button>
                )}
              </div>
            )}

            {/* Inline Trace Details */}
            {showTraceInline && trace && (
              <div className="mt-3 p-3 rounded-xl bg-surface-container-low border border-outline-variant/40 space-y-2 text-xs">
                <div className="font-mono text-[11px] text-primary bg-surface-container px-2 py-1 rounded">
                  SQL: {trace.sql_query || "Direct DB indexed query"}
                </div>
                {trace.steps.map((s, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5" />
                    <div>
                      <span className="font-semibold text-on-surface">{s.title}: </span>
                      <span className="text-on-surface-variant">{s.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Product Cards Layout: swipeable carousel on mobile, grid on desktop */}
        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
          {products.map((product) => {
            const isAdded = Boolean(addedIds[product.id]);
            const isBuying = buyingId === product.id;

            return (
              <div
                key={product.id}
                className="bg-surface-container-lowest border border-outline-variant/40 hover:border-primary-container/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 w-[85vw] sm:w-auto flex-shrink-0 snap-center sm:snap-align-none"
              >
                <div>
                  {/* Image container */}
                  <div className="relative w-full h-44 rounded-xl bg-surface-container-low overflow-hidden mb-3.5 flex items-center justify-center p-2">
                    <img
                      src={product.image_url || "/images/honey.png"}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        // Fallback if image path fails
                        (e.target as HTMLImageElement).src = "/images/honey.png";
                      }}
                    />

                    {/* Organic Badge */}
                    {product.is_organic && (
                      <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-secondary-container text-on-secondary-container shadow-xs">
                        <Leaf className="w-3 h-3 text-secondary" />
                        Organic
                      </span>
                    )}

                    {/* Verified In Store Badge */}
                    <span className="absolute top-2.5 right-2.5 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-surface-container-highest text-on-surface-variant">
                      ID: #{product.id}
                    </span>
                  </div>

                  {/* Rating Stars & Count */}
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="flex items-center text-amber-500">
                      <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    </div>
                    <span className="text-xs font-bold text-on-surface">
                      {product.average_rating ? product.average_rating.toFixed(1) : "4.5"}
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      ({product.review_count || 1} {product.review_count === 1 ? "review" : "reviews"})
                    </span>
                  </div>

                  {/* Title (CRITICAL RULE: never truncated) */}
                  <h3 className="text-base sm:text-lg font-bold text-on-surface mb-1.5 leading-snug break-words">
                    {product.name}
                  </h3>

                  {/* Category & Description */}
                  <p className="text-xs text-on-surface-variant leading-relaxed mb-4 line-clamp-3">
                    {product.description}
                  </p>
                </div>

                {/* Pricing & Deterministic Actions */}
                <div className="pt-3 border-t border-outline-variant/30 mt-auto">
                  <div className="flex items-baseline justify-between mb-3">
                    <span className="text-xs font-medium text-on-surface-variant">Price</span>
                    <span className="text-lg sm:text-xl font-bold text-primary">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>

                  {/* Action Buttons: Never wrap awkwardly */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleAdd(product)}
                      disabled={isAdded || product.stock === 0}
                      className={`w-full py-2 px-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all duration-150 active:scale-98 whitespace-nowrap ${
                        product.stock === 0
                          ? "bg-surface-container-high text-on-surface-variant cursor-not-allowed opacity-75"
                          : isAdded
                          ? "bg-secondary text-white cursor-default"
                          : "border border-primary-container text-primary hover:bg-surface-container-low cursor-pointer"
                      }`}
                    >
                      {product.stock === 0 ? (
                        <span>Out of stock</span>
                      ) : isAdded ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleBuy(product.id)}
                      disabled={isBuying || product.stock === 0}
                      className={`w-full py-2 px-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all duration-150 active:scale-98 shadow-xs whitespace-nowrap ${
                        product.stock === 0
                          ? "bg-surface-container-highest text-on-surface-variant cursor-not-allowed opacity-50"
                          : "bg-primary text-white hover:bg-primary-container cursor-pointer"
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>{isBuying ? "Ordering…" : "Buy Now"}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
