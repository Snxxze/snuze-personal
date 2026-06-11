import React from "react";
import type { CalculatedStock } from "@/hooks/useStockCalculations";

interface StockRowDetailsProps {
  stock: CalculatedStock;
  onEditClick: (e: React.MouseEvent) => void;
}

export default function StockRowDetails({ stock, onEditClick }: StockRowDetailsProps) {
  return (
    <div className="flex flex-col gap-y-3.5 w-full border-t border-zen-pebble/5 pt-3.5 overflow-hidden" onClick={(e) => e.stopPropagation()}>
      <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-x-2 w-full items-start">
        <div className="flex flex-col justify-start text-left min-w-0">
          <span className="text-[9px] font-bold text-zen-slate uppercase tracking-wider block">
            จำนวนหุ้นคงเหลือ
          </span>
          <span className="font-bold text-xs text-zen-charcoal mt-1 block truncate">
            {stock.hasHoldings ? stock.shares!.toLocaleString(undefined, { maximumFractionDigits: 4 }) : "—"}
          </span>
        </div>

        <div className="flex flex-col justify-start text-right">
          <span className="text-[9px] font-bold text-zen-slate uppercase tracking-wider block">
            ราคา (USD)
          </span>
          <span className="font-bold text-xs text-zen-charcoal mt-1 block">
            ${stock.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div />
      </div>

      <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-x-2 w-full items-center">
        <div className="flex flex-col justify-start text-left min-w-0">
          <span className="text-[9px] font-bold text-zen-slate uppercase tracking-wider block">
            ต้นทุนต่อหุ้น (USD)
          </span>
          <span className="font-semibold text-xs text-zen-charcoal mt-1 block truncate">
            {stock.hasHoldings ? `$${stock.avgCost!.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
          </span>
        </div>

        <div className="flex flex-col justify-start text-right">
          <span className="text-[9px] font-bold text-zen-slate uppercase tracking-wider block">
            ต้นทุนรวม (USD)
          </span>
          <span className="font-semibold text-xs text-zen-charcoal mt-1 block">
            {stock.hasHoldings ? `$${stock.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
          </span>
        </div>

        <div className="flex justify-end items-center">
          <button
            onClick={onEditClick}
            className="
              px-4 py-2.5 text-[10px] font-bold
              text-zen-indigo bg-zen-indigo/8 hover:bg-zen-indigo/15
              rounded-lg transition-colors cursor-pointer min-h-[44px] flex items-center justify-center
            "
          >
            ซื้อ - ขาย
          </button>
        </div>
      </div>
    </div>
  );
}
