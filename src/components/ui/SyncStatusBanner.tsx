import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface SyncStatusBannerProps {
  error: string | null;
  onRetry: () => void;
}

export default function SyncStatusBanner({ error, onRetry }: SyncStatusBannerProps) {
  if (!error) return null;

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 bg-zen-warning/10 border border-zen-warning/25 rounded-xl text-xs text-zen-warning font-medium tracking-tight animate-fade-in mb-4">
      <div className="flex items-center gap-2 min-w-0">
        <AlertCircle className="w-4.5 h-4.5 shrink-0" />
        <span className="truncate">
          {error} (ข้อมูลอาจไม่เป็นปัจจุบัน)
        </span>
      </div>
      <button
        onClick={onRetry}
        className="flex items-center gap-1 shrink-0 px-2.5 py-1.5 bg-zen-warning/15 hover:bg-zen-warning/25 rounded-lg font-bold text-[10px] cursor-pointer transition-colors active:scale-95 min-h-[32px]"
      >
        <RefreshCw className="w-3 h-3" />
        โหลดใหม่
      </button>
    </div>
  );
}
