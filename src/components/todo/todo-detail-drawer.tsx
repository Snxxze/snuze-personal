import React, { useState, useEffect } from "react";
import { Drawer } from "@/components/ui/drawer";
import { Calendar } from "lucide-react";
import type { TodoItem } from "@/types";

interface TodoDetailDrawerProps {
  todo: TodoItem | null;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Omit<TodoItem, "id" | "createdAt">>) => void;
}

export function TodoDetailDrawer({ todo, open, onClose, onSave }: TodoDetailDrawerProps) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [deadline, setDeadline] = useState("");
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (todo) {
      setTitle(todo.text);
      setPriority(todo.priority);
      setDeadline(todo.dueDate || "");
      setCompleted(todo.completed);
    }
  }, [todo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!todo || !title.trim()) return;

    onSave(todo.id, {
      text: title.trim(),
      priority,
      dueDate: deadline || undefined,
      completed,
      completedAt: completed ? (todo.completedAt || new Date().toISOString()) : undefined,
    });
    onClose();
  };

  if (!todo) return null;

  return (
    <Drawer open={open} onClose={onClose} title="รายละเอียดงานค้าง">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-[10px] font-semibold text-zen-slate uppercase mb-1.5 block">
            ชื่องานค้าง
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="
              w-full text-sm bg-zen-sand border border-zen-pebble/20 
              rounded-xl px-3 py-2.5 text-zen-charcoal 
              focus:outline-none focus:border-zen-indigo/40
            "
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-semibold text-zen-slate uppercase mb-1.5 block">
              ระดับความด่วน
            </label>
            
            <div className="flex bg-zen-sand border border-zen-pebble/20 p-1 rounded-xl h-[42px] items-stretch">
              {(["low", "medium", "high"] as const).map((p) => {
                const active = priority === p;
                const labels = { low: "ทั่วไป", medium: "ด่วนปกติ", high: "ด่วนมาก" };
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`
                      flex-1 flex items-center justify-center text-[10px] font-bold rounded-lg transition-all cursor-pointer text-center
                      ${active 
                        ? "bg-zen-white text-zen-indigo shadow-sm border border-zen-pebble/15" 
                        : "text-zen-slate hover:text-zen-charcoal"
                      }
                    `}
                  >
                    {labels[p]}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-zen-slate uppercase mb-1.5 block">
              วันกำหนดส่ง (เดดไลน์)
            </label>
            <div 
              onClick={(e) => {
                const inputEl = e.currentTarget.querySelector("input");
                if (inputEl) {
                  try {
                    inputEl.showPicker();
                  } catch (err) {
                    inputEl.focus();
                  }
                }
              }}
              className="relative flex items-center bg-zen-sand border border-zen-pebble/20 rounded-xl px-3 h-[42px] focus-within:border-zen-indigo/40 focus-within:bg-zen-white focus-within:shadow-sm transition-all duration-200 cursor-pointer"
            >
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                onClick={(e) => {
                  e.stopPropagation();
                  try {
                    e.currentTarget.showPicker();
                  } catch (err) {}
                }}
                className="
                  w-full text-xs text-zen-charcoal bg-transparent 
                  outline-none border-none cursor-pointer pr-6
                  relative z-10
                  [&::-webkit-calendar-picker-indicator]:absolute
                  [&::-webkit-calendar-picker-indicator]:inset-0
                  [&::-webkit-calendar-picker-indicator]:opacity-0
                  [&::-webkit-calendar-picker-indicator]:cursor-pointer
                "
              />
              <Calendar className="w-3.5 h-3.5 text-zen-slate absolute right-3 pointer-events-none" />
            </div>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-semibold text-zen-slate uppercase mb-1.5 block">
            สถานะงาน
          </label>

          <div className="flex bg-zen-sand border border-zen-pebble/20 p-1 rounded-xl h-[42px] items-stretch">
            {([false, true] as const).map((status) => {
              const active = completed === status;
              const label = status ? "เสร็จสิ้นแล้ว" : "ยังไม่เสร็จ";

              return (
                <button
                  key={status ? "done" : "pending"}
                  type="button"
                  onClick={() => setCompleted(status)}
                  className={`
                    flex-1 flex items-center justify-center text-[10px] font-bold rounded-lg transition-all cursor-pointer text-center
                    ${active 
                      ? "bg-zen-white text-zen-indigo shadow-sm border border-zen-pebble/15" 
                      : "text-zen-slate hover:text-zen-charcoal"
                    }
                  `}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="text-[10px] text-zen-slate flex flex-col gap-0.5 pt-1">
          <span>
            สร้างเมื่อ: {new Date(todo.createdAt).toLocaleString("th-TH")}
          </span>

          {todo.completedAt && (
            <span>
              เสร็จสิ้นเมื่อ: {new Date(todo.completedAt).toLocaleString("th-TH")}
            </span>
          )}
        </div>

        <button
          type="submit"
          className="
            w-full py-2.5 mt-2
            bg-zen-indigo text-zen-white 
            rounded-xl text-sm font-semibold 
            hover:bg-zen-indigo/90 transition-colors 
            shadow-sm cursor-pointer
          "
        >
          บันทึกการแก้ไข
        </button>
      </form>
    </Drawer>
  );
}
