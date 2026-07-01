"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import { Sparkles, ClipboardList, TrendingUp, RefreshCw, ArrowRight } from "lucide-react";

import QuickCapture from "@/components/QuickCapture";

import { useData } from "@/providers/DataProvider";
import { useAiSummary } from "@/hooks/useAiSummary";
import { sortTodos } from "@/lib/todo-sort";
import { useStockCalculations } from "@/hooks/useStockCalculations";

function PriorityDot({ priority }: { priority: "high" | "medium" | "low" }) {
  const cls = {
    high: "bg-zen-error",
    medium: "bg-zen-warning",
    low: "bg-zen-pine",
  };
  return (
    <span
      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cls[priority]}`}
    />
  );
}

interface StatCardProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: "indigo" | "pine";
}

function StatCard({ href, icon, label, value, accent = "indigo" }: StatCardProps) {
  const iconBg = accent === "pine" ? "bg-zen-pine/10 text-zen-pine" : "bg-zen-indigo/10 text-zen-indigo";
  return (
    <Link
      href={href}
      className="
        flex flex-col justify-between
        h-[100px] p-4 rounded-2xl
        bg-zen-white border border-zen-pebble/30
        hover:border-zen-indigo/30
        shadow-sm hover:shadow-md
        transition-all duration-200
        group cursor-pointer
      "
    >
      <div className={`p-1.5 ${iconBg} rounded-lg w-fit`}>
        {icon}
      </div>

      <div>
        <span className="text-[11px] font-medium text-zen-slate uppercase tracking-wider block">
          {label}
        </span>

        <span className="text-[15px] font-bold text-zen-charcoal block mt-0.5 leading-tight">
          {value}
        </span>
      </div>
    </Link>
  );
}

// Old parsing code removed - AI summary is now parsed directly from JSON

export default function HomePage() {
  const { todos, addTodo, toggleTodo, addNote, stocks, notes, usdToThb, news } = useData();
  const { aiSummary, isSummarizing, error: aiError, generateSummary } = useAiSummary(todos, stocks, notes, news, usdToThb);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleRefreshClick = async () => {
    if (cooldown > 0 || isSummarizing) return;
    await generateSummary();
    setCooldown(30);
  };

  const pendingTodos = todos.filter((todo) => !todo.completed);
  const displayTodos = sortTodos(pendingTodos);
  
  // Calculate portfolio totals
  const { totalPortfolioValue } = useStockCalculations(stocks, usdToThb);
  
  const dailyReturnUSD = stocks.reduce((sum, s) => {
    if (s.shares && s.shares > 0 && s.price) {
      const changePctFraction = (s.changePct || 0) / 100;
      const priceYesterday = s.price / (1 + changePctFraction);
      return sum + (s.shares * (s.price - priceYesterday));
    }
    return sum;
  }, 0);
  const totalValueYesterday = totalPortfolioValue - dailyReturnUSD;
  const portfolioDailyChangePct = totalValueYesterday > 0 ? (dailyReturnUSD / totalValueYesterday) * 100 : 0;

  return (
    <motion.div
      key="home"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.22 }}
      className="flex flex-col h-full relative"
    >
      <div className="flex-1 overflow-y-auto space-y-5 pb-6">
        <div className="bg-gradient-to-br from-zen-white via-zen-white to-zen-sand/30 border border-zen-pebble/30 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -mr-8 -mt-8" />
          <div className="flex items-start justify-between mb-3 relative z-10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-zen-indigo/10 rounded-lg text-zen-indigo">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[11px] uppercase font-semibold tracking-wider text-zen-charcoal">
                  AI Investment Advisor
                </p>
                <p className="text-[10px] text-zen-slate leading-tight mt-0.5">
                  วิเคราะห์พอร์ตโฟลิโอและแนะนำกลยุทธ์ตามข่าวสารล่าสุด
                </p>
              </div>
            </div>
 
            <button
              onClick={handleRefreshClick}
              disabled={isSummarizing || cooldown > 0 || (stocks.length === 0 && notes.length === 0)}
              className="p-1.5 hover:bg-zen-sand rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group flex items-center gap-1.5"
              aria-label="Refresh AI summary"
            >
              {cooldown > 0 && (
                <span className="text-[9px] font-bold text-zen-indigo bg-zen-indigo/10 px-1.5 py-0.5 rounded-lg select-none animate-pulse">
                  รอ {cooldown}วิ
                </span>
              )}
              <RefreshCw
                className={`w-3.5 h-3.5 text-zen-slate group-hover:text-zen-indigo transition-colors ${
                  isSummarizing ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>
 
          {isSummarizing ? (
            <div className="space-y-2 py-1">
              <div className="h-3 bg-zen-sand rounded-full w-5/6 animate-pulse" />
              <div className="h-3 bg-zen-sand rounded-full w-full animate-pulse" />
              <div className="h-3 bg-zen-sand rounded-full w-3/4 animate-pulse" />
            </div>
          ) : aiError ? (
            <div className="text-center py-4 px-2">
              <p className="text-xs text-zen-error font-medium">{aiError}</p>
              <button
                onClick={generateSummary}
                className="mt-3 text-[10px] bg-zen-indigo/10 text-zen-indigo px-3 py-1.5 rounded-xl font-bold hover:bg-zen-indigo/15 active:scale-95 transition-all cursor-pointer"
              >
                ลองใหม่อีกครั้ง
              </button>
            </div>
          ) : (stocks.length === 0) ? (
            <p className="text-sm leading-relaxed text-zen-slate text-center py-2">
              ยินดีต้อนรับสู่ Snuze ✦ เพิ่มสินทรัพย์เพื่อเริ่มใช้งาน AI วิเคราะห์การลงทุน
            </p>
          ) : !aiSummary ? (
            <div className="text-sm leading-relaxed text-zen-charcoal">
              <span className="text-zen-slate italic block text-center py-2 text-xs">
                กดปุ่มรีเฟรชด้านบนขวา เพื่อเริ่มวิเคราะห์พอร์ตล่าสุดของคุณด้วย AI
              </span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Circular Health Gauge & Analysis */}
              <div className="flex items-center gap-4 bg-zen-sand/20 rounded-2xl p-4 border border-zen-pebble/10">
                <div className="relative flex items-center justify-center w-14 h-14 shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="28" cy="28" r="22" stroke="#E6E6E9" strokeWidth="4.5" fill="transparent" />
                    <circle 
                      cx="28" 
                      cy="28" 
                      r="22" 
                      stroke="#5B6B82" 
                      strokeWidth="4.5" 
                      fill="transparent"
                      strokeDasharray="138" 
                      strokeDashoffset={138 - (138 * Math.min(100, Math.max(0, aiSummary.healthScore || 0))) / 100}
                      strokeLinecap="round" 
                      className="transition-all duration-700 ease-out" 
                    />
                  </svg>
                  <span className="absolute text-xs font-bold text-zen-charcoal">{aiSummary.healthScore}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] font-bold bg-zen-indigo/10 text-zen-indigo px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {aiSummary.healthLabel}
                  </span>
                  <p className="text-[12px] font-medium text-zen-charcoal/85 mt-2 leading-relaxed">
                    {aiSummary.portfolioAnalysis}
                  </p>
                </div>
              </div>

              {/* Diversification Alert Banner */}
              {aiSummary.diversificationAlert && (
                <div className="bg-zen-warning/10 border border-zen-warning/20 rounded-2xl p-3.5 text-[11px] text-zen-warning font-medium leading-relaxed flex items-start gap-2">
                  <span className="select-none text-xs">⚠️</span>
                  <span>{aiSummary.diversificationAlert}</span>
                </div>
              )}

              {/* News Impact Mapping */}
              {aiSummary.newsImpacts && aiSummary.newsImpacts.length > 0 && (
                <div className="space-y-2 pt-1">
                  <h3 className="text-[9px] font-bold text-zen-slate uppercase tracking-wider">
                    ผลกระทบจากข่าวเด่นรอบวัน
                  </h3>
                  <div className="grid gap-2">
                    {aiSummary.newsImpacts.map((item: any, idx: number) => {
                      const badgeColors = {
                        bullish: "bg-zen-pine/10 text-zen-pine border-zen-pine/20",
                        bearish: "bg-zen-error/10 text-zen-error border-zen-error/20",
                        neutral: "bg-zen-slate/10 text-zen-slate border-zen-slate/20"
                      };
                      const dotColors = {
                        bullish: "bg-zen-pine",
                        bearish: "bg-zen-error",
                        neutral: "bg-zen-slate"
                      };
                      const impactLabels = {
                        bullish: "Bullish",
                        bearish: "Bearish",
                        neutral: "Neutral"
                      };
                      
                      const impact = item.impact as keyof typeof badgeColors;
                      const badgeClass = badgeColors[impact] || badgeColors.neutral;
                      const dotClass = dotColors[impact] || dotColors.neutral;
                      const labelText = impactLabels[impact] || impactLabels.neutral;

                      return (
                        <div key={idx} className="bg-zen-white border border-zen-pebble/20 rounded-2xl p-3.5 shadow-sm flex flex-col gap-1.5">
                          <div className="flex flex-wrap justify-between items-center gap-2">
                            <span className="text-xs font-bold text-zen-charcoal">{item.symbol}</span>
                            <span className={`inline-flex items-center gap-1.5 text-[8.5px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${badgeClass}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
                              {labelText}
                            </span>
                          </div>
                          {item.newsTitle && (
                            <span className="text-[9.5px] font-semibold text-zen-slate block whitespace-normal leading-normal mt-0.5">
                              ข่าว: {item.newsTitle}
                            </span>
                          )}
                          <p className="text-[11.5px] text-zen-charcoal font-medium leading-relaxed mt-0.5">
                            {item.reason}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Strategic Rebalancing Cards */}
              {aiSummary.actionableRecommendations && aiSummary.actionableRecommendations.length > 0 && (
                <div className="space-y-2 pt-1">
                  <h3 className="text-[9px] font-bold text-zen-slate uppercase tracking-wider">
                    กลยุทธ์ตามราคาตลาดและต้นทุนของคุณ
                  </h3>
                  <div className="grid gap-2">
                    {aiSummary.actionableRecommendations.map((item: any, idx: number) => {
                      const actionColors = {
                        buy: "bg-zen-pine/15 text-zen-pine border-zen-pine/25",
                        sell: "bg-zen-error/15 text-zen-error border-zen-error/25",
                        hold: "bg-zen-indigo/15 text-zen-indigo border-zen-indigo/25"
                      };
                      const actionLabels = {
                        buy: "ซื้อสะสม",
                        sell: "พิจารณาขาย",
                        hold: "ถือครองต่อ"
                      };
                      return (
                        <div key={idx} className="bg-zen-white border border-zen-pebble/20 rounded-2xl p-3.5 shadow-sm flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-zen-charcoal">{item.symbol}</span>
                              <span className={`text-[8.5px] font-bold uppercase px-2 py-0.5 rounded-lg border ${actionColors[item.action as keyof typeof actionColors] || actionColors.hold}`}>
                                {actionLabels[item.action as keyof typeof actionLabels] || actionLabels.hold}
                              </span>
                            </div>
                            <p className="text-[11px] text-zen-slate font-semibold leading-relaxed mt-1.5">
                              {item.tip}
                            </p>
                          </div>
                          
                          <Link
                            href="/assets"
                            className="px-3.5 py-2.5 bg-zen-sand/40 hover:bg-zen-sand/70 text-zen-indigo text-[10px] font-bold rounded-xl border border-zen-pebble/10 shrink-0 cursor-pointer transition-all active:scale-95 shadow-sm"
                          >
                            ซื้อ-ขาย
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <QuickCapture onAddTodo={addTodo} onAddNote={addNote} />

        <div className="grid grid-cols-2 gap-3">
          <StatCard
            href="/todo"
            label="สิ่งที่ต้องทำ"
            value={`${pendingTodos.length} งานค้าง`}
            icon={<ClipboardList className="w-4 h-4" />}
            accent="indigo"
          />
          <Link
            href="/assets"
            className="
              flex flex-col justify-between
              h-[100px] p-4 rounded-2xl
              bg-zen-white border border-zen-pebble/30
              hover:border-zen-indigo/30
              shadow-sm hover:shadow-md
              transition-all duration-200
              group cursor-pointer
            "
          >
            <div className="flex items-center justify-between">
              <div className="p-1.5 bg-zen-pine/10 text-zen-pine rounded-lg w-fit">
                <TrendingUp className="w-4 h-4" />
              </div>
              {totalPortfolioValue > 0 && (
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                  dailyReturnUSD >= 0 ? "bg-zen-pine/10 text-zen-pine" : "bg-zen-error/10 text-zen-error"
                }`}>
                  {dailyReturnUSD >= 0 ? "+" : ""}{portfolioDailyChangePct.toFixed(2)}%
                </span>
              )}
            </div>

            <div>
              <span className="text-[10px] font-semibold text-zen-slate uppercase tracking-wider block">
                พอร์ตการลงทุน
              </span>

              <div className="flex items-baseline gap-1 mt-0.5 min-w-0">
                <span className="text-[14px] font-bold text-zen-charcoal leading-tight truncate">
                  ฿{Math.round(totalPortfolioValue * usdToThb).toLocaleString()}
                </span>
                {totalPortfolioValue > 0 && (
                  <span className={`text-[9px] font-bold shrink-0 ${
                    dailyReturnUSD >= 0 ? "text-zen-pine" : "text-zen-error"
                  }`}>
                    ({dailyReturnUSD >= 0 ? "+" : ""}฿{Math.abs(Math.round(dailyReturnUSD * usdToThb)).toLocaleString()})
                  </span>
                )}
              </div>
            </div>
          </Link>
        </div>

        <div className="bg-zen-white border border-zen-pebble/30 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-4 pt-4 pb-3">
            <h2 className="text-sm font-semibold text-zen-charcoal">งานสำคัญวันนี้</h2>
            <Link
              href="/todo"
              className="flex items-center gap-0.5 text-[11px] text-zen-indigo font-medium hover:underline cursor-pointer"
            >
              ดูทั้งหมด
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-zen-pebble/10">
            {displayTodos.length === 0 ? (
              <div className="text-center py-6 text-xs text-zen-slate/50 px-4">
                ยอดเยี่ยม — ไม่มีงานค้างในขณะนี้
              </div>
            ) : (
              displayTodos.map((todo) => (
                <button
                  key={todo.id}
                  onClick={() => toggleTodo(todo.id)}
                  className="
                    w-full flex items-center gap-3
                    px-4 py-3
                    hover:bg-zen-sand/50
                    transition-colors cursor-pointer text-left
                    group
                  "
                >
                  <span
                    className="
                      w-4 h-4 rounded border border-zen-pebble
                      flex items-center justify-center flex-shrink-0
                      group-hover:border-zen-indigo transition-colors
                    "
                  />
                  <PriorityDot priority={todo.priority} />
                  <span className="text-sm text-zen-charcoal truncate font-medium flex-1 text-left">
                    {todo.text}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
