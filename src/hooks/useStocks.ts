"use client"

import { useState, useEffect } from "react";
import type { StockItem } from "@/types";


export const DEFAULT_STOCKS: StockItem[] = [
  { symbol: "NVDA", name: "NVIDIA Corporation", price: 949.50, change: 3.20 },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: 173.88, change: -1.10 },
  { symbol: "AAPL", name: "Apple Inc.", price: 189.98, change: 0.40 },
]

export function useStocks() {
  const [stocks, setStocks] = useState<StockItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("snuze_stocks");
    const initial = saved ? JSON.parse(saved) : DEFAULT_STOCKS;
    setStocks(initial);
  }, []);

  // ฟังก์ชันบันทึก
  const saveStocks = (newStocks: StockItem[]) => {
    setStocks(newStocks);
    localStorage.setItem("snuze_stocks", JSON.stringify(newStocks));
  };

  // handler save
  const addStock = (symbol: string) => {
    const cleanSymbol = symbol.toUpperCase().trim();
    if (!cleanSymbol) return;

    if (stocks.some((s) => s.symbol === cleanSymbol)) return;

    const newStocks: StockItem = {
      symbol: cleanSymbol,
      name: `${cleanSymbol} Ticker Portfolio`,
      price: 100 + Math.random() * 500,
      change: -5 + Math.random() * 10,
    };
    saveStocks([...stocks, newStocks]);
  };

  // handler delete
  const deleteStock = (symbol: string) => {
    const updated = stocks.filter((s) => s.symbol !== symbol)
    saveStocks(updated);
  }

  return { stocks, addStock, deleteStock }
}