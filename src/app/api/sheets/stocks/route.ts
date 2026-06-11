import { NextResponse } from "next/server";
import { getSheetsClient, ensureSheetsExist, writeSheetAtomic } from "@/lib/sheets-client";
import { requireAuth } from "@/lib/api-auth";
import { sanitizeForSheets } from "@/lib/sheets-sanitize";
import type { StockItem } from "@/types";

export async function GET() {
  const authResponse = await requireAuth();
  if (authResponse) return authResponse;

  const client = getSheetsClient();
  if (!client) {
    return NextResponse.json({
      status: "unconfigured",
      message: "Google Sheets credentials not set.",
      stocks: [],
    });
  }

  const { sheets, spreadsheetId } = client;

  try {
    await ensureSheetsExist(sheets, spreadsheetId);

    let stocks: StockItem[] = [];
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "Stocks!A2:F500",
      });
      const rows = response.data.values;
      if (rows && rows.length > 0) {
        stocks = rows.map((row) => ({
          symbol: row[0] || "",
          name: row[1] || "",
          price: parseFloat(row[2]) || 0,
          changePct: parseFloat(row[3]) || 0,
          shares: parseFloat(row[4]) || 0,
          avgCost: parseFloat(row[5]) || 0,
        }));
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn("Sheet 'Stocks' read failed or empty:", msg);
    }

    return NextResponse.json({
      status: "success",
      stocks,
    });
  } catch (error) {
    console.error("Stocks GET error:", error);
    return NextResponse.json({ error: "Failed to read Stocks from Google Sheets" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authResponse = await requireAuth();
  if (authResponse) return authResponse;

  const client = getSheetsClient();
  if (!client) {
    return NextResponse.json({
      status: "unconfigured",
      message: "Google Sheets credentials not set. Saving changes locally."
    });
  }

  const { sheets, spreadsheetId } = client;

  try {
    const body = await request.json().catch(() => ({}));
    const { stocks } = body;

    if (!stocks || !Array.isArray(stocks) || stocks.length > 500) {
      return NextResponse.json({ error: "Invalid input: 'stocks' must be an array of at most 500 items" }, { status: 400 });
    }

    await ensureSheetsExist(sheets, spreadsheetId);

    const stockRows = [
      ["Symbol", "Name", "Price", "Change", "Shares", "AvgCost"],
      ...stocks.map((s: StockItem, idx: number) => {
        const rowNum = idx + 2;
        return [
          s.symbol ? sanitizeForSheets(s.symbol.toUpperCase().trim()) : "",
          s.symbol ? `=GOOGLEFINANCE(A${rowNum}, "name")` : "",
          s.symbol ? `=GOOGLEFINANCE(A${rowNum}, "price")` : 0.0,
          s.symbol ? `=GOOGLEFINANCE(A${rowNum}, "changepct") / 100` : 0.0,
          s.shares || 0.0,
          s.avgCost || 0.0,
        ];
      })
    ];

    await writeSheetAtomic(sheets, spreadsheetId, "Stocks", stockRows, "F", "USER_ENTERED");

    return NextResponse.json({
      status: "success",
      message: "Successfully synchronized Stocks with Google Sheets!",
    });
  } catch (error) {
    console.error("Stocks POST error:", error);
    return NextResponse.json({ error: "Failed to write Stocks to Google Sheets" }, { status: 500 });
  }
}
