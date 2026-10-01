"use client";

import React from "react";
import { Leaf, Sparkles } from "lucide-react";

interface ThinkingMessageProps {
  label?: string;
}

export function ThinkingMessage({ label = "Searching organic catalog…" }: ThinkingMessageProps) {
  return (
    <div className="flex items-start gap-3 w-full max-w-xl animate-fade-in">
      <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
        <Leaf className="w-4 h-4 animate-spin-slow" />
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl rounded-tl-xs p-4 sm:p-5 shadow-xs flex-1">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-secondary animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-secondary">
            CartWise Agent Thinking
          </span>
        </div>

        <p className="text-sm sm:text-base font-semibold text-on-surface mb-3">
          {label}
        </p>

        {/* Pulsing indicator dots & bar */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <span className="text-xs text-on-surface-variant font-medium">
            Filtering database by price, ratings & certifications
          </span>
        </div>
      </div>
    </div>
  );
}
