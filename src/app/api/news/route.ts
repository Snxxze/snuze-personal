import { NextResponse } from "next/server";

function formatPubDate(dateStr: string): string {
  try {
    const pubTime = new Date(dateStr).getTime();
    const diffMs = Date.now() - pubTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${Math.max(1, diffMins)} นาทีที่แล้ว`;
    } else if (diffHours < 24) {
      return `${diffHours} ชั่วโมงที่แล้ว`;
    } else {
      return `${diffDays} วันที่แล้ว`;
    }
  } catch {
    return "ไม่ระบุเวลา";
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbols = searchParams.get("symbols");

    let query = "finance+OR+technology+OR+stocks";
    if (symbols) {
      const cleanSymbols = symbols
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter((s) => s.length > 0);

      if (cleanSymbols.length > 0) {
        // Construct query like: ("NVDA" OR "AAPL" OR "GOOGL") AND (finance OR market OR stocks OR business)
        const symbolsQuery = cleanSymbols.map(s => `"${s}"`).join("+OR+");
        query = `(${symbolsQuery})+AND+(finance+OR+market+OR+stocks+OR+business)`;
      }
    }

    const url = `https://news.google.com/rss/search?q=${query}&hl=en-US&gl=US&ceid=US:en`;
    let res = await fetch(url, {
      next: { revalidate: 300 } // Cache results for 5 minutes for dynamic queries
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch RSS feed, status: ${res.status}`);
    }

    let xmlText = await res.text();

    // Check if we got any items. If empty and we had symbols, fall back to default broad query
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let hasItems = itemRegex.test(xmlText);
    
    // Reset regex index because test() moves it
    itemRegex.lastIndex = 0;

    if (!hasItems && symbols) {
      console.log("No news found for custom symbols, falling back to broad news...");
      const fallbackUrl = "https://news.google.com/rss/search?q=finance+OR+technology+OR+stocks&hl=en-US&gl=US&ceid=US:en";
      const fallbackRes = await fetch(fallbackUrl, {
        next: { revalidate: 900 }
      });
      if (fallbackRes.ok) {
        xmlText = await fallbackRes.text();
      }
    }

    const items: any[] = [];
    let match;
    let count = 0;

    while ((match = itemRegex.exec(xmlText)) !== null && count < 10) {
      const itemContent = match[1];
      const title = itemContent.match(/<title>([\s\S]*?)<\/title>/)?.[1] || "";
      const link = itemContent.match(/<link>([\s\S]*?)<\/link>/)?.[1] || "";
      const pubDate = itemContent.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || "";
      const source = itemContent.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1] || "";

      // Clean CDATA wrappers if any
      const cleanTitleStr = title.replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim();
      const cleanLinkStr = link.replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim();
      const cleanSourceStr = source.replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim();

      // Clean title from source name at the end
      let cleanTitle = cleanTitleStr;
      if (cleanSourceStr && cleanTitle.endsWith(` - ${cleanSourceStr}`)) {
        cleanTitle = cleanTitle.substring(0, cleanTitle.length - (cleanSourceStr.length + 3));
      }

      items.push({
        id: cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, "-").substring(0, 100) + "-" + count,
        title: cleanTitle,
        source: cleanSourceStr || "Google News",
        time: formatPubDate(pubDate),
        url: cleanLinkStr,
      });

      count++;
    }

    return NextResponse.json({
      status: "success",
      news: items
    });
  } catch (error) {
    console.error("News API GET error:", error);
    return NextResponse.json({ error: "Failed to fetch top market news" }, { status: 500 });
  }
}
