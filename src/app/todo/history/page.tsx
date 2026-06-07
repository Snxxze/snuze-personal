"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, History, ClipboardCheck, Trash2 } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { getPriorityLabel } from "@/lib/format";
import type { TodoItem } from "@/types";

export default function TodoHistoryPage() {
  const [historyTodos, setHistoryTodos] = useState<TodoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("snuze_auth_token") || "" : "";
        const res = await fetch("/api/sheets?history=true", {
          headers: {
            "x-snuze-token": token,
          },
        });

        if (res.status === 401) {
          localStorage.removeItem("snuze_auth_token");
          window.location.reload();
          return;
        }

        if (res.ok) {
          const data = await res.json();
          if (data.status === "success" && data.todos) {
            setHistoryTodos(data.todos);
          }
        }
      } catch (error) {
        console.error("Failed to load todo history:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchHistory();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return "";
      return d.toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }) + " น.";
    } catch {
      return "";
    }
  };

  const getPriorityColorClass = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-zen-error/15 text-zen-error border-zen-error/20";
      case "medium":
        return "bg-zen-warning/15 text-zen-warning border-zen-warning/20";
      case "low":
      default:
        return "bg-zen-pine/15 text-zen-pine border-zen-pine/20";
    }
  };

  return (
    <motion.div
      key="todo-history"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col h-full relative"
    >
      <div className="flex items-center gap-3 mb-1">
        <Link
          href="/todo"
          className="p-2 bg-zen-white border border-zen-pebble/30 hover:border-zen-indigo/40 rounded-xl text-zen-slate hover:text-zen-indigo active:scale-95 transition-all shadow-sm"
          aria-label="ย้อนกลับไปหน้าสิ่งต้องทำ"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <PageHeader
          title="History"
          subtitle={
            <span className="flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-zen-indigo" />
              ประวัติงานที่ทำเสร็จแล้ว (เก่ากว่า 7 วัน)
            </span>
          }
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pt-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-zen-white/50 border border-zen-pebble/20 rounded-2xl p-4 animate-pulse space-y-2.5"
              >
                <div className="h-4 bg-zen-pebble/30 rounded w-2/3" />
                <div className="flex gap-2">
                  <div className="h-5 bg-zen-pebble/30 rounded w-16" />
                  <div className="h-5 bg-zen-pebble/30 rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : historyTodos.length === 0 ? (
          <EmptyState
            icon={<ClipboardCheck className="w-6 h-6" />}
            title="ไม่มีประวัติงานเก่าเก็บ"
            description="งานที่ทำเสร็จก่อนหน้านี้ไม่เกิน 7 วันจะยังคงแสดงอยู่ที่หน้าหลัก ประวัตินี้ช่วยให้ขนาดเครื่องเร็วขึ้น"
          />
        ) : (
          <div className="space-y-2.5">
            {historyTodos.map((todo) => (
              <motion.div
                key={todo.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-zen-white/80 border border-zen-pebble/20 rounded-2xl p-4 shadow-sm flex flex-col gap-2.5 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-sm font-medium text-zen-charcoal/85 line-through decoration-zen-slate/50">
                    {todo.text}
                  </span>
                  <span
                    className={`
                      text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full border
                      ${getPriorityColorClass(todo.priority)}
                    `}
                  >
                    {getPriorityLabel(todo.priority)}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2 items-center justify-between text-[10px] text-zen-slate">
                  <span>
                    สร้างเมื่อ: {formatDate(todo.createdAt)}
                  </span>
                  {todo.completedAt && (
                    <span className="bg-zen-pine/10 text-zen-pine font-medium px-2 py-0.5 rounded-lg">
                      เสร็จสิ้น: {formatDate(todo.completedAt)}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
