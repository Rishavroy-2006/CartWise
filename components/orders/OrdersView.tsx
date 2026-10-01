"use client";

import React, { useState, useEffect } from "react";
import { Order } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import {
  Package,
  Calendar,
  CheckCircle,
  Truck,
  ArrowRight,
  Search,
  ShoppingBag,
  RotateCcw,
} from "lucide-react";

export function OrdersView() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "delivered" | "transit">("all");
  const { buyDirectly, setActiveTab } = useCart();
  const [reorderingId, setReorderingId] = useState<number | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
      }
    } catch (e) {
      console.error("Failed to load orders:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleReorder = async (orderId: number) => {
    setReorderingId(orderId);
    await buyDirectly(orderId);
    setReorderingId(null);
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      (o.items && o.items.some(i => i.product_name.toLowerCase().includes(searchQuery.toLowerCase()))) ||
      String(o.id).includes(searchQuery);
    return matchesSearch;
  });

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            Your Orders
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            Track and review your organic grocery deliveries recorded in the database.
          </p>
        </div>

        <button
          onClick={() => setActiveTab("chat")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white text-xs sm:text-sm font-semibold hover:bg-primary-container transition-colors cursor-pointer self-start sm:self-auto"
        >
          <span>Ask Assistant to Shop</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by product name or order number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface-container-lowest border border-outline-variant/60 text-xs sm:text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
              statusFilter === "all"
                ? "bg-primary text-white"
                : "bg-surface-container-lowest border border-outline-variant/60 text-on-surface-variant"
            }`}
          >
            All Orders ({orders.length})
          </button>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="text-center py-16 space-y-3">
          <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs sm:text-sm text-on-surface-variant">Loading orders from database…</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-surface-container-low text-on-surface-variant flex items-center justify-center mx-auto">
            <Package className="w-7 h-7 text-outline" />
          </div>
          <h3 className="text-lg font-bold text-on-surface">No Orders Placed Yet</h3>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Use the chat assistant to discover truthful products from our catalog and place your first order.
          </p>
          <button
            onClick={() => setActiveTab("chat")}
            className="px-5 py-2.5 rounded-full bg-primary text-white text-xs sm:text-sm font-semibold hover:bg-primary-container transition-colors cursor-pointer"
          >
            Browse Products in Chat
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isDelivered = order.status === "delivered";
            const isReordering = reorderingId === order.id;

            return (
              <article
                key={order.id}
                className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 p-5 sm:p-6 shadow-xs hover:border-outline-variant transition-all flex flex-col gap-4"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-surface-container gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-base sm:text-lg text-primary">
                      Order #{order.id}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        isDelivered
                          ? "bg-secondary-container text-on-secondary-container"
                          : "bg-tertiary-fixed text-on-tertiary-fixed"
                      }`}
                    >
                      {isDelivered ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-secondary" /> Delivered
                        </>
                      ) : (
                        <>
                          <Truck className="w-3.5 h-3.5 text-tertiary" /> In Transit • Arriving in 3-5 days
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{order.created_at}</span>
                  </div>
                </div>

                {/* Order Items Breakdown */}
                <div className="space-y-3">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm sm:text-base">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center flex-shrink-0 text-on-surface-variant">
                          <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-bold text-on-surface block leading-tight">{item.product_name}</span>
                          <span className="text-xs text-on-surface-variant">Qty: {item.quantity} (ID: #{item.product_id})</span>
                        </div>
                      </div>
                      <span className="font-bold text-on-surface">${(item.unit_price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Order Footer Actions */}
                <div className="pt-4 border-t border-surface-container flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs text-on-surface-variant">Total</span>
                    <span className="text-base sm:text-lg font-bold text-primary">
                      ${order.total.toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleReorder(order.id)}
                    disabled={isReordering}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-primary-container text-primary font-semibold text-xs sm:text-sm hover:bg-surface-container-low transition-colors cursor-pointer active:scale-95"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{isReordering ? "Processing…" : "Buy Again"}</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
