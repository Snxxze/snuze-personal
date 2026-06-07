import React, { useState } from "react";
import { Drawer } from "@/components/ui/drawer";

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
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as any)}
              className="
                w-full text-xs bg-zen-sand border border-zen-pebble/20 
                rounded-xl px-2.5 py-2.5 text-zen-charcoal 
                focus:outline-none focus:border-zen-indigo/40
              "
            >
              <option value="high">ด่วนมาก (High)</option>
              <option value="medium">ด่วนปกติ (Medium)</option>
              <option value="low">ทั่วไป (Low)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-zen-slate uppercase mb-1.5 block">
              วันกำหนดส่ง (เดดไลน์)
            </label>
            <input
              type="date"
              value={newDeadline}
              onChange={(e) => setNewDeadline(e.target.value)}
              className="
                w-full text-xs bg-zen-sand border border-zen-pebble/20 
                rounded-xl px-2.5 py-2.5 text-zen-charcoal 
                focus:outline-none focus:border-zen-indigo/40
              "
            />
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
