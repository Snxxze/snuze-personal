import React from "react";
import { motion } from "framer-motion";
import { FileText, Trash2 } from "lucide-react";
import type { NoteItem as NoteItemType } from "@/types";
import { formatTimeAgo, getNotePreview } from "@/lib/format";

interface NoteItemProps {
  note: NoteItemType;
  onClick: () => void;
  onDelete: (id: string) => void;
}

export function NoteItem({ note, onClick, onDelete }: NoteItemProps) {
  const preview = getNotePreview(note.content);
  const lines = note.content.split("\n");
  const title = lines[0].trim() || "Untitled Note";
  const body = lines.length > 1 ? lines.slice(1).join(" ").trim() : "";

  return (
    <motion.div
      layout
      layoutId={`note-${note.id}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="
        flex items-center justify-between 
        p-4 hover:bg-zen-sand/40 
        transition-colors duration-150
        group cursor-pointer
      "
    >
      <div className="flex-1 min-w-0 pr-4">
        <div className="flex items-center gap-2">
          <FileText className="w-3.5 h-3.5 text-zen-indigo/70" />
          <span className="text-sm font-semibold text-zen-charcoal truncate block">
            {title.length > 25 ? title.slice(0, 25) + "..." : title}
          </span>
        </div>
        <p className="text-xs text-zen-slate mt-1 truncate">
          <span className="font-medium text-zen-slate/85 mr-1.5">
            {formatTimeAgo(note.createdAt)}
          </span>
          {body && `• ${body.length > 40 ? body.slice(0, 40) + "..." : body}`}
        </p>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(note.id)
        }}
        aria-label="Delete note"
        className="
          p-1.5 
          text-zen-slate/30 hover:text-zen-error hover:bg-red-50 
          rounded-lg transition-colors duration-150
          cursor-pointer
        "
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
