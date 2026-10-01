"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, Plus, Sparkles, User, Menu, X, Leaf, ClipboardList } from "lucide-react";

interface NavbarProps {
  onNewChat: () => void;
  onOpenTrace?: () => void;
}

export function Navbar({ onNewChat, onOpenTrace }: NavbarProps) {
  const { cartCount, setIsCartOpen, activeTab, setActiveTab } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-surface-container-lowest border-b border-outline-variant/30 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
        {/* Brand & Primary Nav */}
        <div className="flex items-center gap-6 sm:gap-10">
          <button
            onClick={() => {
              setActiveTab("chat");
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2.5 text-primary text-left cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-primary-container text-surface-container-lowest flex items-center justify-center transition-transform group-hover:scale-105">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-primary tracking-tight">CartWise</span>
          </button>

          {/* Desktop Destination Links */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => setActiveTab("chat")}
              className={`pb-1 font-semibold text-sm transition-colors cursor-pointer ${
                activeTab === "chat"
                  ? "text-primary border-b-2 border-primary"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`pb-1 font-semibold text-sm transition-colors cursor-pointer ${
                activeTab === "orders"
                  ? "text-primary border-b-2 border-primary"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              Orders
            </button>
          </nav>
        </div>

        {/* Trailing Action Cluster */}
        <div className="flex items-center gap-2 sm:gap-3.5">
          {/* New chat Action */}
          <button
            onClick={onNewChat}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-full border border-primary-container text-primary font-semibold text-xs sm:text-sm hover:bg-surface-container-low transition-colors duration-150 active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New chat</span>
          </button>

          {/* Agent Trace Action */}
          <button
            onClick={onOpenTrace}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-outline-variant/50 text-on-surface-variant font-semibold text-xs sm:text-sm hover:bg-surface-container-low transition-colors duration-150 active:scale-[0.98] cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span>Agent Trace</span>
          </button>

          <div className="hidden sm:block h-5 w-px bg-outline-variant/40 mx-1" />

          {/* Cart Action with Item Counter */}
          <button
            onClick={() => setIsCartOpen(true)}
            aria-label="Shopping Cart"
            className="relative p-2 rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors duration-150 cursor-pointer"
          >
            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[11px] font-bold text-white bg-tertiary-container rounded-full">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile menu hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full text-on-surface-variant hover:text-primary cursor-pointer"
            aria-label="Toggle navigation drawer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Account Profile Silhouette */}
          <button
            aria-label="User Account"
            className="hidden sm:block p-1 rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors duration-150 cursor-pointer"
          >
            <User className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer / Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-outline-variant/30 bg-surface-container-lowest px-4 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setActiveTab("chat");
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2 p-3 rounded-xl font-semibold text-sm ${
                activeTab === "chat" ? "bg-primary-container text-white" : "bg-surface-container-low text-on-surface"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Chat Assistant
            </button>
            <button
              onClick={() => {
                setActiveTab("orders");
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2 p-3 rounded-xl font-semibold text-sm ${
                activeTab === "orders" ? "bg-primary-container text-white" : "bg-surface-container-low text-on-surface"
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              Your Orders
            </button>
          </div>
          <button
            onClick={() => {
              onOpenTrace?.();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-surface-container-low text-on-surface text-sm font-semibold"
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
              <span>Inspect Agent Trace</span>
            </div>
            <span className="text-xs text-on-surface-variant">Live</span>
          </button>
        </div>
      )}
    </header>
  );
}
