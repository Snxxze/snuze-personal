"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { Sparkles, ClipboardList, TrendingUp, RefreshCw, ArrowRight, Sprout, Target, Lightbulb } from "lucide-react";

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

interface BriefSection {
  type: "greeting" | "focus" | "finance" | "notes";
  title: string;
  emoji: string;
  content: string;
  items: string[];
}

function parseDailyBrief(text: string): BriefSection[] {
  if (!text) return [];
  
  const sections: BriefSection[] = [];
  const lines = text.split("\n");
  
  let currentSection: BriefSection | null = null;
  
  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    
    const isHeading = line.startsWith("🌱") || line.startsWith("🎯") || line.startsWith("📈") || line.startsWith("📊") || line.startsWith("💡");
    
    if (isHeading) {
      if (currentSection) {
        sections.push(currentSection);
      }
      
      let type: BriefSection["type"] = "greeting";
      let emoji = "";
      if (line.includes("🌱")) {
        type = "greeting";
        emoji = "🌱";
      } else if (line.includes("🎯")) {
        type = "focus";
        emoji = "🎯";
      } else if (line.includes("📈") || line.includes("📊")) {
        type = "finance";
        emoji = "📈";
      } else if (line.includes("💡")) {
        type = "notes";
        emoji = "💡";
      }
      
      const title = line.replace(/[🌱🎯📈📊💡]/g, "").replace(/\*\*/g, "").trim();
      
      currentSection = {
        type,
        title,
        emoji,
        content: "",
        items: []
      };
    } else {
      if (currentSection) {
        if (line.startsWith("- ")) {
          currentSection.items.push(line.substring(2).trim());
        } else {
          if (currentSection.content) {
            currentSection.content += "\n" + line;
          } else {
            currentSection.content = line;
          }
        }
      } else {
        currentSection = {
          type: "greeting",
          title: "บทวิเคราะห์พอร์ตโฟลิโอ",
          emoji: "🌱",
          content: line,
          items: []
        };
      }
    }
  }
  
  if (currentSection) {
    sections.push(currentSection);
  }
  
  return sections;
}

function renderParsedBrief(text: string) {
  const sections = parseDailyBrief(text);
  if (sections.length === 0) return null;

  const SectionIcon = {
    greeting: Sprout,
    focus: Target,
    finance: TrendingUp,
    notes: Lightbulb,
  };

  interface ThemeConfig {
    iconBg: string;
    border?: string;
    bullet?: string;
    cardBg?: string;
  }

  const SectionTheme: Record<BriefSection["type"], ThemeConfig> = {
    greeting: {
      iconBg: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
      border: "border-emerald-400/30 bg-emerald-500/5",
    },
    focus: {
      iconBg: "bg-indigo-500/10 text-indigo-600 border border-indigo-500/20",
      bullet: "bg-indigo-500/60",
    },
    finance: {
      iconBg: "bg-amber-500/10 text-amber-600 border border-amber-500/20",
      cardBg: "bg-amber-500/5 border-amber-500/15",
    },
    notes: {
      iconBg: "bg-violet-500/10 text-violet-600 border border-violet-500/20",
      cardBg: "bg-violet-500/5 border-violet-500/15",
    },
  };
  
  return (
    <div className="space-y-4">
      {sections.map((section, idx) => {
        const Icon = SectionIcon[section.type];
        const theme = SectionTheme[section.type];
        return (
          <div key={idx} className="space-y-2 border-b border-zen-pebble/10 pb-4 last:border-0 last:pb-0">
            {/* Header */}
            <div className="flex items-center gap-2">
              <div className={`p-1 ${theme.iconBg} rounded-lg flex-shrink-0`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-[11px] font-bold text-zen-slate uppercase tracking-wider">
                {section.title}
              </h3>
            </div>
            
            {/* Portfolio Analysis Section */}
            {section.type === "greeting" && section.content && (
              <div className={`pl-2.5 border-l-2 ${theme.border} py-1.5 px-2.5 rounded-r-xl`}>
                <p className="text-[12px] text-zen-charcoal font-medium leading-relaxed">
                  {section.content}
                </p>
              </div>
            )}
            
            {/* Risk & News Advice Section */}
            {section.type === "focus" && (
              <div className="space-y-1.5 pl-0.5">
                {section.content && (
                  <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-2.5 text-[12px] text-zen-charcoal font-medium leading-relaxed">
                    {section.content}
                  </div>
                )}
                {section.items.length > 0 &&
                  section.items.map((item, itemIdx) => (
                    <div key={itemIdx} className="flex items-start gap-2 text-[12px] text-zen-charcoal font-medium leading-relaxed">
                      <span className={`w-1.5 h-1.5 rounded-full ${theme.bullet} mt-1.5 flex-shrink-0`} />
                      <span>{item}</span>
                    </div>
                  ))
                }
              </div>
            )}
            
            {/* Finance Section */}
            {section.type === "finance" && (
              <div className="space-y-2 pl-0.5">
                {section.content && (
                  <div className={`${theme.cardBg} border rounded-xl p-3 flex flex-col gap-1`}>
                    <span className="text-[9px] font-bold text-zen-slate uppercase tracking-wider">
                      ภาพรวมสินทรัพย์
                    </span>
                    <div className="flex flex-wrap items-baseline justify-between gap-1.5 mt-0.5">
                      <span className="text-[13px] font-bold text-zen-charcoal">
                        {section.content.split("(")[0]?.replace("พอร์ตรวม:", "").trim()}
                      </span>
                      {section.content.includes("(") && (
                        <span className="text-[10px] font-bold text-zen-pine bg-zen-pine/10 px-2 py-0.5 rounded-full shrink-0">
                          {section.content.split("(")[1]?.replace(")", "").replace("ผลตอบแทนสะสม:", "").trim()}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {section.items.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {section.items.map((item, itemIdx) => {
                      const parts = item.split(":");
                      const titlePart = parts[0]?.trim() || "";
                      const valuePart = parts[1]?.trim() || "";
                      
                      const colorClass = itemIdx === 0
                        ? "text-emerald-600 bg-emerald-500/5 border-emerald-500/15"
                        : "text-rose-600 bg-rose-500/5 border-rose-500/15";
                        
                      return (
                        <div key={itemIdx} className={`p-2.5 rounded-xl border text-[11px] font-medium flex flex-col justify-between ${colorClass}`}>
                          <span className="text-zen-slate text-[9px] uppercase font-bold tracking-wider">
                            {titlePart}
                          </span>
                          <span className="text-zen-charcoal font-bold mt-1 text-[11px] truncate">
                            {valuePart}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            
            {/* Investment Sentiment Section */}
            {section.type === "notes" && (
              <div className="space-y-1.5 pl-0.5">
                {section.content && (
                  <div className={`${theme.cardBg} border border-violet-500/10 rounded-xl p-2.5 text-[12px] text-zen-charcoal font-medium leading-relaxed`}>
                    {section.content}
                  </div>
                )}
                {section.items.length > 0 &&
                  section.items.map((item, itemIdx) => (
                    <div key={itemIdx} className={`${theme.cardBg} border rounded-xl p-2.5 text-[11.5px] text-zen-charcoal font-medium flex items-start gap-2`}>
                      <span className="text-violet-500/70 mt-0.5 select-none">✦</span>
                      <span className="leading-relaxed">{item}</span>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function HomePage() {
  const { todos, addTodo, toggleTodo, addNote, stocks, notes, usdToThb } = useData();
  const { aiSummary, isSummarizing, generateSummary } = useAiSummary(todos, stocks, notes, usdToThb);

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
              onClick={generateSummary}
              disabled={isSummarizing || (stocks.length === 0 && notes.length === 0)}
              className="p-1.5 hover:bg-zen-sand rounded-lg transition-colors cursor-pointer disabled:opacity-30 group"
              aria-label="Refresh AI summary"
            >
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
          ) : (stocks.length === 0 && notes.length === 0) ? (
            <p className="text-sm leading-relaxed text-zen-slate">
              ยินดีต้อนรับสู่ Snuze ✦ เพิ่มสินทรัพย์หรือบันทึกด้านล่างเพื่อเริ่มต้น
            </p>
          ) : (
            <div className="text-sm leading-relaxed text-zen-charcoal">
              {aiSummary ? renderParsedBrief(aiSummary) : (
                <span className="text-zen-slate italic block text-center py-2">
                  กดรีเฟรชเพื่อให้ AI วิเคราะห์การลงทุนประจำวันของคุณ
                </span>
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
