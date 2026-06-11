export interface StockItem {
  symbol: string;
  name: string;
  price: number;
  changePct: number;
  shares?: number;
  avgCost?: number;
}