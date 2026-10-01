"use client";

import React from "react";
import { UserChatMessage } from "@/lib/types";

interface UserBubbleProps {
  message: UserChatMessage;
}

export function UserBubble({ message }: UserBubbleProps) {
  return (
    <div className="flex justify-end w-full animate-fade-in">
      <div
        className="max-w-xl sm:max-w-2xl bg-white border border-outline-variant/40 rounded-2xl rounded-br-xs p-4 sm:p-5 shadow-xs"
        style={{ backgroundColor: "rgba(45, 122, 84, 0.08)" }}
      >
        {message.image && (
          <div className="mb-2.5 max-w-[200px] rounded-lg overflow-hidden border border-outline-variant/30">
            <img src={message.image} alt="Uploaded query" className="w-full h-auto object-cover" />
          </div>
        )}
        <p className="text-on-surface text-sm sm:text-base leading-relaxed break-words">
          {message.content}
        </p>
      </div>
    </div>
  );
}
