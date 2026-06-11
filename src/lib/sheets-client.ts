import { google, sheets_v4 } from "googleapis";

export interface SheetsClientInfo {
  sheets: sheets_v4.Sheets;
  spreadsheetId: string;
}

export function getSheetsClient(): SheetsClientInfo | null {
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

export async function ensureSheetsExist(sheets: sheets_v4.Sheets, spreadsheetId: string): Promise<void> {
  try {
    const metadata = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetNames = metadata.data.sheets?.map((s) => s.properties?.title) || [];
    
    const requests: sheets_v4.Schema$Request[] = [];
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
    if (!sheetNames.includes("Stocks")) {
      requests.push({
        addSheet: {
          properties: { title: "Stocks" }
        }
      });
    }

    if (requests.length > 0) {
      console.log("Creating missing Google Sheets tabs:", requests.map(r => r.addSheet?.properties?.title));
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

export async function writeSheetAtomic(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
  sheetName: string,
  rows: (string | number | boolean)[][],
  maxColumns: string,
  valueInputOption: "RAW" | "USER_ENTERED" = "RAW"
): Promise<void> {
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!A1`,
    valueInputOption,
    requestBody: {
      values: rows,
    },
  });

  const nextRow = rows.length + 1;
  if (nextRow <= 1000) {
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `${sheetName}!A${nextRow}:${maxColumns}1000`,
    });
  }
}
