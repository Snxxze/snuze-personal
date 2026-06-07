"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { Sparkles, ClipboardList, TrendingUp, RefreshCw, ArrowRight } from "lucide-react";

import QuickCapture from "@/components/QuickCapture";

import { useTodos } from "@/hooks/useTodos";
import { useNotes } from "@/hooks/useNotes";
import { useStocks } from "@/hooks/useStocks";
import { useAiSummary } from "@/hooks/useAiSummary";
import { sortTodos } from "@/lib/todo-sort";

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

export default function HomePage() {
  const { todos, addTodo, toggleTodo } = useTodos();
  const { addNote } = useNotes();
  const { stocks } = useStocks();
  const { aiSummary, isSummarizing, generateSummary } = useAiSummary(todos, stocks);

  const pendingTodos = todos.filter((todo) => !todo.completed);
  const displayTodos = sortTodos(pendingTodos);
  const nvdaStock = stocks.find((stock) => stock.symbol === "NVDA");
  const isPositiveNvda = (nvdaStock?.change ?? 3.2) >= 0;

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
        <div className="bg-zen-white border border-zen-pebble/30 rounded-2xl p-4 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-zen-indigo/10 rounded-lg text-zen-indigo">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[11px] uppercase font-semibold tracking-wider text-zen-charcoal">
                  AI Daily Brief
                </p>
                <p className="text-[10px] text-zen-slate leading-tight mt-0.5">
                  สรุปชีวิตวันนี้จากงานและการลงทุน
                </p>
              </div>
            </div>

            <button
              onClick={generateSummary}
              disabled={isSummarizing || todos.length === 0}
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
          ) : todos.length === 0 ? (
            <p className="text-sm leading-relaxed text-zen-slate">
              ยินดีต้อนรับสู่ Snuze ✦ เพิ่มงานหรือบันทึกด้านล่างเพื่อเริ่มต้น
            </p>
          ) : (
            <p className="text-sm leading-relaxed text-zen-charcoal whitespace-pre-line">
              {aiSummary || (
                <span className="text-zen-slate italic">กดรีเฟรชเพื่อให้ AI สรุปวันของคุณ</span>
              )}
            </p>
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
          <StatCard
            href="/assets"
            label="ตลาดวันนี้"
            value={`NVDA ${isPositiveNvda ? "+" : ""}${(nvdaStock?.change ?? 3.2).toFixed(1)}%`}
            icon={<TrendingUp className="w-4 h-4" />}
            accent="pine"
          />
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
