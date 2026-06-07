"use client";

import { useState } from "react";
import { Sparkles, Send, CheckCircle, PenLine } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface QuickCaptureProps {
  onAddTodo: (task: { title: string; priority: "high" | "medium" | "low"; deadline?: string }) => void;
  onAddNote: (content: string) => void;
}

export default function QuickCapture({ onAddTodo, onAddNote }: QuickCaptureProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [useAi, setUseAi] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("snuze_use_ai_capture");
      return saved === "true";
    }
    return false;
  });

  const handleToggleAi = (checked: boolean) => {
    setUseAi(checked);
    localStorage.setItem("snuze_use_ai_capture", String(checked));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    const text = input.trim();

    try {
      let parsedResult: {
        type: "todo" | "note";
        todoData?: { title: string; priority: "high" | "medium" | "low"; deadline?: string };
        noteData?: string;
      } | null = null;

      if (useAi) {
        try {
          const token = typeof window !== "undefined" ? localStorage.getItem("snuze_auth_token") || "" : "";
          const res = await fetch("/api/gemini/parse", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "x-snuze-token": token
            },
            body: JSON.stringify({ text }),
          });
          if (res.status === 401) {
            localStorage.removeItem("snuze_auth_token");
            window.location.reload();
            return;
          }
          if (res.ok) {
            const data = await res.json();
            if (data && data.type) {
              parsedResult = data;
            }
          }
        } catch (err) {
        }
      }

      if (!parsedResult) {
        parsedResult = parseTextLocally(text);
      }

      if (parsedResult.type === "todo" && parsedResult.todoData) {
        onAddTodo({
          title: parsedResult.todoData.title,
          priority: parsedResult.todoData.priority,
          deadline: parsedResult.todoData.deadline,
        });
        setSuccessMessage(`✓ เพิ่มงาน: "${parsedResult.todoData.title}"`);
      } else {
        const noteContent = parsedResult.noteData || text;
        onAddNote(noteContent);
        setSuccessMessage("✓ บันทึกโน้ตเรียบร้อยแล้ว");
      }

      setInput("");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Quick capture error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const parseTextLocally = (text: string) => {
    const lower = text.toLowerCase();

    const todoTriggers = [
      "ทำ", "ส่ง", "อ่าน", "ซื้อ", "เขียน", "todo", "task", "job", "work", "meeting",
      "นัด", "เรียน", "สอบ", "โทร", "ตรวจ", "แก้", "fix", "buy", "read", "send",
    ];

    const isTodo =
      todoTriggers.some((trigger) => lower.includes(trigger)) ||
      lower.startsWith("todo:") ||
      lower.startsWith("งาน:");

    if (isTodo) {
      let title = text.replace(/^(todo:|งาน:)\s*/i, "");
      let priority: "high" | "medium" | "low" = "medium";

      if (lower.includes("ด่วน") || lower.includes("สำคัญมาก") || lower.includes("urgent") || lower.includes("high")) {
        priority = "high";
      } else if (lower.includes("ชิล") || lower.includes("ว่าง") || lower.includes("low") || lower.includes("เมื่อไหร่ก็ได้")) {
        priority = "low";
      }

      let deadline: string | undefined = undefined;
      const today = new Date();

      if (lower.includes("วันนี้") || lower.includes("today")) {
        deadline = today.toISOString().split("T")[0];
      } else if (lower.includes("พรุ่งนี้") || lower.includes("tomorrow")) {
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        deadline = tomorrow.toISOString().split("T")[0];
      } else if (lower.includes("มะรืน") || lower.includes("next day")) {
        const nextDay = new Date(today);
        nextDay.setDate(today.getDate() + 2);
        deadline = nextDay.toISOString().split("T")[0];
      } else {
        const dateMatch = text.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
        if (dateMatch) {
          deadline = `${dateMatch[1]}-${dateMatch[2].padStart(2, "0")}-${dateMatch[3].padStart(2, "0")}`;
        }
      }

      return { type: "todo" as const, todoData: { title, priority, deadline } };
    }

    return { type: "note" as const, noteData: text.replace(/^(note:|โน้ต:)\s*/i, "") };
  };

  return (
    <div
      className={`
        bg-zen-white border rounded-2xl p-4 shadow-sm
        transition-all duration-200
        ${isFocused ? "border-zen-indigo/40 shadow-md" : "border-zen-pebble/30"}
      `}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 bg-zen-indigo/10 rounded-lg text-zen-indigo">
          <PenLine className="w-3.5 h-3.5" />
        </div>
        <div>
          <h3 className="text-[11px] font-semibold text-zen-charcoal uppercase tracking-wider">
            Quick Capture
          </h3>
          <p className="text-[10px] text-zen-slate">พิมพ์ข้อมูลด่วนเพื่อบันทึกงานหรือโน้ต</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={isLoading}
          placeholder='เช่น "ทำสรุปย่อด่วนพรุ่งนี้" หรือ "ไอเดียแอปฟิตเนส"'
          className="
            flex-1 text-sm bg-zen-sand/60 border border-zen-pebble/20 rounded-xl
            px-3 py-2.5 text-zen-charcoal placeholder-zen-slate/50
            focus:outline-none focus:border-zen-indigo/40 focus:bg-zen-white
            transition-all
          "
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="
            bg-zen-indigo text-zen-white
            disabled:opacity-30 rounded-xl px-4 py-2.5
            flex items-center justify-center
            cursor-pointer hover:bg-zen-indigo/90
            active:scale-95 transition-all shadow-sm
            min-w-[44px]
          "
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-zen-white/30 border-t-zen-white rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>

      <div className="flex items-center justify-between mt-2.5 px-0.5">
        <label className="flex items-center gap-2 cursor-pointer select-none group">
          <input
            type="checkbox"
            checked={useAi}
            onChange={(e) => handleToggleAi(e.target.checked)}
            className="sr-only peer"
          />
          <div className="
            w-7 h-4 bg-zen-sand rounded-full relative 
            border border-zen-pebble/40
            peer-checked:bg-zen-indigo/25 peer-checked:border-zen-indigo/40
            transition-colors duration-200
            after:content-[''] after:absolute after:top-[2px] after:left-[2px]
            after:bg-zen-slate after:rounded-full after:h-2.5 after:w-2.5
            after:transition-all after:duration-200
            peer-checked:after:translate-x-3 peer-checked:after:bg-zen-indigo
          " />
          <span className="text-[10px] font-medium text-zen-slate group-hover:text-zen-charcoal transition-colors">
            ใช้ Gemini AI ประมวลผลคำพูด
          </span>
        </label>
        {useAi && (
          <span className="text-[9px] text-zen-indigo font-semibold bg-zen-indigo/10 px-1.5 py-0.5 rounded-md">
            โควต้า: 20 ครั้ง/วัน
          </span>
        )}
      </div>

      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mt-2.5 flex items-center gap-2 text-xs text-zen-pine font-medium"
          >
            <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
