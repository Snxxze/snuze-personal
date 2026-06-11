import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";

// offline mode
const POPULAR_FALLBACKS = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "NVDA", name: "NVIDIA Corporation" },
  { symbol: "TSLA", name: "Tesla Inc." },
  { symbol: "MSFT", name: "Microsoft Corporation" },
  { symbol: "GOOGL", name: "Alphabet Inc." },
  { symbol: "AMZN", name: "Amazon.com Inc." },
  { symbol: "META", name: "Meta Platforms Inc." },
  { symbol: "BTC-USD", name: "Bitcoin USD" },
  { symbol: "ETH-USD", name: "Ethereum USD" },
  { symbol: "SPY", name: "SPDR S&P 500 ETF" },
  { symbol: "QQQ", name: "Invesco QQQ Trust" },
];

export async function GET(request: Request) {
  const authResponse = await requireAuth();
  if (authResponse) return authResponse;

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() || "";

  if (!query) {
    return NextResponse.json({
      status: "success",
      results: POPULAR_FALLBACKS,
    });
  }

  try {
    const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=8&newsCount=0`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s timeout

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Yahoo Finance API status error: ${response.status}`);
    }

    interface YahooQuote {
      symbol?: string;
      shortname?: string;
      longname?: string;
    }

    const data = await response.json();
    const quotes: YahooQuote[] = data.quotes || [];

    const results = quotes
      .filter((q): q is YahooQuote & { symbol: string } => !!(q.symbol && (q.shortname || q.longname)))
      .map((q) => ({
        symbol: q.symbol.toUpperCase(),
        name: q.shortname || q.longname || q.symbol,
      }));

    return NextResponse.json(
      { status: "success", results },
      {
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=600, stale-while-revalidate=1200",
        },
      }
    );
  } catch (error) {
    console.warn("Dynamic stock search failed, using filtered fallbacks:", error);
    
    const queryUpper = query.toUpperCase();
    const filtered = POPULAR_FALLBACKS.filter(
      (item) =>
        item.symbol.includes(queryUpper) ||
        item.name.toUpperCase().includes(queryUpper)
    );

    return NextResponse.json({
      status: "success",
      results: filtered,
      fallback: true,
    });
  }
}
