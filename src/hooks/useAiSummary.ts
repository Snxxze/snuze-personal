"use client";

import { useState, useEffect } from "react";
import type { TodoItem, StockItem } from "@/types";

export function useAiSummary(todos: TodoItem[], stocks: StockItem[]) {
  const [aiSummary, setAiSummary] = useState<string>("");
  const [isSummarizing, setIsSummarizing] = useState(false);

  useEffect(() => {
    const cached = localStorage.getItem("snuze_ai_summary_cache");
    if (cached) {
      setAiSummary(cached);
    }
  }, []);

  const generateSummary = async () => {
    if (todos.length === 0) return;
    
    setIsSummarizing(true);
    const active = todos.filter((t) => !t.completed).length;
    const highPriority = todos.filter((t) => !t.completed && t.priority === "high").length;
    const nvda = stocks.find((s) => s.symbol === "NVDA")?.change || 3.2;

    try {
      const res = await fetch("/api/gemini/summarize", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ active, highPriority, nvda }),
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
    } catch (err: any) {
      setTimeout(() => {
        const isRateLimit = err.message === "rate_limit_exceeded";
        const suffix = isRateLimit 
          ? "\n\n*(สรุปข้อมูลออฟไลน์ในเครื่อง — เนื่องจากโควต้า AI ของคุณเกินขีดจำกัด)*" 
          : "";
        const fallbackText = `วันนี้คุณมีงานสำคัญรออยู่ ${active} งาน (เป็นงานด่วนมากถึง ${highPriority} รายการ) ตลาดหุ้นวันนี้ NVDA ทะยานเพิ่มขึ้น ${nvda.toFixed(1)}% อย่างสดใส และมีข่าว AI ล่าสุด 3 เรื่องที่เพิ่งอัปเดต ขอให้เป็นวันที่สงบและมีพลังในการสร้างสรรค์ครับ 🧘‍♂️${suffix}`;
        setAiSummary(fallbackText);
        localStorage.setItem("snuze_ai_summary_cache", fallbackText);
      }, 800);
    } finally {
      setIsSummarizing(false);
    }
  };

  return { aiSummary, isSummarizing, generateSummary };
}

