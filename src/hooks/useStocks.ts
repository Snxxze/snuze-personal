"use client"

import { useState, useEffect } from "react";
import type { StockItem } from "@/types";
import { safeParse } from "@/lib/sheets-sanitize";
import { apiFetch } from "@/lib/api";

export const DEFAULT_STOCKS: StockItem[] = [
  { symbol: "NVDA", name: "NVIDIA Corporation", price: 949.50, changePct: 3.20 },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: 173.88, changePct: -1.10 },
  { symbol: "AAPL", name: "Apple Inc.", price: 189.98, changePct: 0.40 },
]

async function syncStocksToSheets(stocks: StockItem[], signal?: AbortSignal) {
  try {
    await apiFetch("/api/sheets/stocks", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ stocks }),
      signal,
    });
  } catch (error) {
    console.warn("Background stocks sync failed:", error)
  }
}

export function useStocks() {
  const [stocks, setStocks] = useState<StockItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("snuze_stocks");
      return safeParse<StockItem[]>(saved, DEFAULT_STOCKS);
    }
    return DEFAULT_STOCKS;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLatest = async (signal?: AbortSignal) => {
    try {
      const res = await apiFetch("/api/sheets/stocks", { signal });
      if (res.ok) {
        const data = await res.json();
        if (data.status === "success" && data.stocks) {
          setError(null);
          if (data.stocks.length > 0) {
            setStocks(data.stocks);
            localStorage.setItem("snuze_stocks", JSON.stringify(data.stocks));
          }
        }
      } else {
        setError("ไม่สามารถซิงค์ข้อมูลกับ Google Sheets ได้");
      }
    } catch (err) {
      const errorName = err instanceof Error ? err.name : "";
      if (errorName !== "AbortError") {
        setError("เครือข่ายขัดข้อง — ไม่สามารถติดต่อเซิร์ฟเวอร์ได้");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    Promise.resolve().then(() => fetchLatest(controller.signal));

    return () => {
      controller.abort();
    }
  }, []);

  const saveStocks = (newStocksList: StockItem[]) => {
    setStocks(newStocksList);
    localStorage.setItem("snuze_stocks", JSON.stringify(newStocksList));
    syncStocksToSheets(newStocksList);
  };

  const addStock = (symbol: string, shares?: number, avgCost?: number) => {
    const cleanSymbol = symbol.toUpperCase().trim();
    if (!cleanSymbol) return;

    const existingIdx = stocks.findIndex((s) => s.symbol === cleanSymbol);
    if (existingIdx > -1) {
      const updated = [...stocks];
      updated[existingIdx] = {
        ...updated[existingIdx],
        shares: shares || 0,
        avgCost: avgCost || 0,
      };
      saveStocks(updated);
      return;
    }

    const newStock: StockItem = {
      symbol: cleanSymbol,
      name: `${cleanSymbol} Ticker Portfolio`,
      price: 0,
      changePct: 0,
      shares: shares || 0,
      avgCost: avgCost || 0,
    };
    saveStocks([...stocks, newStock]);
  };

  const deleteStock = (symbol: string) => {
    const updated = stocks.filter((s) => s.symbol !== symbol)
    saveStocks(updated);
  }

  return { stocks, isLoading, error, addStock, deleteStock, refetch: () => fetchLatest() }
}