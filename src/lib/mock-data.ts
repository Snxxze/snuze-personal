import type { NewsItem } from "@/types";

export const MOCK_NEWS: NewsItem[] = [
  {
    id: "1",
    title: "Google เปิดตัว Gemini 1.5 Pro โดดเด่นด้วย Context Window กว้างถึง 2 ล้านโทเค็น วิเคราะห์วิดีโอ 1 ชั่วโมงได้สบาย",
    source: "Google AI Blog",
    time: "3 ชั่วโมงที่แล้ว",
    url: "https://blog.google"
  },
  {
    id: "2",
    title: "NVIDIA เผยผลประกอบการพุ่งกระฉูด 260% จากความต้องการชิป Blackwell ทั่วโลกสำหรับฟาร์ม AI ขนาดใหญ่",
    source: "TechCrunch",
    time: "6 ชั่วโมงที่แล้ว",
    url: "https://techcrunch.com"
  },
  {
    id: "3",
    title: "OpenAI ปล่อยอัปเดต GPT-4o รองรับฟังก์ชันโต้ตอบเสียงแบบเนทีฟแบบเรียลไทม์ เลียนแบบอารมณ์มนุษย์ได้อย่างไม่น่าเชื่อ",
    source: "OpenAI News",
    time: "1 วันที่แล้ว",
    url: "https://openai.com"
  }
];
