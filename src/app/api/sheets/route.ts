import { NextResponse } from "next/server";
import { google } from "googleapis";

function getSheetsClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

  if (!email || !privateKey || !spreadsheetId) {
    return null;
  }

  try {
    const auth = new google.auth.JWT({
      email,
      key: privateKey.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    return {
      sheets: google.sheets({ version: "v4", auth }),
      spreadsheetId,
    };
  } catch (error) {
    console.error("Failed to initialize Google Sheets client:", error);
    return null;
  }
}

async function ensureSheetsExist(sheets: any, spreadsheetId: string) {
  try {
    const metadata = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetNames = metadata.data.sheets?.map((s: any) => s.properties?.title) || [];
    
    const requests: any[] = [];
    if (!sheetNames.includes("Todos")) {
      requests.push({
        addSheet: {
          properties: { title: "Todos" }
        }
      });
    }
    if (!sheetNames.includes("Notes")) {
      requests.push({
        addSheet: {
          properties: { title: "Notes" }
        }
      });
    }

    if (requests.length > 0) {
      console.log("Creating missing Google Sheets tabs:", requests.map(r => r.addSheet.properties.title));
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: { requests }
      });
    }
  } catch (error) {
    console.error("Failed to check or create Google Sheets tabs:", error);
    throw error;
  }
}

// GET /api/sheets 
export async function GET(request: Request) {
  const isPasswordEnabled = !!process.env.SNUZE_PASSWORD;
  if (isPasswordEnabled) {
    const token = request.headers.get("x-snuze-token");
    const expectedToken = process.env.SNUZE_API_SECRET || process.env.SNUZE_PASSWORD;
    if (!token || token !== expectedToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const client = getSheetsClient();

  if (!client) {
    return NextResponse.json({
      status: "unconfigured",
      message: "Google Sheets environment variables are not set. Running in LocalStorage-only mode.",
      todos: [],
      notes: []
    });
  }

  const { sheets, spreadsheetId } = client;

  try {
    await ensureSheetsExist(sheets, spreadsheetId);

    let todos: any[] = [];
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
          priority: row[2] || "medium",
          dueDate: row[3] || undefined,
          completed: row[4] === "TRUE" || row[4] === "true",
          createdAt: row[5] || new Date().toISOString(),
          completedAt: row[6] || undefined,
        }));
      }
    } catch (e: any) {
      console.warn("Sheet 'Todos' might not exist yet. It will be created during POST sync.", e.message);
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

    let notes: any[] = [];
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "Notes!A2:C500",
      });
      const rows = response.data.values;
      if (rows && rows.length > 0) {
        notes = rows.map((row) => ({
          id: row[0],
          content: row[1],
          createdAt: row[2] || new Date().toISOString(),
        }));
      }
    } catch (e: any) {
      console.warn("Sheet 'Notes' might not exist yet. It will be created during POST sync.", e.message);
    }

    return NextResponse.json({
      status: "success",
      todos,
      notes,
    });

  } catch (error: any) {
    console.error("Google Sheets GET error:", error);
    return NextResponse.json(
      { error: "Failed to read Google Sheets" },
      { status: 500 }
    );
  }
}

// POST /api/sheets 
export async function POST(request: Request) {
  const isPasswordEnabled = !!process.env.SNUZE_PASSWORD;
  if (isPasswordEnabled) {
    const token = request.headers.get("x-snuze-token");
    const expectedToken = process.env.SNUZE_API_SECRET || process.env.SNUZE_PASSWORD;
    if (!token || token !== expectedToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

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
    const { todos, notes } = body;

    if (todos && (!Array.isArray(todos) || todos.length > 500)) {
      return NextResponse.json({ error: "Invalid input: 'todos' must be an array of at most 500 items" }, { status: 400 });
    }
    if (notes && (!Array.isArray(notes) || notes.length > 500)) {
      return NextResponse.json({ error: "Invalid input: 'notes' must be an array of at most 500 items" }, { status: 400 });
    }

    await ensureSheetsExist(sheets, spreadsheetId);

    if (todos && Array.isArray(todos)) {
      let sheetTodos: any[] = [];
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
            priority: row[2] || "medium",
            dueDate: row[3] || undefined,
            completed: row[4] === "TRUE" || row[4] === "true",
            createdAt: row[5] || new Date().toISOString(),
            completedAt: row[6] || undefined,
          }));
        }
      } catch (e: any) {
        console.warn("Could not read sheet for merge, writing fresh instead:", e.message);
      }

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const preservedTodos = sheetTodos.filter((st: any) => {
        if (!st.completed) return false;
        const completionDate = st.completedAt ? new Date(st.completedAt) : new Date(st.createdAt);
        return completionDate < sevenDaysAgo;
      });

      const clientIds = new Set(todos.map((t: any) => t.id));
      const mergedTodos = [
        ...todos,
        ...preservedTodos.filter((pt: any) => !clientIds.has(pt.id)),
      ];

      const todoRows = [
        ["ID", "Title", "Priority", "Deadline", "Done", "CreatedAt", "CompletedAt"],
        ...mergedTodos.map((t: any) => [
          t.id || "",
          t.text || "",
          t.priority || "medium",
          t.dueDate || "",
          t.completed ? "TRUE" : "FALSE",
          t.createdAt || new Date().toISOString(),
          t.completedAt || "",
        ])
      ];

      await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: "Todos!A1:G1000",
      });

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: "Todos!A1",
        valueInputOption: "RAW",
        requestBody: {
          values: todoRows,
        },
      });
    }

    if (notes && Array.isArray(notes)) {
      const noteRows = [
        ["ID", "Content", "CreatedAt"],
        ...notes.map((n: any) => [
          n.id || "",
          n.content || "",
          n.createdAt || new Date().toISOString()
        ])
      ];

      await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: "Notes!A1:C1000",
      });

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: "Notes!A1",
        valueInputOption: "RAW",
        requestBody: {
          values: noteRows,
        },
      });
    }

    return NextResponse.json({
      status: "success",
      message: "Successfully synchronized database with Google Sheets!",
    });

  } catch (error: any) {
    console.error("Google Sheets POST sync error:", error);
    return NextResponse.json(
      { error: "Failed to write to Google Sheets" },
      { status: 500 }
    );
  }
}
