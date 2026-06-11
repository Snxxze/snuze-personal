"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { StockItem } from "@/types";
import { useStockCalculations } from "@/hooks/useStockCalculations";
import { useData } from "@/providers/DataProvider";

import StockListHeader from "./StockListHeader";
import StockEmptyState from "./StockEmptyState";
import StockForm from "./StockForm";
import StockRow from "./StockRow";
import StockRowDetails from "./StockRowDetails";

interface StockWatchlistProps {
  stocks: StockItem[];
  onAddStock: (symbol: string, shares?: number, avgCost?: number) => void;
  onDeleteStock: (symbol: string) => void;
}

export default function StockWatchlist({ stocks, onAddStock, onDeleteStock }: StockWatchlistProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockItem | null>(null);
  const [expandedSymbol, setExpandedSymbol] = useState<string | null>(null);

  const { usdToThb } = useData();
  const { calculatedStocks } = useStockCalculations(stocks, usdToThb);

  const handleEditClick = (stock: StockItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedStock(stock);
    setShowForm(true);
  };

  const handleSaveStock = (symbol: string, shares: number, avgCost: number) => {
    onAddStock(symbol, shares, avgCost);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-bold text-zen-charcoal tracking-tight">พอร์ตติดตาม</h2>
        <button
          onClick={() => {
            setSelectedStock(null);
            setShowForm(true);
          }}
          className="
            flex items-center text-xs font-semibold
            text-zen-indigo transition-opacity hover:opacity-75 cursor-pointer
          "
        >
          <span className="flex items-center">
            <Plus className="w-3.5 h-3.5 mr-0.5 stroke-[2.5]" />
            เพิ่มหุ้น
          </span>
        </button>
      </div>

      <StockForm
        open={showForm}
        onClose={() => setShowForm(false)}
        selectedStock={selectedStock}
        onSaveStock={handleSaveStock}
        onDeleteStock={onDeleteStock}
        stocks={stocks}
      />

      <div className="bg-zen-white border border-zen-pebble/10 rounded-xl overflow-hidden">
        {calculatedStocks.length > 0 && <StockListHeader />}
        
        {calculatedStocks.length === 0 ? (
          <StockEmptyState onAddClick={() => {
            setSelectedStock(null);
            setShowForm(true);
          }} />
        ) : (
          <div className="divide-y divide-zen-pebble/10">
            <AnimatePresence initial={false}>
              {calculatedStocks.map((stock) => {
                const isExpanded = expandedSymbol === stock.symbol;

                return (
                  <div
                    key={stock.symbol}
                    onClick={() => setExpandedSymbol(isExpanded ? null : stock.symbol)}
                    className="
                      flex flex-col px-4 group relative bg-zen-white cursor-pointer select-none
                      hover:bg-zen-sand/20 transition-colors
                    "
                  >
                    <StockRow stock={stock} />
                    
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0, paddingBottom: 0 }}
                          animate={{ height: "auto", opacity: 1, paddingBottom: 14 }}
                          exit={{ height: 0, opacity: 0, paddingBottom: 0 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <StockRowDetails
                            stock={stock}
                            onEditClick={(e) => handleEditClick(stock, e)}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
