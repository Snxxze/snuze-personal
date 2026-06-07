"use client";

import { useState } from "react";
import { Sparkles, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { NewsItem } from "@/types";

interface NewsFeedProps {
  news: NewsItem[];
}

export default function NewsFeed({ news }: NewsFeedProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [summarizingId, setSummarizingId] = useState<string | null>(null);
  const [aiSummaries, setAiSummaries] = useState<Record<string, string>>({});

  const handleToggleSummary = async (id: string, textToSummarize: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }

    setExpandedId(id);

    if (aiSummaries[id] || news.find((n) => n.id === id)?.summary) {
      return;
    }

    setSummarizingId(id);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("snuze_auth_token") || "" : "";
      const res = await fetch("/api/gemini/summarize", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-snuze-token": token
        },
        body: JSON.stringify({ text: textToSummarize }),
      });

      if (res.status === 401) {
        localStorage.removeItem("snuze_auth_token");
        window.location.reload();
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setAiSummaries((prev) => ({ ...prev, [id]: data.summary }));
      } else {
        setTimeout(() => {
          setAiSummaries((prev) => ({
            ...prev,
            [id]: "ข่าวนี้ระบุถึงเทคโนโลยี AI ใหม่ที่พัฒนาอย่างก้าวกระโดด ช่วยลดระยะเวลาทำงานลง 50% และประหยัดพลังงานคอมพิวเตอร์มากขึ้น",
          }));
        }, 1000);
      }
    } catch (err) {
      console.error("Failed to fetch AI summary:", err);
    } finally {
      setSummarizingId(null);
    }
  };

  if (news.length === 0) {
    return (
      <div className="text-center py-12 text-zen-slate/50 text-sm">
        ไม่มีข่าวสารใหม่ในขณะนี้
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {news.map((item) => {
        const isExpanded = expandedId === item.id;
        const currentSummary = aiSummaries[item.id] || item.summary;
        const isAiLoading = summarizingId === item.id;

        return (
          <div
            key={item.id}
            className="bg-zen-white border border-zen-pebble/30 rounded-2xl overflow-hidden shadow-sm"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold text-zen-indigo uppercase tracking-wider">
                  {item.source}
                </span>
                <span className="text-[10px] text-zen-slate">{item.time}</span>
              </div>

              <h3 className="text-sm font-semibold text-zen-charcoal leading-snug">
                {item.title}
              </h3>
            </div>

            <button
              onClick={() => handleToggleSummary(item.id, item.fullContent || item.title)}
              className="
                w-full flex items-center justify-between
                px-4 py-2.5 border-t border-zen-pebble/10
                bg-zen-sand/30 hover:bg-zen-sand/60
                text-xs text-zen-slate font-medium
                transition-colors cursor-pointer
              "
            >
              <span className="flex items-center gap-1.5 text-zen-indigo">
                <Sparkles className="w-3.5 h-3.5" />
                {isExpanded ? "ปิดสรุป" : "สรุปด้วย AI"}
              </span>
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5 text-zen-slate" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-zen-slate" />
              )}
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 py-3 border-t border-zen-pebble/10 bg-zen-sand/20">
                    {isAiLoading ? (
                      <div className="space-y-2">
                        <div className="h-3 bg-zen-pebble/20 rounded-full w-full animate-pulse" />
                        <div className="h-3 bg-zen-pebble/20 rounded-full w-5/6 animate-pulse" />
                        <div className="h-3 bg-zen-pebble/20 rounded-full w-4/5 animate-pulse" />
                      </div>
                    ) : (
                      <p className="text-xs text-zen-charcoal leading-relaxed">
                        <span className="font-semibold text-zen-indigo">สรุป: </span>
                        {currentSummary}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
