"use client";

import React from "react";
import { Leaf } from "lucide-react";

interface TextMessageProps {
  text: string;
}

export function TextMessage({ text }: TextMessageProps) {
  return (
    <div className="flex items-start gap-3 max-w-3xl">
      <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
        <Leaf className="w-4 h-4" />
      </div>
      <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl rounded-tl-xs p-4 sm:p-5 shadow-xs text-on-surface">
        <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">{text}</p>
      </div>
    </div>
  );
}
