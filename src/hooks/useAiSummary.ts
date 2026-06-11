"use client";

import { useState, useEffect } from "react";
import type { TodoItem, StockItem, NoteItem } from "@/types";
import { MOCK_NEWS } from "@/lib/mock-data";

export function useAiSummary(todos: TodoItem[], stocks: StockItem[], notes: NoteItem[], usdToThb: number) {
  const [aiSummary, setAiSummary] = useState<string>("");
  const [isSummarizing, setIsSummarizing] = useState(false);

  useEffect(() => {
    const cached = localStorage.getItem("snuze_ai_summary_cache");
    if (cached) {
      setAiSummary(cached);
    }
  }, []);

  const generateSummary = async () => {
    if (todos.length === 0 && stocks.length === 0 && notes.length === 0) return;
    
    setIsSummarizing(true);
    
    const stocksWithHoldings = stocks
      .filter((s) => typeof s.shares === "number" && s.shares > 0)
      .map((s) => ({
        symbol: s.symbol,
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

    const recentNotes = [...notes]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3)
      .map((n) => ({
        title: n.title || "",
        content: n.content || "",
      }));

    const news = MOCK_NEWS.map((item) => `- [${item.source}] ${item.title}`).join("\n");

    try {
      const res = await fetch("/api/gemini/summarize", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stocksWithHoldings,
          recentNotes,
          news,
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
        localStorage.setItem("snuze_ai_summary_cache", data.summary);
      } else {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "AI Summary API request failed");
      }
    } catch (err) {
      setTimeout(() => {
        const isRateLimit = err instanceof Error && err.message === "rate_limit_exceeded";
        const suffix = isRateLimit 
          ? "\n\n*(สรุปข้อมูลออฟไลน์ในเครื่อง — เนื่องจากโควต้า AI ของคุณเกินขีดจำกัด)*" 
          : "";
        
        const portfolioValueTHB = totalValue * usdToThb;
        const totalProfitLossTHB = totalProfitLoss * usdToThb;
        const portfolioText = portfolioValueTHB > 0
          ? `พอร์ตรวม: ฿${Math.round(portfolioValueTHB).toLocaleString()} (ผลตอบแทนสะสม: ${totalProfitLossTHB >= 0 ? "+" : ""}฿${Math.round(totalProfitLossTHB).toLocaleString()}, ${totalProfitLossPct >= 0 ? "+" : ""}${totalProfitLossPct.toFixed(2)}%)`
          : "ไม่มีข้อมูลมูลค่าพอร์ตการลงทุนในขณะนี้";

        let highlightsText = "- ไม่มีหุ้นที่ถือครองในขณะนี้";
        if (stocksWithHoldings.length > 0) {
          const sorted = [...stocksWithHoldings].sort((a, b) => b.changePct - a.changePct);
          const topG = sorted[0];
          const topL = sorted[sorted.length - 1];
          
          let highlights = "";
          if (topG) {
            const label = topG.changePct >= 0 ? "บวกสูงสุด" : "ลบต่ำสุด";
            highlights += `- ตัวเด่นฝั่ง${label}: ${topG.symbol} ${topG.changePct >= 0 ? "+" : ""}${topG.changePct.toFixed(2)}%\n`;
          }
          if (topL && topL.symbol !== topG.symbol) {
            if (topL.changePct < 0) {
              highlights += `- ตัวเด่นฝั่งลบสูงสุด: ${topL.symbol} ${topL.changePct.toFixed(2)}%\n`;
            } else {
              highlights += `- ตัวเด่นฝั่งลบสูงสุด: ไม่มีหุ้นติดลบในพอร์ตวันนี้\n`;
            }
          } else if (stocksWithHoldings.length === 1) {
            if (topG.changePct >= 0) {
              highlights += `- ตัวเด่นฝั่งลบสูงสุด: ไม่มีหุ้นติดลบในพอร์ตวันนี้\n`;
            }
          }
          highlightsText = highlights.trim();
        }

        const noteFocusText = recentNotes.length > 0
          ? recentNotes.map((n) => `- ${n.title ? n.title + ": " : ""}${n.content.substring(0, 50)}...`).join("\n")
          : "- ไม่มีบันทึกโน้ตย่อล่าสุด";

        const fallbackText = `🌱 **บทวิเคราะห์พอร์ตโฟลิโอ**
${portfolioText}

💡 **ประเมินแนวคิดการลงทุน**
${noteFocusText}

🎯 **การประเมินความเสี่ยงและคำแนะนำ**
[บทวิเคราะห์ข่าวสารจำลองออฟไลน์] แนะนำติดตามข่าวสารเศรษฐกิจอย่างสม่ำเสมอ โดยเฉพาะประเด็นดอกเบี้ยและนวัตกรรมเทคโนโลยีของบริษัทขนาดใหญ่ เพื่อปรับสมดุลพอร์ตอย่างระมัดระวัง

📈 **ความเคลื่อนไหวรายตัว**
${highlightsText}${suffix}`;

        setAiSummary(fallbackText);
        localStorage.setItem("snuze_ai_summary_cache", fallbackText);
      }, 800);
      
    } finally {
      setIsSummarizing(false);
    }
  };

  return { aiSummary, isSummarizing, generateSummary };
}

