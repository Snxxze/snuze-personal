import React, { useState } from "react";
import { Drawer } from "@/components/ui/drawer";
import { Calendar } from "lucide-react";

interface CreateTodoDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; priority: "high" | "medium" | "low"; deadline?: string }) => void;
}

export function CreateTodoDrawer({ open, onClose, onSubmit }: CreateTodoDrawerProps) {
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<"high" | "medium" | "low">("medium");
  const [newDeadline, setNewDeadline] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onSubmit({
      title: newTitle.trim(),
      priority: newPriority,
      deadline: newDeadline || undefined,
    });

    setNewTitle("");
    setNewPriority("medium");
    setNewDeadline("");
    onClose();
  };

  return (
    <Drawer open={open} onClose={onClose} title="เพิ่มงานใหม่">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-[10px] font-semibold text-zen-slate uppercase mb-1.5 block">
            ชื่องานค้าง
          </label>
          <input
            type="text"
            required
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="เช่น ทำสไลด์รายงานกลุ่ม..."
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
                const active = newPriority === p;
                const labels = { low: "ทั่วไป", medium: "ด่วนปกติ", high: "ด่วนมาก" };
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setNewPriority(p)}
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
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
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
          บันทึกสิ่งต้องทำ
        </button>
      </form>
    </Drawer>
  );
}
