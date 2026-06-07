"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, Plus, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { StockItem } from "@/types";

interface StockWatchlistProps {
  stocks: StockItem[];
  onAddStock: (symbol: string) => void;
  onDeleteStock: (symbol: string) => void;
}

export default function StockWatchlist({ stocks, onAddStock, onDeleteStock }: StockWatchlistProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSymbol, setNewSymbol] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymbol.trim()) return;
    onAddStock(newSymbol.trim().toUpperCase());
    setNewSymbol("");
    setShowAddForm(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zen-charcoal">พอร์ตติดตาม</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="
            flex items-center gap-1.5 text-xs font-medium
            text-zen-indigo bg-zen-indigo/8 hover:bg-zen-indigo/15
            px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer
          "
        >
          {showAddForm ? (
            <><X className="w-3 h-3" /> ยกเลิก</>
          ) : (
            <><Plus className="w-3 h-3" /> เพิ่มหุ้น</>
          )}
        </button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="flex gap-2 overflow-hidden"
          >
            <input
              type="text"
              required
              autoFocus
              placeholder="เช่น TSLA, BTC, AAPL..."
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value)}
              className="
                flex-1 text-sm bg-zen-sand border border-zen-pebble/30
                rounded-xl px-3 py-2 text-zen-charcoal uppercase
                placeholder-zen-slate/40 focus:outline-none focus:border-zen-indigo/40
                transition-colors
              "
            />
            <button
              type="submit"
              className="
                bg-zen-indigo text-zen-white text-xs font-medium
                px-4 py-2 rounded-xl cursor-pointer
                hover:bg-zen-indigo/90 transition-colors
              "
            >
              เพิ่ม
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="bg-zen-white border border-zen-pebble/30 rounded-2xl overflow-hidden shadow-sm">
        {stocks.length === 0 ? (
          <div className="py-10 text-center text-sm text-zen-slate/50">
            ยังไม่มีหุ้นในพอร์ต — กดเพิ่มหุ้นด้านบน
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {stocks.map((stock, idx) => {
              const isPositive = stock.change >= 0;
              return (
                <motion.div
                  key={stock.symbol}
                  layout
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.18 }}
                  className={`
                    flex items-center justify-between
                    px-4 py-3.5 group
                    hover:bg-zen-sand/40 transition-colors
                    ${idx !== stocks.length - 1 ? "border-b border-zen-pebble/15" : ""}
                  `}
                >
                  <div className="min-w-0">
                    <span className="font-bold text-sm text-zen-charcoal tracking-wide">
                      {stock.symbol}
                    </span>
                    <span className="text-[11px] text-zen-slate block truncate max-w-[130px]">
                      {stock.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="font-semibold text-sm text-zen-charcoal block">
                        ${stock.price.toFixed(2)}
                      </span>
                      <span
                        className={`
                          text-xs font-semibold flex items-center gap-0.5 justify-end
                          ${isPositive ? "text-zen-pine" : "text-zen-error"}
                        `}
                      >
                        {isPositive ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {isPositive ? "+" : ""}
                        {stock.change.toFixed(2)}%
                      </span>
                    </div>

                    <button
                      onClick={() => onDeleteStock(stock.symbol)}
                      aria-label={`Remove ${stock.symbol}`}
                      className="
                        opacity-0 group-hover:opacity-100
                        p-1.5 rounded-lg
                        text-zen-slate/40 hover:text-zen-error hover:bg-red-50
                        transition-all cursor-pointer
                      "
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
