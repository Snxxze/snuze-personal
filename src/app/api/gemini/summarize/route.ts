import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const isPasswordEnabled = !!process.env.SNUZE_PASSWORD;
    if (isPasswordEnabled) {
      const cookieStore = await cookies();
      const token = cookieStore.get("snuze_session")?.value;
      const expectedToken = process.env.SNUZE_API_SECRET || process.env.SNUZE_PASSWORD;
      if (!token || token !== expectedToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const body = await request.json().catch(() => ({}));
    const { active, highPriority, nvda, text } = body;

    if (text && (typeof text !== "string" || text.trim() === "")) {
      return NextResponse.json({ error: "Invalid input: 'text' must be a non-empty string" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      if (text) {
        const shortSummary = `AI สรุป: ข้อมูลระบุถึงความก้าวหน้าล่าสุดทางเทคโนโลยีที่มีการประมวลผลเพิ่มขึ้น ช่วยลดต้นทุนลงได้อย่างมีนัยสำคัญและเพิ่มประสิทธิภาพการทำงานให้กับกลุ่มเป้าหมาย`;
        return NextResponse.json({ summary: shortSummary, isMock: true });
      }

      const simulatedSummary = `อรุณสวัสดิ์ยามเช้า (จำลองด้วยระบบ Local AI) ✨\nวันนี้คุณมีสิ่งที่ต้องทำ ${active || 0} งาน (มีงานด่วนที่สุด ${highPriority || 0} งาน) ตลาดวันนี้ หุ้น NVDA อยู่ที่ ${nvda ? nvda.toFixed(1) : "+3.2"}%\n\nขอให้วันนี้เป็นวันที่สงบและมีพลังในการดำเนินชีวิตในสไตล์ Zen ครับ 🧘‍♂️`;
      return NextResponse.json({ summary: simulatedSummary, isMock: true });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-1.5-flash" });

    let prompt = "";
    if (text) {
      const sanitizedText = text.replace(/["\\\n\r]/g, " ").trim().substring(0, 3000);
      prompt = `คุณคือ AI สรุปข่าวสารอัจฉริยะของแอป Snuze (สไตล์ Neutral Modern Zen น้ำเสียงสงบ สุภาพ กะทัดรัด มีสติ)
กรุณาสรุปบทความข่าวภาษาอังกฤษ/ไทยต่อไปนี้ให้เป็นภาษาไทยสั้นๆ 1-2 ประโยคกระชับที่สุดและตรงประเด็น:
"${sanitizedText}"`;
    } else {
      prompt = `คุณคือระบบวิเคราะห์สรุปความเคลื่อนไหวประจำวันอัจฉริยะของแอป Snuze (สไตล์ Neutral Modern Zen น้ำเสียงอบอุ่น สงบ สุภาพ ให้กำลังใจและพลังบวก)
กรุณาเขียนสรุปทักทายตอนเช้าภาษาไทยสั้นๆ 2-3 บรรทัด โดยสรุปจากข้อมูลเหล่านี้ในโทนชีวิตที่มีระเบียบและผ่อนคลาย:
- มีรายการงานที่ต้องทำทั้งหมดวันนี้ที่ยังไม่เสร็จ: ${Number(active) || 0} งาน
- ในนั้นเป็นงานที่ด่วน/สำคัญมาก: ${Number(highPriority) || 0} งาน
- การเคลื่อนไหวของหุ้นตัวหลัก NVDA วันนี้: ${nvda ? Number(nvda).toFixed(1) : "+3.2"}%
หลีกเลี่ยงการใช้เครื่องหมายคำพูดเยอะๆ หรือประโยคที่ซับซ้อนเกินไป ให้เรียงร้อยเนื้อหาออกมาแบบเป็นธรรมชาติติดต่อกัน`;
    }

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    return NextResponse.json({ summary: responseText, isMock: false });
  } catch (error: any) {
    console.error("Gemini summarize API error:", error);
    const isRateLimit = error.status === 429 || error.message?.includes("429") || error.message?.includes("Quota exceeded");
    return NextResponse.json(
      { 
        error: isRateLimit ? "rate_limit_exceeded" : "internal_server_error", 
        message: isRateLimit 
          ? "โควต้าการสรุปผล Gemini ของวันนี้เต็มแล้ว ระบบได้สลับไปใช้ระบบสรุปข้อมูลในเครื่องแทน" 
          : "Failed to generate AI summary"
      },
      { status: isRateLimit ? 429 : 500 }
    );
  }
}
