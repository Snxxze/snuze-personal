import React from "react";
import type { CalculatedStock } from "@/hooks/useStockCalculations";

interface StockRowProps {
  stock: CalculatedStock;
}

export default function StockRow({ stock }: StockRowProps) {
  const isPositive = stock.changePct >= 0;

  return (
    <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-x-2 items-center h-[56px] w-full">
      <div className="flex flex-col justify-center text-left min-w-0">
        <span className="font-bold text-sm text-zen-charcoal tracking-wide block truncate">
          {stock.symbol}
        </span>
        <span className="text-[10px] font-medium text-zen-slate mt-0.5 truncate max-w-[130px]">
          {stock.hasHoldings ? `สัดส่วน ${stock.allocationPercent.toFixed(2)}%` : stock.name}
        </span>
      </div>

      <div className="flex flex-col justify-center text-right">
        <span className="font-bold text-sm text-zen-charcoal block">
          {stock.formattedMarketValue}
        </span>
        <span className="text-[10px] font-medium text-zen-slate mt-0.5">
          {stock.formattedTHB}
        </span>
      </div>

      <div className="flex flex-col justify-center text-right">
        <span className="font-bold text-sm text-zen-charcoal block">
          {stock.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span className={`text-[10px] font-bold mt-0.5 ${
          isPositive ? "text-zen-pine" : "text-zen-error"
        }`}>
          {isPositive ? "+" : ""}{stock.changePct.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}
