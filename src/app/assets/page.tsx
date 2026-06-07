"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Newspaper } from "lucide-react";
import { useStocks } from "@/hooks/useStocks";

import { MOCK_NEWS } from "@/lib/mock-data";

import { PageHeader } from "@/components/ui/page-header";
import { SegmentedControl } from "@/components/ui/segmented-control";

import StockWatchlist from "@/components/StockWatchlist";
import NewsFeed from "@/components/NewsFeed";

type ActiveTab = "market" | "news";

export default function AssetsPage() {
  const { stocks, addStock, deleteStock } = useStocks();
  const [activeTab, setActiveTab] = useState<ActiveTab>("market");

  const segmentOptions = [
    {
      value: "market" as const,
      label: "Market Watch",
      icon: <TrendingUp className="w-3.5 h-3.5 z-10" />,
    },
    {
      value: "news" as const,
      label: "AI & Tech News",
      icon: <Newspaper className="w-3.5 h-3.5 z-10" />,
    },
  ];

  const subtitle =
    activeTab === "market"
      ? `ติดตาม ${stocks.length} สินทรัพย์`
      : `${MOCK_NEWS.length} ข่าวล่าสุด`;

  return (
    <motion.div
      key="assets"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col h-full relative"
    >
      <PageHeader
        title="Assets & Market"
        subtitle={subtitle}
      />

      <div className="mb-5">
        <SegmentedControl
          options={segmentOptions}
          selectedValue={activeTab}
          onChange={(val) => setActiveTab(val)}
        />
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        <AnimatePresence mode="wait">
          {activeTab === "market" ? (
            <motion.div
              key="market-view"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              <StockWatchlist
                stocks={stocks}
                onAddStock={addStock}
                onDeleteStock={deleteStock}
              />
            </motion.div>
          ) : (
            <motion.div
              key="news-view"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              <NewsFeed news={MOCK_NEWS} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
