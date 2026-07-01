"use client";

import { ExternalLink } from "lucide-react";
import type { NewsItem } from "@/types";

interface NewsFeedProps {
  news: NewsItem[];
}

export default function NewsFeed({ news }: NewsFeedProps) {
  if (news.length === 0) {
    return (
      <div className="text-center py-12 text-zen-slate/50 text-sm">
        ไม่มีข่าวสารใหม่ในขณะนี้
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {news.map((item) => {
        return (
          <div
            key={item.id}
            className="bg-zen-white border border-zen-pebble/30 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold text-zen-indigo uppercase tracking-wider">
                  {item.source}
                </span>
                <span className="text-[10px] text-zen-slate">{item.time}</span>
              </div>

              <h3 className="text-sm font-semibold text-zen-charcoal leading-snug">
                {item.title}
              </h3>
            </div>

            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  w-full flex items-center justify-between
                  px-4 py-2.5 border-t border-zen-pebble/10
                  bg-zen-sand/30 hover:bg-zen-sand/60
                  text-xs text-zen-slate font-medium
                  transition-colors cursor-pointer
                "
              >
                <span className="flex items-center gap-1.5 text-zen-indigo font-semibold">
                  <ExternalLink className="w-3.5 h-3.5" />
                  อ่านต่อข่าวฉบับเต็ม
                </span>
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}
