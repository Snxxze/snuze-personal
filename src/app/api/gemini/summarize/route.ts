import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { cookies } from "next/headers";
import { safeCompare, getExpectedSessionToken } from "@/lib/sheets-sanitize";

export async function POST(request: Request) {
  let responseText = "";
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
      stocksWithHoldings,
      portfolioSummary,
      text,
      news,
    } = body;

    if (text && (typeof text !== "string" || text.trim() === "")) {
      return NextResponse.json({ error: "Invalid input: 'text' must be a non-empty string" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "missing_api_key", message: "กรุณากำหนด GEMINI_API_KEY ในไฟล์ .env.local" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { responseMimeType: "application/json" }
    });

    const portfolioValueTHB = portfolioSummary?.totalValueTHB || 0;
    const totalProfitLossTHB = portfolioSummary?.totalProfitLossTHB || 0;
    const totalProfitLossPct = portfolioSummary?.totalProfitLossPct || 0;
    const portfolioText = portfolioValueTHB > 0
      ? `มูลค่าพอร์ตรวม: ฿${Math.round(portfolioValueTHB).toLocaleString()} (ผลตอบแทนสะสมของพอร์ตทั้งหมด: ${totalProfitLossTHB >= 0 ? "+" : ""}฿${Math.round(totalProfitLossTHB).toLocaleString()}, คิดเป็น ${totalProfitLossPct >= 0 ? "+" : ""}${totalProfitLossPct.toFixed(2)}%)`
      : "";

    let stocksText = "ไม่มีรายการหุ้นที่ถือครอง";
    if (Array.isArray(stocksWithHoldings) && stocksWithHoldings.length > 0) {
      stocksText = stocksWithHoldings.map((s: any) => {
        return `- หุ้น ${s.symbol} (${s.name || ""}): ถืออยู่ ${s.shares || 0} หุ้น, ราคาตลาดปัจจุบัน $${s.price || 0}, ต้นทุนเฉลี่ยของคุณ $${s.avgCost || 0}, วันนี้เปลี่ยนแปลง ${s.changePct >= 0 ? "+" : ""}${Number(s.changePct).toFixed(2)}%`;
      }).join("\n");
      if (portfolioText) {
        stocksText = portfolioText + "\n" + stocksText;
      }
    }

    const truncatedNews = typeof news === "string" ? news.substring(0, 2500) : "";

    // Sort and filter stocks: Select 2 top gainers and 2 top losers
    let targetSymbolsStr = "ทุกตัว";
    if (Array.isArray(stocksWithHoldings) && stocksWithHoldings.length > 0) {
      const sortedByGain = [...stocksWithHoldings].sort((a, b) => b.changePct - a.changePct);
      const top2Gainers = sortedByGain.slice(0, 2);
      
      const sortedByLoss = [...stocksWithHoldings].sort((a, b) => a.changePct - b.changePct);
      const top2Losers = sortedByLoss
        .filter((s) => !top2Gainers.some((g) => g.symbol === s.symbol))
        .slice(0, 2);
        
      const selectedStocks = [...top2Gainers, ...top2Losers];
      targetSymbolsStr = selectedStocks.map(s => s.symbol).join(", ");
    }

    const prompt = `คุณคือระบบวิเคราะห์กลยุทธ์การลงทุนและบริหารความเสี่ยงระดับมืออาชีพประจำแอป Snuze (สวมบทบาทนักวิเคราะห์การเงินระดับโลก น้ำเสียงจริงจัง เป็นทางการ อ้างอิงสถิติ ตัวเลข และข้อเท็จจริง)
    กรุณาประเมินพอร์ตการลงทุนและวิเคราะห์ข่าวสารล่าสุดเพื่อช่วยเหลือผู้ใช้ในการจัดการแผนความเสี่ยง
    
    ข้อมูลพอร์ตการลงทุนจริงของผู้ใช้:
    ${stocksText}
    
    ข้อมูลข่าวสารเด่นประจำวัน:
    ${truncatedNews || "ไม่มีรายงานข่าวสารล่าสุดในขณะนี้"}

    ---
    กติกาและผลลัพธ์ที่ต้องการ (ต้องปฏิบัติตามอย่างเคร่งครัด):
    กรุณาส่งคำตอบกลับมาเป็นข้อมูลโครงสร้าง JSON เท่านั้น โดยห้ามมีข้อความอื่นใดภายนอกบล็อก JSON และห้ามใช้โครงสร้างอื่นใดนอกเหนือจากคีย์หลักที่กำหนดดังนี้:
    
    {
      "healthScore": <ตัวเลขจำนวนเต็ม 0-100 ประเมินคะแนนสุขภาพพอร์ตการลงทุนโดยรวมจากความเสี่ยงและการกระจายตัว>,
      "healthLabel": "<ข้อความสั้น 1-2 คำ อธิบายระดับสุขภาพพอร์ต เช่น 'ยอดเยี่ยม', 'สมดุล', 'กระจุกตัวสูง', 'ความเสี่ยงสูง'>",
      "portfolioAnalysis": "<ข้อความสรุปการวิเคราะห์สัดส่วนพอร์ตและความเคลื่อนไหวของราคาเทียบกับต้นทุนเฉลี่ยของผู้ใช้ สั้นกระชับ 2 ประโยค>",
      "diversificationAlert": "<ข้อความวิเคราะห์ความกระจายความเสี่ยง เช่น การเตือนหากถือหุ้นกลุ่มเดียวกันมากเกินไป สั้นกระชับ 1-2 ประโยค>",
      "newsImpacts": [
        {
          "symbol": "<สัญลักษณ์หุ้นในพอร์ตที่ได้รับผลกระทบจากข่าว เช่น AAPL>",
          "newsTitle": "<หัวข้อข่าวสารย่อยที่มีผลต่อหุ้นตัวนี้>",
          "impact": "<html หรือข้อความระบุประเภทผลกระทบ: เลือกเฉพาะ 'bullish' (เชิงบวก), 'bearish' (เชิงลบ) หรือ 'neutral' (คงที่/ทั่วไป)>",
          "reason": "<คำอธิบายสั้น ๆ 1 ประโยคว่าข่าวส่งผลกระทบต่อหุ้นอย่างไร>"
        }
      ],
      "actionableRecommendations": [
        {
          "symbol": "<สัญลักษณ์หุ้นในพอร์ต เช่น NVDA>",
          "action": "<คำแนะนำกลยุทธ์: เลือกเฉพาะ 'buy' (ซื้อสะสม), 'sell' (พิจารณาขายทำกำไร/ลดความเสี่ยง) หรือ 'hold' (ถือครองต่อ)>",
          "tip": "<คำอธิบายคำแนะนำเชิงตัวเลข แนวรับแนวต้าน หรือจุดตั้งรับเมื่อเทียบกับต้นทุนเฉลี่ยของผู้ใช้ สั้นกระชับ 1 ประโยค>"
        }
      ]
    }

    ข้อกำหนดด้านโครงสร้าง JSON (สำคัญมาก):
    1. ห้ามใช้เครื่องหมายอัญประกาศคู่ (double quotes) ซ้อนกันในค่าฟิลด์ที่เป็นสตริงเด็ดขาด หากจำเป็นต้องใช้คำพูดหรืออ้างอิงข้อความย่อยภายในฟิลด์ใดก็ตาม ให้ใช้เครื่องหมายอัญประกาศเดี่ยว (single quotes) แทนเสมอ เพื่อไม่ให้โครงสร้าง JSON เสียหาย
    2. รูปแบบ JSON จะต้องถูกต้องและผ่านการตรวจสอบ parse ได้ 100%
    3. สำหรับฟิลด์ "newsImpacts" และ "actionableRecommendations" ให้ประเมินและแสดงผลเฉพาะหุ้นกลุ่มผันผวนเด่นเหล่านี้เท่านั้น: **${targetSymbolsStr}** (ห้ามใส่หุ้นตัวอื่นนอกจากสัญลักษณ์ที่กำหนดนี้ในสองฟิลด์ดังกล่าวเด็ดขาด)`;

    let result;
    try {
      result = await model.generateContent(prompt);
    } catch (apiError) {
      console.warn(`Gemini model "${modelName}" failed. Falling back to stable "gemini-2.5-flash" in JSON mode...`, apiError);
      if (modelName !== "gemini-2.5-flash") {
        const fallbackModel = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
          generationConfig: { responseMimeType: "application/json" }
        });
        result = await fallbackModel.generateContent(prompt);
      } else {
        throw apiError;
      }
    }
    
    responseText = result.response.text().trim();
    
    const firstBrace = responseText.indexOf("{");
    const lastBrace = responseText.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      responseText = responseText.substring(firstBrace, lastBrace + 1);
    }

    const parsedData = JSON.parse(responseText);
    return NextResponse.json({ summary: parsedData, isMock: false });
  } catch (error) {
    console.error("Gemini summarize API error:", error);
    if (responseText) {
      console.error("Raw response text was:", responseText);
    }
    const errorStatus = error && typeof error === "object" && "status" in error ? (error as { status?: number }).status : undefined;
    const errorMessage = error instanceof Error ? error.message : "";
    const isRateLimit = errorStatus === 429 || errorMessage.includes("429") || errorMessage.includes("Quota exceeded");
    return NextResponse.json(
      { 
        error: isRateLimit ? "rate_limit_exceeded" : "internal_server_error", 
        message: isRateLimit 
          ? "โควต้าการใช้งาน Gemini API เต็มแล้ว กรุณาลองใหม่อีกครั้งภายหลัง" 
          : "เกิดข้อผิดพลาดในการวิเคราะห์พอร์ตการลงทุนด้วย AI"
      },
      { status: isRateLimit ? 429 : 500 }
    );
  }
}
