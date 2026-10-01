"use client";

import React from "react";
import { Sparkles, ArrowRight, Camera, Leaf, Scale, Coffee, Utensils } from "lucide-react";

interface EmptyChatPromptProps {
  onSelectPrompt: (query: string) => void;
}

const SUGGESTIONS = [
  {
    category: "Honey & Sweeteners",
    query: "I want organic honey with 4.5+ rating under $20",
    color: "text-amber-800",
    icon: Leaf,
  },
  {
    category: "Pantry Bundles",
    query: "Find a healthy breakfast under $15",
    color: "text-secondary",
    icon: Utensils,
  },
  {
    category: "Ingredient Deep-Dive",
    query: "Compare steel-cut oats and rolled oats",
    color: "text-primary",
    icon: Scale,
  },
  {
    category: "Wellness & Herbal",
    query: "Which tea is good for sleep?",
    color: "text-emerald-700",
    icon: Coffee,
  },
];

export function EmptyChatPrompt({ onSelectPrompt }: EmptyChatPromptProps) {
  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 py-8 sm:py-12 max-w-4xl mx-auto w-full">
      {/* Welcome Header */}
      <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 text-primary-container shadow-xs mb-4 sm:mb-5">
          <Leaf className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-on-surface tracking-tight mb-2 sm:mb-3">
          Welcome to CartWise
        </h1>
        <p className="text-sm sm:text-lg text-on-surface-variant leading-relaxed">
          Tell me what you want to buy, or upload a photo of a product.
        </p>
      </div>

      {/* Suggested Query Matrix (2x2 Cards matching Stitch 4A) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 w-full mb-8">
        {SUGGESTIONS.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(item.query)}
            className="group text-left p-4 sm:p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 hover:border-primary-container/40 hover:shadow-md transition-all duration-200 flex items-start justify-between cursor-pointer active:scale-99"
          >
            <div className="pr-4 min-w-0">
              <span className={`text-xs font-bold block mb-1 uppercase tracking-wider ${item.color}`}>
                {item.category}
              </span>
              <p className="text-on-surface font-semibold text-xs sm:text-sm group-hover:text-primary transition-colors leading-snug">
                {item.query}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant group-hover:bg-primary group-hover:text-white transition-colors flex-shrink-0 mt-0.5">
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        ))}
      </div>

      {/* Contextual Tip Pill */}
      <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-surface-container-low border border-outline-variant/30 text-on-surface-variant text-xs sm:text-sm text-center">
        <Camera className="w-4 h-4 text-primary flex-shrink-0" />
        <span>Tip: Tap the camera icon in the search bar below to search with any photo or grocery label.</span>
      </div>
    </div>
  );
}
