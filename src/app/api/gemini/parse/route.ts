import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { cookies } from "next/headers";
import { safeCompare, getExpectedSessionToken } from "@/lib/sheets-sanitize";

export async function POST(request: Request) {
  try {
    const isPasswordEnabled = !!process.env.SNUZE_PASSWORD;
    if (isPasswordEnabled) {
      const cookieStore = await cookies();
      const token = cookieStore.get("snuze_session")?.value;
      const expectedToken = getExpectedSessionToken();
      if (!token || !safeCompare(token, expectedToken)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const body = await request.json().catch(() => ({}));
    const { text } = body;
    if (!text || typeof text !== "string" || text.trim() === "") {
      return NextResponse.json({ error: "Invalid input: 'text' field is required and must be a non-empty string" }, { status: 400 });
    }

    const sanitizedText = text
      .replace(/["\\\n\r]/g, " ")
      .trim()
      .substring(0, 500);

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const currentDateStr = new Date().toISOString().split("T")[0];
    const dayOfWeek = new Date().toLocaleDateString("en-US", { weekday: "long" });

    const prompt = `You are a smart natural language processor for a personal organizer app.
      Current Date today: ${currentDateStr} (${dayOfWeek}).

      Analyze the following input text in Thai or English and classify it into either a "todo" or a "note".
      Input: "${sanitizedText}"

      Rules:
      1. If the text represents a task to be performed, an action, a meeting, or something that needs to be done, classify it as "todo".
      2. Otherwise, if it is just an idea, random thought, fact, or general information, classify it as "note".
      3. For a "todo":
        - Extract the "title" in its original language, removing any prefixes like "todo:" or priority keywords.
        - Detect the "priority" ("high", "medium", or "low"). If there are words indicating urgency like "ด่วน", "สำคัญมาก", "urgent", "high", set it to "high". If indicating low priority, set to "low". Default to "medium".
        - Detect a "deadline" (in YYYY-MM-DD format). Resolve relative date words like "วันนี้" (today: ${currentDateStr}), "พรุ่งนี้" (tomorrow), "มะรืน" (day after tomorrow), "วันจันทร์หน้า" (next Monday) using the current date provided above. If no deadline is mentioned, omit the deadline field.
      4. For a "note":
        - Extract the clean content in "noteData" field.

      Return a JSON object conforming exactly to this structure:
      {
        "type": "todo" | "note",
        "todoData": {
          "title": "Cleaned task name",
          "priority": "high" | "medium" | "low",
          "deadline": "YYYY-MM-DD" (optional)
        },
        "noteData": "Cleaned note text" (only if type is "note")
      }`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    
    const parsedJson = JSON.parse(responseText);
    return NextResponse.json(parsedJson);

  } catch (error) {
    console.error("Gemini parse API error:", error);
    const errorStatus = error && typeof error === "object" && "status" in error ? (error as { status?: number }).status : undefined;
    const errorMessage = error instanceof Error ? error.message : "";
    const isRateLimit = errorStatus === 429 || errorMessage.includes("429") || errorMessage.includes("Quota exceeded");
    return NextResponse.json(
      { 
        error: isRateLimit ? "rate_limit_exceeded" : "internal_server_error", 
        message: isRateLimit 
          ? "คุณใช้งาน Gemini เกินขีดจำกัดโควต้าฟรีแล้ว ระบบกำลังสลับไปใช้วิธีวิเคราะห์ในเครื่องแทน" 
          : "Failed to parse text via AI"
      },
      { status: isRateLimit ? 429 : 500 }
    );
  }
}
