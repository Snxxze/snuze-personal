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
    const {
      activeCount,
      highPriorityCount,
      highPriorityTasks,
      stocksWithHoldings,
      recentNotes,
      portfolioSummary,
      text,
      news,
    } = body;

    if (text && (typeof text !== "string" || text.trim() === "")) {
      return NextResponse.json({ error: "Invalid input: 'text' must be a non-empty string" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      if (text) {
        const shortSummary = `AI สรุป: ข้อมูลระบุถึงความก้าวหน้าล่าสุดทางเทคโนโลยีที่มีการประมวลผลเพิ่มขึ้น ช่วยลดต้นทุนลงได้อย่างมีนัยสำคัญและเพิ่มประสิทธิภาพการทำงานให้กับกลุ่มเป้าหมาย`;
        return NextResponse.json({ summary: shortSummary, isMock: true });
      }

      const portfolioValueTHB = portfolioSummary?.totalValueTHB || 0;
      const totalProfitLossTHB = portfolioSummary?.totalProfitLossTHB || 0;
      const totalProfitLossPct = portfolioSummary?.totalProfitLossPct || 0;
      const portfolioText = portfolioValueTHB > 0
        ? `พอร์ตรวม: ฿${Math.round(portfolioValueTHB).toLocaleString()} (ผลตอบแทนสะสม: ${totalProfitLossTHB >= 0 ? "+" : ""}฿${Math.round(totalProfitLossTHB).toLocaleString()}, ${totalProfitLossPct >= 0 ? "+" : ""}${totalProfitLossPct.toFixed(2)}%)`
        : "ไม่มีข้อมูลมูลค่าพอร์ตการลงทุนในขณะนี้";

      let highlightsText = "- ไม่มีหุ้นที่ถือครองในขณะนี้";
      if (Array.isArray(stocksWithHoldings) && stocksWithHoldings.length > 0) {
        const sorted = [...stocksWithHoldings].sort((a, b) => b.changePct - a.changePct);
        const topG = sorted[0];
        const topL = sorted[sorted.length - 1];
        
        let highlights = "";
        if (topG) {
          const label = topG.changePct >= 0 ? "บวกสูงสุด" : "ลบต่ำสุด";
          highlights += `- ตัวเด่นฝั่ง${label}: ${topG.symbol} ${topG.changePct >= 0 ? "+" : ""}${Number(topG.changePct).toFixed(2)}%\n`;
        }
        if (topL && topL.symbol !== topG.symbol) {
          if (topL.changePct < 0) {
            highlights += `- ตัวเด่นฝั่งลบสูงสุด: ${topL.symbol} ${topL.changePct.toFixed(2)}%\n`;
          } else {
            highlights += `- ตัวเด่นฝั่งลบสูงสุด: ไม่มีหุ้นติดลบในพอร์ตวันนี้\n`;
          }
        } else if (stocksWithHoldings.length === 1) {
          if (topG.changePct >= 0) {
            highlights += `- ตัวเด่นฝั่งลบสูงสุด: ไม่มีหุ้นติดลบในพอร์ตวันนี้\n`;
          }
        }
        highlightsText = highlights.trim();
      }

      const notesText = Array.isArray(recentNotes) && recentNotes.length > 0
        ? recentNotes.map((n: any) => `- ${n.title ? n.title + ": " : ""}${n.content.substring(0, 50)}...`).join("\n")
        : "- ไม่มีบันทึกโน้ตย่อล่าสุด";

      const simulatedSummary = `🌱 **บทวิเคราะห์พอร์ตโฟลิโอ**
${portfolioText}

💡 **ประเมินแนวคิดการลงทุน**
${notesText}

🎯 **การประเมินความเสี่ยงและคำแนะนำ**
[บทวิเคราะห์ข่าวสารจำลองออฟไลน์] แนะนำติดตามทิศทางข่าวสารเศรษฐกิจล่าสุดอย่างระมัดระวัง สำหรับกลุ่มหุ้นชิปเซ็ตและนวัตกรรม AI ที่มีความผันผวนสูง ควรตั้งรับและรักษาเงินสดสำรอง 15% เพื่อสู้กับเงินเฟ้อ

📈 **ความเคลื่อนไหวรายตัว**
${highlightsText}`;

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
      const tasksListText = Array.isArray(highPriorityTasks) && highPriorityTasks.length > 0
        ? highPriorityTasks.map((t: string) => `- ${t}`).join("\n")
        : "ไม่มีงานด่วนสำคัญพิเศษ";

      const portfolioValueTHB = portfolioSummary?.totalValueTHB || 0;
      const totalProfitLossTHB = portfolioSummary?.totalProfitLossTHB || 0;
      const totalProfitLossPct = portfolioSummary?.totalProfitLossPct || 0;
      const portfolioText = portfolioValueTHB > 0
        ? `มูลค่าพอร์ตรวม: ฿${Math.round(portfolioValueTHB).toLocaleString()} (ผลตอบแทนสะสมของพอร์ตทั้งหมด: ${totalProfitLossTHB >= 0 ? "+" : ""}฿${Math.round(totalProfitLossTHB).toLocaleString()}, คิดเป็น ${totalProfitLossPct >= 0 ? "+" : ""}${totalProfitLossPct.toFixed(2)}%)\n`
        : "";

      let stocksText = "ไม่มีรายการหุ้นที่ถือครอง";
      if (Array.isArray(stocksWithHoldings) && stocksWithHoldings.length > 0) {
        const sorted = [...stocksWithHoldings].sort((a, b) => b.changePct - a.changePct);
        const topG = sorted[0];
        const topL = sorted[sorted.length - 1];
        
        const topGLabel = topG.changePct >= 0 ? "บวกสูงสุด" : "ลบต่ำสุด";
        let highlights = "หุ้นที่มีความเคลื่อนไหวโดดเด่นวันนี้:\n";
        if (topG) {
          highlights += `- ตัวเด่นฝั่ง${topGLabel}: ${topG.symbol} ${topG.changePct >= 0 ? "+" : ""}${Number(topG.changePct).toFixed(2)}%\n`;
        }
        if (topL && topL.symbol !== topG.symbol) {
          if (topL.changePct < 0) {
            highlights += `- ตัวเด่นฝั่งลบสูงสุด: ${topL.symbol} ${Number(topL.changePct).toFixed(2)}%\n`;
          } else {
            highlights += `- ตัวเด่นฝั่งลบสูงสุด: ไม่มีหุ้นติดลบในพอร์ตวันนี้\n`;
          }
        } else if (stocksWithHoldings.length === 1) {
          if (topG.changePct >= 0) {
            highlights += `- ตัวเด่นฝั่งลบสูงสุด: ไม่มีหุ้นติดลบในพอร์ตวันนี้\n`;
          }
        }
        stocksText = portfolioText + highlights.trim();
      }

      const notesText = Array.isArray(recentNotes) && recentNotes.length > 0
        ? recentNotes.map((n: any) => `- ${n.title ? n.title + ": " : ""}${n.content.substring(0, 80)}`).join("\n")
        : "ไม่มีบันทึกโน้ตล่าสุด";

      prompt = `คุณคือระบบวิเคราะห์กลยุทธ์การลงทุนและบริหารความเสี่ยงมืออาชีพประจำแอป Snuze (สวมบทบาทนักวิเคราะห์การเงินระดับโลก น้ำเสียงจริงจัง เป็นทางการ อ้างอิงสถิติ ตัวเลข และข้อเท็จจริงข่าวสารอย่างกระชับและแม่นยำ)
      กรุณาประเมินพอร์ตและให้คำแนะนำแก่นักลงทุนรายนี้ โดยแบ่งออกเป็นหัวข้อและเว้นวรรคบรรทัดให้อ่านง่ายสไตล์โมเดิร์นมินิมอลตามข้อมูลดังนี้:
      - ข้อมูลความมั่งคั่งและรายละเอียดผลตอบแทนพอร์ตหุ้นของผู้ใช้:
      ${stocksText}
      - ข้อมูลข่าวสารเด่นสำคัญประจำวันล่าสุด:
      ${news || "ไม่มีรายงานข่าวสารล่าสุดในขณะนี้"}
      - บันทึกย่อแนวคิดและเป้าหมายการเงินของผู้ใช้:
      ${notesText}

      ---
      กติกาการวิเคราะห์ (ต้องปฏิบัติตามอย่างเคร่งครัด):
      1. เขียนสรุปวิเคราะห์ออกมาเป็น 4 ส่วน โดยคั่นแต่ละส่วนด้วยการขึ้นบรรทัดใหม่:
        - ส่วนที่ 1: 🌱 **บทวิเคราะห์พอร์ตโฟลิโอ**: ประเมินสถานะโดยรวมและมูลค่าผลตอบแทนสะสมของพอร์ตหุ้นในปัจจุบัน (ใช้ภาษาข้อเท็จจริง กระชับ 1-2 ประโยค)
        - ส่วนที่ 2: 💡 **ประเมินแนวคิดการลงทุน**: วิเคราะห์ความเชื่อมโยงระหว่างโน้ตแนวคิดทางการเงินล่าสุดของผู้ใช้ กับสัดส่วนหุ้นที่มีอยู่จริง เพื่อดูความสอดคล้องของกลยุทธ์ส่วนตัว
        - ส่วนที่ 3: 🎯 **การประเมินความเสี่ยงและคำแนะนำ**: วิเคราะห์ผลกระทบและความเสี่ยงที่หุ้นในพอร์ตอาจได้รับจากข่าวเด่นรอบวันล่าสุด พร้อมให้คำแนะนำเชิงกลยุทธ์ที่คมคายและเป็นรูปธรรม
        - ส่วนที่ 4: 📈 **ความเคลื่อนไหวรายตัว**: ระบุหุ้นเด่นวันนี้ทั้ง 2 ฝั่งออกมาเป็นหัวข้อย่อยแบบจุดนำ (bullet point) 2 บรรทัดเสมอในรูปแบบ:
          - ตัวเด่นฝั่งบวกสูงสุด: SYMBOL +X.XX% (หรือใช้หัวข้อ "ตัวเด่นฝั่งลบต่ำสุด" หากในพอร์ตมีแต่หุ้นติดลบ)
          - ตัวเด่นฝั่งลบสูงสุด: SYMBOL -X.XX% (หากไม่มีหุ้นตัวใดติดลบเลย ให้แสดงว่า "- ตัวเด่นฝั่งลบสูงสุด: ไม่มีหุ้นติดลบในพอร์ตวันนี้")
      2. ห้ามใช้น้ำเสียงสไตล์ Zen, ห้ามใช้หลักธรรมคำสอนเรื่องจิตใจ หรือจิตวิญญาณเด็ดขาด เน้นความรู้เชิงเศรษฐกิจ การเงิน และข้อมูลตัวเลขจริง
      3. ห้ามใช้คำฟุ่มเฟือย กระชับ สั้น และตรงประเด็น เหมาะสำหรับอ่านบนมือถือใน 10 วินาที
      4. ใช้อิโมจิที่กำหนดให้ถูกต้องในการระบุหัวข้อ
      5. อย่าใช้ข้อความ Markdown โครงสร้างอื่นนอกจากตัวหนา (เช่น **หัวข้อ**) และย่อหน้าทั่วไป ห้ามทำตาราง`;
    }

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    return NextResponse.json({ summary: responseText, isMock: false });
  } catch (error) {
    console.error("Gemini summarize API error:", error);
    const errorStatus = error && typeof error === "object" && "status" in error ? (error as { status?: number }).status : undefined;
    const errorMessage = error instanceof Error ? error.message : "";
    const isRateLimit = errorStatus === 429 || errorMessage.includes("429") || errorMessage.includes("Quota exceeded");
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
