"use client";

import { useState, useEffect } from "react";
import type { TodoItem, StockItem, NoteItem, NewsItem } from "@/types";

export interface AiSummaryData {
  healthScore: number;
  healthLabel: string;
  portfolioAnalysis: string;
  diversificationAlert: string;
  newsImpacts: {
    symbol: string;
    newsTitle: string;
    impact: "bullish" | "bearish" | "neutral";
    reason: string;
  }[];
  actionableRecommendations: {
    symbol: string;
    action: "buy" | "sell" | "hold";
    tip: string;
  }[];
}

export function useAiSummary(todos: TodoItem[], stocks: StockItem[], notes: NoteItem[], news: NewsItem[], usdToThb: number) {
  const [aiSummary, setAiSummary] = useState<AiSummaryData | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cachedStr = localStorage.getItem("snuze_ai_summary_cache");
    if (cachedStr) {
      try {
        const cachedObj = JSON.parse(cachedStr);
        // Check if cache format is valid and within 12 hours (12 * 60 * 60 * 1000 = 43200000 ms)
        const cacheAge = Date.now() - (cachedObj.timestamp || 0);
        const isExpired = cacheAge > 12 * 60 * 60 * 1000;
        
        if (isExpired) {
          localStorage.removeItem("snuze_ai_summary_cache");
          setAiSummary(null);
        } else {
          setAiSummary(cachedObj.data);
        }
      } catch (err) {
        localStorage.removeItem("snuze_ai_summary_cache");
      }
    }
  }, []);

  const generateSummary = async () => {
    if (todos.length === 0 && stocks.length === 0 && notes.length === 0) return;
    
    setIsSummarizing(true);
    setError(null);
    
    const stocksWithHoldings = stocks
      .filter((s) => typeof s.shares === "number" && s.shares > 0)
      .map((s) => ({
        symbol: s.symbol,
        name: s.name || "",
        shares: s.shares || 0,
        price: s.price || 0,
        avgCost: s.avgCost || 0,
        changePct: s.changePct || 0,
      }));

    // Portfolio performance metrics
    const totalCost = stocks.reduce((sum, s) => sum + (s.shares && s.shares > 0 ? s.shares * (s.avgCost || 0) : 0), 0);
    const totalValue = stocks.reduce((sum, s) => sum + (s.shares && s.shares > 0 ? s.shares * s.price : 0), 0);
    const totalProfitLoss = totalValue - totalCost;
    const totalProfitLossPct = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0;

    const dailyReturnUSD = stocks.reduce((sum, s) => {
      if (s.shares && s.shares > 0 && s.price) {
        const changePctFraction = (s.changePct || 0) / 100;
        const priceYesterday = s.price / (1 + changePctFraction);
        return sum + (s.shares * (s.price - priceYesterday));
      }
      return sum;
    }, 0);
    const totalValueYesterday = totalValue - dailyReturnUSD;
    const portfolioDailyChangePct = totalValueYesterday > 0 ? (dailyReturnUSD / totalValueYesterday) * 100 : 0;

    const newsText = news.map((item) => `- [${item.source}] ${item.title}`).join("\n");

    try {
      const res = await fetch("/api/gemini/summarize", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stocksWithHoldings,
          news: newsText,
          portfolioSummary: {
            totalValueUSD: totalValue,
            totalValueTHB: totalValue * usdToThb,
            dailyReturnUSD,
            dailyReturnTHB: dailyReturnUSD * usdToThb,
            portfolioDailyChangePct,
            totalProfitLossUSD: totalProfitLoss,
            totalProfitLossTHB: totalProfitLoss * usdToThb,
            totalProfitLossPct,
          }
        }),
      });

      if (res.status === 401) {
        window.location.reload();
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setAiSummary(data.summary);
        setError(null);
        
        const cachePayload = {
          data: data.summary,
          timestamp: Date.now()
        };
        localStorage.setItem("snuze_ai_summary_cache", JSON.stringify(cachePayload));
      } else {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "การสรุปผลจาก AI ขัดข้อง");
      }
    } catch (err) {
      console.error("useAiSummary error:", err);
      const errMsg = err instanceof Error ? err.message : "ไม่สามารถเชื่อมต่อเครือข่ายได้";
      setError(errMsg);
      setAiSummary(null);
      localStorage.removeItem("snuze_ai_summary_cache");
    } finally {
      setIsSummarizing(false);
    }
  };

  return { aiSummary, isSummarizing, error, generateSummary };
}