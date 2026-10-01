"use client";

import React, { useState } from "react";
import { Product } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import { Leaf, Star, ShoppingCart, Check, Scale } from "lucide-react";

interface CompareMessageProps {
  products: Product[];
  comparisonPoints: Record<string, string[]>;
}

export function CompareMessage({ products, comparisonPoints }: CompareMessageProps) {
  const { addToCart } = useCart();
  const [addedIds, setAddedIds] = useState<Record<number, boolean>>({});

  const handleAdd = (product: Product) => {
    addToCart(product, 1);
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1800);
  };

  const pointKeys = Object.keys(comparisonPoints);

  return (
    <div className="flex items-start gap-3 w-full max-w-5xl">
      <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
        <Scale className="w-4 h-4" />
      </div>

      <div className="flex-1 bg-surface-container-lowest border border-outline-variant/40 rounded-2xl rounded-tl-xs p-4 sm:p-6 shadow-xs overflow-hidden">
        {/* Header */}
        <div className="pb-4 mb-4 border-b border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            <h2 className="text-lg sm:text-xl font-bold text-primary tracking-tight">
              Product Comparison Matrix
            </h2>
          </div>
          <span className="text-xs font-semibold text-secondary px-2.5 py-1 rounded-full bg-secondary-container">
            {products.length} Products Evaluated
          </span>
        </div>

        {/* Responsive Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              {/* Product Header Cards Row */}
              <tr>
                <th className="p-3 w-1/4 text-xs font-bold uppercase tracking-wider text-on-surface-variant bg-surface-container-low rounded-tl-xl">
                  Attributes
                </th>
                {products.map((product) => {
                  const isAdded = Boolean(addedIds[product.id]);
                  return (
                    <th key={product.id} className="p-3 align-top bg-surface-container-low/50">
                      <div className="space-y-2">
                        {/* Image */}
                        <div className="w-full h-32 rounded-lg bg-surface-container-lowest overflow-hidden flex items-center justify-center p-2 border border-outline-variant/30">
                          <img
                            src={product.image_url || "/images/honey.png"}
                            alt={product.name}
                            className="max-h-full max-w-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/images/honey.png";
                            }}
                          />
                        </div>

                        {/* Title */}
                        <span className="font-bold text-sm sm:text-base text-on-surface block leading-snug break-words">
                          {product.name}
                        </span>

                        {/* Price & Rating */}
                        <div className="flex items-center justify-between">
                          <span className="text-base font-bold text-primary">
                            ${product.price.toFixed(2)}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            {product.average_rating ? product.average_rating.toFixed(1) : "4.5"}
                          </span>
                        </div>

                        {/* Add to Cart button */}
                        <button
                          onClick={() => handleAdd(product)}
                          disabled={isAdded}
                          className={`w-full py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            isAdded
                              ? "bg-secondary text-white"
                              : "border border-primary-container text-primary hover:bg-surface-container-low"
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" /> Added
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                            </>
                          )}
                        </button>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {/* Dynamic comparison points */}
              {pointKeys.map((key, rowIdx) => {
                const values = comparisonPoints[key] || [];
                const isEven = rowIdx % 2 === 0;
                return (
                  <tr
                    key={key}
                    className={`border-t border-outline-variant/20 ${
                      isEven ? "bg-surface-container-lowest" : "bg-surface-container-low/40"
                    }`}
                  >
                    <td className="p-3 text-xs sm:text-sm font-semibold text-primary align-top">
                      {key}
                    </td>
                    {products.map((product, colIdx) => (
                      <td key={product.id} className="p-3 text-xs sm:text-sm text-on-surface align-top">
                        {values[colIdx] || "—"}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
