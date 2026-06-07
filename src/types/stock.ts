export interface StockItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent?: number;
}