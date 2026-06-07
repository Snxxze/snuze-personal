"use client";

import React, { useState, useEffect } from "react";

export default function Header() {
  const [dateString, setDateString] = useState("");

  useEffect(() => {
    const formattedDate = new Date().toLocaleDateString("th-TH", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    setDateString(formattedDate);
  }, []);

  return (
    <header
      aria-label="Snuze App Header"
      className="
        sticky top-0 z-30
        flex items-center justify-between
        border-b border-zen-pebble/15
        bg-zen-white/80 backdrop-blur-md
        px-5 py-3.5
      "
    >
      <div className="flex items-center gap-2">
        <span
          className="
            text-[15px] font-bold text-zen-charcoal
            tracking-[0.12em] uppercase
          "
        >
          Snuze
        </span>
        <span className="w-1 h-1 rounded-full bg-zen-indigo" />
      </div>

      {dateString && (
        <div
          className="
            text-[11px] text-zen-slate font-medium
            bg-zen-sand px-2.5 py-1 rounded-full
            border border-zen-pebble/20
          "
        >
          {dateString}
        </div>
      )}
    </header>
  );
}