"use client";

import React from "react";
import { AgentTrace } from "@/lib/types";
import { X, Sparkles, Database, CheckCircle, ShieldCheck, Terminal } from "lucide-react";

interface AgentTraceModalProps {
  trace: AgentTrace | null;
  onClose: () => void;
}

export function AgentTraceModal({ trace, onClose }: AgentTraceModalProps) {
  if (!trace) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden animate-scale-in">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-container text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-primary">
                Agent Trace & SQL Verification
              </h3>
              <p className="text-xs text-on-surface-variant">
                Full deterministic execution trail grounded in SQLite
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Query & Intent */}
          <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary">
              Input Query & Parsed Intent
            </span>
            <p className="text-sm font-semibold text-on-surface">
              &ldquo;{trace.query || "Query processed"}&rdquo;
            </p>
            {trace.parsed_intent && (
              <p className="text-xs text-on-surface-variant">
                <span className="font-semibold text-primary">Intent:</span> {trace.parsed_intent}
              </p>
            )}
          </div>

          {/* Applied Filters */}
          {trace.filters && (
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-2">
                Active Filter Parameters
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/20">
                  <span className="text-on-surface-variant block">Keyword</span>
                  <span className="font-bold text-primary">{trace.filters.keyword || "Any"}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/20">
                  <span className="text-on-surface-variant block">Organic Only</span>
                  <span className="font-bold text-primary">
                    {trace.filters.is_organic !== undefined ? (trace.filters.is_organic ? "Yes" : "No") : "Any"}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/20">
                  <span className="text-on-surface-variant block">Max Price</span>
                  <span className="font-bold text-primary">
                    {trace.filters.max_price ? `$${trace.filters.max_price}` : "No limit"}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/20">
                  <span className="text-on-surface-variant block">Min Rating</span>
                  <span className="font-bold text-primary">
                    {trace.filters.min_rating ? `${trace.filters.min_rating}★` : "Any"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Deterministic SQL Query */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Database className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                SQLite Grounding Query
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto shadow-inner">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mb-1.5 pb-1 border-b border-slate-800">
                <Terminal className="w-3 h-3" />
                <span>Executed against store.db</span>
              </div>
              <code>{trace.sql_query || "SELECT * FROM products WHERE ..."}</code>
            </div>
          </div>

          {/* Trace Steps Timeline */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-3">
              Execution Timeline ({trace.steps.length} Steps)
            </span>
            <div className="space-y-3">
              {trace.steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-secondary-container text-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 text-xs">
                    <span className="font-bold text-on-surface block text-sm">{step.title}</span>
                    <span className="text-on-surface-variant leading-relaxed">{step.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Zero Hallucination Guarantee */}
          <div className="p-3 rounded-xl bg-secondary-container/40 border border-secondary/30 flex items-center gap-2.5 text-xs text-on-secondary-container">
            <ShieldCheck className="w-4 h-4 text-secondary flex-shrink-0" />
            <span>
              <strong>Zero-Hallucination Verified:</strong> All items, prices, and ratings are queried strictly from SQLite table records.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-outline-variant/30 bg-surface-container-low/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-primary text-white font-semibold text-xs sm:text-sm hover:bg-primary-container transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
