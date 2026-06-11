import { useMemo } from "react";
import type { StockItem } from "@/types";

export interface CalculatedStock extends StockItem {
  hasHoldings: boolean;
  marketValue: number;
  totalCost: number;
  allocationPercent: number;
  thbValue: number;
  formattedMarketValue: string;
  formattedTHB: string;
}

export function useStockCalculations(stocks: StockItem[], usdToThb: number) {
  const totalPortfolioValue = useMemo(() => {
    return stocks.reduce(
      (sum, s) => sum + (s.shares && s.shares > 0 ? s.shares * s.price : 0),
      0
    );
  }, [stocks]);

  const calculatedStocks: CalculatedStock[] = useMemo(() => {
    return stocks.map((stock) => {
      const hasHoldings = typeof stock.shares === "number" && stock.shares > 0;
      const marketValue = hasHoldings ? stock.shares! * stock.price : 0;
      const totalCost = hasHoldings ? stock.shares! * (stock.avgCost || 0) : 0;
      const allocationPercent = totalPortfolioValue > 0 ? (marketValue / totalPortfolioValue) * 100 : 0;
      const thbValue = marketValue * usdToThb;

      const formattedMarketValue = hasHoldings
        ? marketValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : "—";

      const formattedTHB = hasHoldings
        ? `≈ ${Math.round(thbValue).toLocaleString()} THB`
        : "—";

      return {
        ...stock,
        hasHoldings,
        marketValue,
        totalCost,
        allocationPercent,
        thbValue,
        formattedMarketValue,
        formattedTHB,
      };
    });
  }, [stocks, totalPortfolioValue, usdToThb]);

  return {
    totalPortfolioValue,
    calculatedStocks,
  };
}
