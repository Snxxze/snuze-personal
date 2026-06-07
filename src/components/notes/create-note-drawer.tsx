import React, { useState } from "react";
import { Drawer } from "@/components/ui/drawer";

interface CreateNoteDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (content: string) => void;
}

export function CreateNoteDrawer({ open, onClose, onSubmit }: CreateNoteDrawerProps) {
  const [newContent, setNewContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    onSubmit(newContent.trim());
    setNewContent("");
    onClose();
  };

  return (
    <Drawer open={open} onClose={onClose} title="จดบันทึกย่อใหม่">
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          autoFocus
          required
          rows={5}
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="พิมพ์ไอเดียหรือความทรงจำที่นี่..."
          className="
            w-full text-sm 
            bg-zen-sand border border-zen-pebble/20 
            rounded-xl p-3 
            text-zen-charcoal placeholder-zen-slate/40 
            focus:outline-none focus:border-zen-indigo/40 
            resize-none
          "
        />
        <button
          type="submit"
          className="
            w-full py-2.5 
            bg-zen-indigo text-zen-white 
            rounded-xl text-sm font-semibold 
            hover:bg-zen-indigo/90 transition-colors 
            shadow-sm cursor-pointer
          "
        >
          บันทึกลงสมุด
        </button>
      </form>
    </Drawer>
  );
}
