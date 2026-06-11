import { NextResponse } from "next/server";
import { getSheetsClient, ensureSheetsExist, writeSheetAtomic } from "@/lib/sheets-client";
import { requireAuth } from "@/lib/api-auth";
import { sanitizeForSheets } from "@/lib/sheets-sanitize";
import type { TodoItem } from "@/types";

export async function GET(request: Request) {
  const authResponse = await requireAuth();
  if (authResponse) return authResponse;

  const client = getSheetsClient();
  if (!client) {
    return NextResponse.json({
      status: "unconfigured",
      message: "Google Sheets credentials not set.",
      todos: [],
    });
  }

  const { sheets, spreadsheetId } = client;

  try {
    await ensureSheetsExist(sheets, spreadsheetId);

    let todos: TodoItem[] = [];
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "Todos!A2:G500",
      });
      const rows = response.data.values;
      if (rows && rows.length > 0) {
        todos = rows.map((row) => ({
          id: row[0] || "",
          text: row[1] || "",
          priority: (row[2] || "medium") as TodoItem["priority"],
          dueDate: row[3] || undefined,
          completed: row[4] === "TRUE" || row[4] === "true",
          createdAt: row[5] || new Date().toISOString(),
          completedAt: row[6] || undefined,
        }));
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn("Sheet 'Todos' read failed or empty:", msg);
    }

    const url = new URL(request.url);
    const showHistory = url.searchParams.get("history") === "true";
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    if (showHistory) {
      todos = todos.filter((t) => {
        if (!t.completed) return false;
        const completionDate = t.completedAt ? new Date(t.completedAt) : new Date(t.createdAt);
        return completionDate < sevenDaysAgo;
      });
    } else {
      todos = todos.filter((t) => {
        if (!t.completed) return true;
        const completionDate = t.completedAt ? new Date(t.completedAt) : new Date(t.createdAt);
        return completionDate >= sevenDaysAgo;
      });
    }

    return NextResponse.json({
      status: "success",
      todos,
    });
  } catch (error) {
    console.error("Todos GET error:", error);
    return NextResponse.json({ error: "Failed to read Todos from Google Sheets" }, { status: 500 });
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
    const { todos } = body;

    if (!todos || !Array.isArray(todos) || todos.length > 500) {
      return NextResponse.json({ error: "Invalid input: 'todos' must be an array of at most 500 items" }, { status: 400 });
    }

    await ensureSheetsExist(sheets, spreadsheetId);

    let sheetTodos: TodoItem[] = [];
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "Todos!A2:G1000",
      });
      const rows = response.data.values;
      if (rows && rows.length > 0) {
        sheetTodos = rows.map((row) => ({
          id: row[0] || "",
          text: row[1] || "",
          priority: (row[2] || "medium") as TodoItem["priority"],
          dueDate: row[3] || undefined,
          completed: row[4] === "TRUE" || row[4] === "true",
          createdAt: row[5] || new Date().toISOString(),
          completedAt: row[6] || undefined,
        }));
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn("Could not read sheet for merge:", msg);
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const preservedTodos = sheetTodos.filter((st) => {
      if (!st.completed) return false;
      const completionDate = st.completedAt ? new Date(st.completedAt) : new Date(st.createdAt);
      return completionDate < sevenDaysAgo;
    });

    const clientIds = new Set(todos.map((t: TodoItem) => t.id));
    const mergedTodos = [
      ...todos,
      ...preservedTodos.filter((pt) => !clientIds.has(pt.id)),
    ];

    const todoRows = [
      ["ID", "Title", "Priority", "Deadline", "Done", "CreatedAt", "CompletedAt"],
      ...mergedTodos.map((t: TodoItem) => [
        sanitizeForSheets(t.id || ""),
        sanitizeForSheets(t.text || ""),
        sanitizeForSheets(t.priority || "medium"),
        sanitizeForSheets(t.dueDate || ""),
        t.completed ? "TRUE" : "FALSE",
        sanitizeForSheets(t.createdAt || new Date().toISOString()),
        sanitizeForSheets(t.completedAt || ""),
      ])
    ];

    await writeSheetAtomic(sheets, spreadsheetId, "Todos", todoRows, "G", "RAW");

    return NextResponse.json({
      status: "success",
      message: "Successfully synchronized Todos with Google Sheets!",
    });
  } catch (error) {
    console.error("Todos POST error:", error);
    return NextResponse.json({ error: "Failed to write Todos to Google Sheets" }, { status: 500 });
  }
}
