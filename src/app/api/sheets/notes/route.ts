import { NextResponse } from "next/server";
import { getSheetsClient, ensureSheetsExist, writeSheetAtomic } from "@/lib/sheets-client";
import { requireAuth } from "@/lib/api-auth";
import { sanitizeForSheets } from "@/lib/sheets-sanitize";
import type { NoteItem } from "@/types";

export async function GET() {
  const authResponse = await requireAuth();
  if (authResponse) return authResponse;

  const client = getSheetsClient();
  if (!client) {
    return NextResponse.json({
      status: "unconfigured",
      message: "Google Sheets credentials not set.",
      notes: [],
    });
  }

  const { sheets, spreadsheetId } = client;

  try {
    await ensureSheetsExist(sheets, spreadsheetId);

    let notes: NoteItem[] = [];
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "Notes!A2:C500",
      });
      const rows = response.data.values;
      if (rows && rows.length > 0) {
        notes = rows.map((row) => ({
          id: row[0] || "",
          content: row[1] || "",
          createdAt: row[2] || new Date().toISOString(),
        }));
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn("Sheet 'Notes' read failed or empty:", msg);
    }

    return NextResponse.json({
      status: "success",
      notes,
    });
  } catch (error) {
    console.error("Notes GET error:", error);
    return NextResponse.json({ error: "Failed to read Notes from Google Sheets" }, { status: 500 });
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
    const { notes } = body;

    if (!notes || !Array.isArray(notes) || notes.length > 500) {
      return NextResponse.json({ error: "Invalid input: 'notes' must be an array of at most 500 items" }, { status: 400 });
    }

    await ensureSheetsExist(sheets, spreadsheetId);

    const noteRows = [
      ["ID", "Content", "CreatedAt"],
      ...notes.map((n: NoteItem) => [
        sanitizeForSheets(n.id || ""),
        sanitizeForSheets(n.content || ""),
        sanitizeForSheets(n.createdAt || new Date().toISOString())
      ])
    ];

    await writeSheetAtomic(sheets, spreadsheetId, "Notes", noteRows, "C", "RAW");

    return NextResponse.json({
      status: "success",
      message: "Successfully synchronized Notes with Google Sheets!",
    });
  } catch (error) {
    console.error("Notes POST error:", error);
    return NextResponse.json({ error: "Failed to write Notes to Google Sheets" }, { status: 500 });
  }
}
