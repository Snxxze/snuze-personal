import React from "react";
import { PieChart } from "lucide-react";

interface StockEmptyStateProps {
  onAddClick: () => void;
}

export default function StockEmptyState({ onAddClick }: StockEmptyStateProps) {
  return (
    <div className="py-12 px-4 text-center bg-zen-white flex flex-col items-center justify-center">
      <div className="w-12 h-12 rounded-full bg-zen-sand/50 flex items-center justify-center mb-3">
        <PieChart className="w-5 h-5 text-zen-slate/45" />
      </div>
      <h3 className="text-sm font-bold text-zen-charcoal tracking-tight">ยังไม่มีหุ้นในพอร์ต</h3>
      <p className="text-[11px] text-zen-slate mt-1 max-w-[200px] leading-relaxed">
        ติดตามสัดส่วนการลงทุน มูลค่า และการเติบโตได้ที่นี่
      </p>
      <button
        onClick={onAddClick}
        className="
          mt-4 text-xs font-bold text-zen-indigo bg-zen-indigo/8 
          hover:bg-zen-indigo/15 px-4 py-2 rounded-xl transition-all cursor-pointer
        "
      >
        เพิ่มสินทรัพย์แรกของคุณ
      </button>
    </div>
  );
}
