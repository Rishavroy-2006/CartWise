"use client";

import React from "react";
import { Product } from "@/lib/types";
import { ProductsMessage } from "./ProductsMessage";
import { Camera, Sparkles, AlertCircle, Tag, Leaf } from "lucide-react";

interface ImageAnalysisMessageProps {
  tags: string[];
  description: string;
  matchedProducts?: Product[];
  uploadedImage?: string;
  onOpenTrace?: (trace: any) => void;
}

export function ImageAnalysisMessage({
  tags,
  description,
  matchedProducts = [],
  uploadedImage,
  onOpenTrace,
}: ImageAnalysisMessageProps) {
  const isNonProduct = matchedProducts.length === 0;

  return (
    <div className="flex items-start gap-3 w-full max-w-4xl">
      <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
        <Camera className="w-4 h-4" />
      </div>

      <div className="flex-1 space-y-4">
        {/* Analysis Card */}
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl rounded-tl-xs p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            {/* Uploaded Thumbnail Preview */}
            {uploadedImage && (
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-surface-container-low border border-outline-variant/40 flex-shrink-0 flex items-center justify-center p-1">
                <img
                  src={uploadedImage}
                  alt="Uploaded search item"
                  className="max-h-full max-w-full object-cover rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/images/honey.png";
                  }}
                />
                <span className="absolute bottom-1 right-1 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> Photo
                </span>
              </div>
            )}

            {/* Analysis Text & Tags */}
            <div className="flex-1 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Visual Intelligence Analysis
                </span>
              </div>

              <p className="text-sm sm:text-base text-on-surface font-medium leading-relaxed">
                {description}
              </p>

              {/* Tag Pills */}
              {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-container-low text-on-surface-variant border border-outline-variant/30"
                    >
                      <Tag className="w-3 h-3 text-secondary" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Non-product warning banner */}
          {isNonProduct && (
            <div className="mt-4 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-start gap-3 text-amber-900 dark:text-amber-200 text-xs sm:text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">Not an organic grocery item</span>
                <span>
                  Our visual catalog focuses on wholesome foods, cooking oils, grains, and pantry goods. Try uploading a photo of a honey jar, cereal box, or ingredient label.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Matched Products List / Grid */}
        {matchedProducts.length > 0 && (
          <div className="pt-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2 px-1 flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5 text-secondary" />
              Verified Catalog Matches ({matchedProducts.length})
            </h4>
            <ProductsMessage products={matchedProducts} onOpenTrace={onOpenTrace} />
          </div>
        )}
      </div>
    </div>
  );
}
