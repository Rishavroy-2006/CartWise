"use client";

import React from "react";
import { HelpCircle, ArrowRight } from "lucide-react";

interface ClarifyMessageProps {
  question: string;
  options: string[];
  onSelectOption: (option: string) => void;
}

export function ClarifyMessage({ question, options, onSelectOption }: ClarifyMessageProps) {
  return (
    <div className="flex items-start gap-3 w-full max-w-2xl">
      <div className="w-8 h-8 rounded-full bg-tertiary text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
        <HelpCircle className="w-4 h-4" />
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl rounded-tl-xs p-4 sm:p-5 shadow-xs text-on-surface space-y-3.5">
        <p className="text-sm sm:text-base font-semibold text-primary leading-relaxed">
          {question}
        </p>

        {/* Interactive Option Pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          {options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => onSelectOption(opt)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-primary-container text-primary font-semibold text-xs sm:text-sm bg-surface-container-lowest hover:bg-surface-container-low hover:border-primary transition-all duration-150 active:scale-95 cursor-pointer shadow-xs"
            >
              <span>{opt}</span>
              <ArrowRight className="w-3.5 h-3.5 text-secondary" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
