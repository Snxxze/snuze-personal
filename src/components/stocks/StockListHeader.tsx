import React from "react";

export default function StockListHeader() {
  return (
    <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-x-2 px-4 pt-3.5 pb-2 text-[11px] font-medium text-zen-slate/40 tracking-normal border-b border-zen-pebble/10 bg-zen-sand/10">
      <div className="text-left">สินทรัพย์</div>
      <div className="text-right">มูลค่า</div>
      <div className="text-right">ราคา</div>
    </div>
  );
}
