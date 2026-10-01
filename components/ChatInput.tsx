"use client";

import React, { useState, useRef } from "react";
import { Camera, ArrowUp, Sparkles, Image as ImageIcon, X } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  onSendImage: (imagePathOrFile: string | File) => void;
  disabled?: boolean;
}

const SAMPLE_TEST_IMAGES = [
  { name: "honey.png", label: "Organic Raw Honey", path: "/images/honey.png", desc: "Clear match (Honey)" },
  { name: "oats.png", label: "Whole Grain Oats", path: "/images/oats.png", desc: "Grains & Cereals" },
  { name: "elephant.png", label: "Savannah Elephant", path: "/images/elephant.png", desc: "Non-Product Test" },
  { name: "avocado_oil.png", label: "Avocado Oil", path: "/images/avocado_oil.png", desc: "Culinary Oil" },
];

export function ChatInput({ onSendMessage, onSendImage, disabled }: ChatInputProps) {
  const [text, setText] = useState("");
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim() || disabled) return;
    onSendMessage(text.trim());
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSendImage(file);
      setShowPhotoModal(false);
    }
  };

  const handleSelectSample = (sample: typeof SAMPLE_TEST_IMAGES[0]) => {
    onSendImage(sample.name);
    setShowPhotoModal(false);
  };

  return (
    <>
      <footer className="sticky bottom-0 z-40 w-full pb-5 pt-3 bg-gradient-to-t from-surface via-surface/95 to-transparent">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <form
            onSubmit={handleSubmit}
            className="relative flex items-center bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-1.5 sm:p-2 pl-3 shadow-md hover:border-outline focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/20 transition-all duration-200"
          >
            {/* Search By Photo Action */}
            <button
              type="button"
              onClick={() => setShowPhotoModal(true)}
              aria-label="Search by photo"
              className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-xl transition-colors flex items-center justify-center flex-shrink-0 cursor-pointer"
              title="Search by photo or grocery label"
            >
              <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Conversational Input */}
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              placeholder="Ask CartWise or search with photo..."
              className="w-full bg-transparent border-none text-on-surface placeholder:text-outline/70 focus:ring-0 px-2 sm:px-3 text-xs sm:text-base outline-none"
            />

            {/* Primary Send Submission */}
            <button
              type="submit"
              disabled={!text.trim() || disabled}
              aria-label="Send message"
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-150 flex-shrink-0 cursor-pointer shadow-xs ${
                text.trim() && !disabled
                  ? "bg-primary text-white hover:bg-primary-container active:scale-95"
                  : "bg-surface-container-high text-on-surface-variant cursor-not-allowed opacity-60"
              }`}
            >
              <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </form>
        </div>
      </footer>

      {/* PHOTO SEARCH MODAL */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-container text-white flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-primary">Shop by Product Image</h3>
                  <p className="text-xs text-on-surface-variant">
                    Upload any photo or try one of the mentor test images
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Custom file upload */}
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 border-2 border-dashed border-outline-variant/60 rounded-xl hover:border-secondary hover:bg-surface-container-low transition-all flex flex-col items-center justify-center gap-1.5 text-on-surface-variant cursor-pointer"
              >
                <ImageIcon className="w-6 h-6 text-primary" />
                <span className="font-semibold text-xs sm:text-sm text-on-surface">
                  Upload image from computer
                </span>
                <span className="text-[11px] text-on-surface-variant">PNG, JPG, WEBP up to 10MB</span>
              </button>
            </div>

            {/* Quick Test Images */}
            <div className="pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-secondary" />
                Quick-Test Mentor Test Images
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                {SAMPLE_TEST_IMAGES.map((sample) => (
                  <button
                    key={sample.name}
                    onClick={() => handleSelectSample(sample)}
                    className="p-2.5 rounded-xl border border-outline-variant/40 hover:border-primary hover:bg-surface-container-low transition-all text-left flex items-center gap-2.5 cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center overflow-hidden flex-shrink-0 p-1">
                      <img
                        src={sample.path}
                        alt={sample.label}
                        className="max-h-full max-w-full object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/images/honey.png";
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-xs text-on-surface block truncate group-hover:text-primary">
                        {sample.label}
                      </span>
                      <span className="text-[10px] text-on-surface-variant block truncate">
                        {sample.desc}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
