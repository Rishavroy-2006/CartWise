"use client";

import React from "react";
import { SearchX, ArrowRight } from "lucide-react";

interface EmptyStateMessageProps {
  reason: string;
  suggestions?: string[];
  onSelectSuggestion: (suggestion: string) => void;
}

export function EmptyStateMessage({
  reason,
  suggestions = [],
  onSelectSuggestion,
}: EmptyStateMessageProps) {
  return (
    <div className="flex items-start gap-3 w-full max-w-2xl">
      <div className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
        <SearchX className="w-4 h-4 text-on-surface-variant" />
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl rounded-tl-xs p-4 sm:p-5 shadow-xs text-on-surface space-y-3.5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1">
            No Catalog Matches Found
          </span>
          <p className="text-sm sm:text-base text-on-surface leading-relaxed">{reason}</p>
        </div>

        {suggestions.length > 0 && (
          <div className="pt-2 border-t border-outline-variant/30 space-y-2">
            <span className="text-xs font-semibold text-on-surface-variant block">
              Suggested products available in store:
            </span>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectSuggestion(s)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-outline-variant/40 text-xs sm:text-sm font-medium text-primary hover:border-primary hover:bg-surface-container-low transition-colors cursor-pointer"
                >
                  <span>{s}</span>
                  <ArrowRight className="w-3 h-3 text-secondary" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
