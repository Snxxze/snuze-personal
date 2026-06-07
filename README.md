# Snuze — Personal

โปรเจกต์ **Snuze** แดชบอร์ดส่วนตัวที่รวมทุกอย่างที่ผมต้องการรู้ในวันนั้นไว้ในหน้าเดียว และ Gemini AI ในการช่วยหาข้อมูล

แอปพลิเคชันนี้ใช้งานบนมือถือเป็นหลัก และการจัดเก็บข้อมูลออนไลน์ผ่าน Google Sheets เป็นฐานข้อมูลหลัก ซึ่งในอนาคตคาดว่าจะพัฒนาระบบ SQL Database เมื่อข้อมูลเริ่มเยอะ และซับซ้อนขึ้น

---

## ฟีเจอร์หลัก (Main Features)

1.  **🧠 AI Daily Summary & Greeting:** สรุปรายการงานประจำวันและราคาหุ้น พร้อมคำทักทายจาก Gemini AI
2.  **📋 Task Management (Todos):** สร้าง แก้ไข ทำเครื่องหมายเสร็จสิ้น และมีระบบแยกหน้าประวัติงานย้อนหลัง (`/todo/history`) เพื่อไม่ให้หน่วยความจำเต็ม
3.  **📝 Smart Note Capture:** จดบันทึกย่อทางความคิด ค้นหาโน้ตแบบทันใจบนเบราว์เซอร์
4.  **⚡ Quick Capture Smart Bar:** ช่องกรอกข้อมูลด่วนหน้าแรก พิมพ์แบบภาษาพูด (เช่น *"ทำการบ้านด่วนพรุ่งนี้"*) แล้วระบบจะวิเคราะห์แยกประเภทให้ว่าเป็น Note หรือ Todo (มี priority และ deadline ให้ด้วย!)
5.  **📈 Stock Watchlist:** ติดตามราคาและความเคลื่อนไหวของพอร์ตหุ้นหลักๆ ของผม
6.  **📰 AI News Feed:** ติดตามข่าวสารเทคโนโลยีเด่นประจำวัน 

---

## เทคโนโลยีที่เราเลือกใช้ (Tech Stack)

*   **Core:** Next.js (App Router) + TypeScript
*   **Styling & Animation:** Tailwind CSS v4 + Framer Motion (สำหรับแอนิเมชันเปิดปิด ลื่นไหลสไตล์ iOS)
*   **Database Sync:** Google Sheets API v4 (ซิงค์ตารางงานและโน้ตฟรี 100%)
*   **AI Engine:** Google Generative AI (Gemini 3.5 Flash / 1.5 Flash ผ่าน Google AI Studio)
*   **Icons:** Lucide React

---

## วิธีรันโปรเจกต์ในเครื่องเครื่องตัวเอง (Local Setup)

### 1. โคลนและติดตั้ง Dependencies
```bash
# ติดตั้ง Library ต่างๆ
npm install
```

### 2. คัดลอกและตั้งค่า Environment Variables
ทำการก็อปปี้ไฟล์ตัวอย่างและแก้ไขเป็นข้อมูลของคุณในไฟล์ `.env.local`
```bash
# คัดลอกสร้างไฟล์ env
cp .env.example .env.local
```

### 3. รัน Development Server
```bash
npm run dev
```
เปิดบราวเซอร์เข้าไปที่ **[http://localhost:3000](http://localhost:3000)** 

---

## วิธีเซ็ตอัพฐานข้อมูล Google Sheets (สำหรับซิงค์ข้อมูล)

เพื่อสิทธิ์การเขียนและอ่านตารางงาน/โน้ตลง Google Sheets ของคุณเองฟรีๆ ให้ทำตามนี้ครับ:

1.  **สร้าง Google Sheet ใหม่:** ตั้งชื่อแผ่นงานแรกว่า `Todos` และแผ่นที่สองว่า `Notes`
2.  **เอา ID ของชีตมาใช้งาน:** สังเกตบน URL ของเบราว์เซอร์ `https://docs.google.com/spreadsheets/d/[ID_ตรงนี้]/edit` ให้คัดลอกส่วน ID มาใส่ที่ตัวแปร `GOOGLE_SPREADSHEET_ID` ในไฟล์ `.env.local`
3.  **สร้าง Service Account คีย์:** 
    *   เข้าไปที่ [Google Cloud Console](https://console.cloud.google.com/) สร้างโปรเจกต์ใหม่และเปิดใช้งาน **Google Sheets API**
    *   สร้าง **Service Account** และกดปุ่ม **Manage Keys** -> **Add Key** -> เลือกประเภท **JSON**
    *   คุณจะได้ไฟล์ดาวน์โหลด ให้ก๊อปปี้อีเมลลงตัวแปร `GOOGLE_SERVICE_ACCOUNT_EMAIL` และก๊อปปี้คีย์ลง `GOOGLE_PRIVATE_KEY`
4.  **กดแชร์สิทธิ์ชีต (สำคัญมาก!):** กดปุ่ม Share บน Google Sheet ของคุณ แล้วแชร์ให้สิทธิ์การเขียน (Editor) ไปยังอีเมลของ Service Account ด้านบน

---

## ระบบรักษาความปลอดภัยและการล็อกอิน (Security & Auth)

แอปนี้รองรับระบบล็อกอินส่วนตัวรหัสผ่านเดียว (**Single-User Login**) โดยเปิดใช้งานได้ง่ายๆ:
*   ระบุรหัสผ่านของคุณในตัวแปร `SNUZE_PASSWORD` และใส่โทเค็นสุ่มยาวๆ ใน `SNUZE_API_SECRET` ในไฟล์ `.env.local`
*   เมื่อระบุรหัสผ่านแล้ว หน้าล็อกอินแบบ Glassmorphic ดีไซน์สวยงามจะทำงานบังคับป้อนรหัสทันทีก่อนใช้ระบบ
*   **API Hardening:** ระบบหลังบ้าน API ทั้งหมดมีการตรวจสิทธิ์ `x-snuze-token`, กรองช่องโหว่ Prompt Injection, ปิดบัง System Technical Error ไม่ให้รั่วไหลไปฝั่ง Client และมีระเบียบจำกัดขนาดข้อมูลเข้าไม่ให้บวมครับ

---

## ระบบแคชบนเครื่อง (Local Storage Design)

เพื่อความเร็วสูงสุด แอปจะเก็บข้อมูลเหล่านี้ไว้ใน `localStorage` ของเบราว์เซอร์:
*   `snuze_auth_token`: โทเค็นเข้ารหัสยืนยันสิทธิ์สำหรับยิงเรียกหลังบ้าน API
*   `snuze_todos`: แคชข้อมูลรายการงานเฉพาะ **งานที่ค้างอยู่** และ **งานเสร็จสิ้นภายใน 7 วันล่าสุด** เพื่อประหยัดพื้นที่จัดเก็บไม่ให้ล้นขีดจำกัดเบราว์เซอร์
*   `snuze_notes`: แคชรายการสมุดจดบันทึกย้อนหลังล่าสุด
*   `snuze_stocks`: แคชรายการและราคาหุ้นล่าสุด
*   `snuze_ai_summary_cache`: แคชคำทักทายเช้าจาก AI เพื่อประหยัด RPM/RPD โควต้า Gemini Free Key
*   `snuze_use_ai_capture`: ค่าเปิด/ปิด การใช้ AI แปลความหมายคำพูดใน Quick Capture

---