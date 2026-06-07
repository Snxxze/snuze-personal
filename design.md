# Snuze Design System & UX Principles

Design System และ UX Guidelines สำหรับ Snuze (Personal AI Dashboard)

แนวคิดหลัก: Japanese Modern Minimalist (Muji-Inspired)

---

# 1. Design Principles

ก่อนเริ่มออกแบบหน้าจอทุกหน้า ให้ยึดหลักการต่อไปนี้เป็นแกนกลาง

## Calm

ลดสิ่งรบกวนสายตาให้มากที่สุด

* ใช้สีเท่าที่จำเป็น
* หลีกเลี่ยงองค์ประกอบตกแต่งที่ไม่ช่วยการใช้งาน
* ใช้พื้นที่ว่าง (Whitespace) เพื่อสร้างความสบายตา

## Focused

หนึ่งหน้าควรมีเป้าหมายหลักเพียงหนึ่งอย่าง

* หนึ่ง Primary Action ต่อหนึ่ง View
* ลดการแข่งขันของปุ่มและองค์ประกอบ

## Predictable

พฤติกรรมของ UI ต้องสม่ำเสมอ

* ปุ่มที่หน้าตาเหมือนกันต้องทำงานเหมือนกัน
* Pattern เดิมต้องถูกใช้ซ้ำทั้งระบบ

## Progressive

แสดงเฉพาะข้อมูลที่จำเป็นก่อน

* รายละเอียดเพิ่มเติมควรถูกเปิดเผยเมื่อผู้ใช้ต้องการ
* ลด Cognitive Load ในทุกหน้าจอ

## Human

สื่อสารเหมือนผู้ช่วยส่วนตัว

* ใช้ภาษาที่เป็นมิตร
* หลีกเลี่ยงข้อความเชิงเทคนิคที่ไม่จำเป็น

---

# 2. Color System

ใช้หลัก 60-30-10 เพื่อรักษาความสงบและความชัดเจนของระบบ

| Role           | Color             | HEX     |
| -------------- | ----------------- | ------- |
| Background     | System Background | #F5F5F7 |
| Surface        | Surface White     | #FFFFFF |
| Text Primary   | Primary Label     | #1D1D1F |
| Text Secondary | Secondary Label   | #6E6E73 |
| Border         | Separator         | #D2D2D7 |
| Accent         | Slate Blue        | #5B6B82 |
| Success        | Forest Green      | #5C715E |
| Warning        | Warm Amber        | #B38A4C |
| Error          | Soft Red          | #C76A6A |

Guidelines

* สี Accent (Slate Blue) ใช้เฉพาะ Action หรือจุดที่ผู้ใช้เลือก (Active State)
* สี Success (Forest Green) ใช้ยืนยันผลลัพธ์ว่าเสร็จสมบูรณ์
* ใช้สีอย่างรอบคอบ คอนทราสต์ตรงตามสากล (AA Contrast) เพื่อให้อ่านง่าย สบายตา
* พื้นที่ส่วนใหญ่ (60%) ควรเป็นสีเทา-ขาวอมฟ้าสะอาดตา (System Background) เพื่อสร้างความโปร่งเบา

---

# 3. Typography

Primary Font

Inter

## Type Scale

| Usage         | Size | Weight   |
| ------------- | ---- | -------- |
| Display       | 32px | Bold     |
| Page Title    | 24px | Bold     |
| Section Title | 18px | Semibold |
| Card Title    | 16px | Semibold |
| Body          | 14px | Regular  |
| Caption       | 12px | Medium   |

Guidelines

* Body Text ห้ามต่ำกว่า 14px
* จำกัดการใช้ Font Weight ไม่เกิน 3 ระดับ
* ใช้ความแตกต่างของขนาดก่อนใช้ความแตกต่างของสี

---

# 4. Spacing System

ใช้ระบบ 8-Point Grid

| Token | Size |
| ----- | ---- |
| XS    | 4px  |
| SM    | 8px  |
| MD    | 16px |
| LG    | 24px |
| XL    | 32px |
| 2XL   | 48px |

Guidelines

* ใช้ค่า Spacing จากชุดนี้เท่านั้น
* หลีกเลี่ยงการใช้ Padding แบบสุ่ม
* เน้นความสม่ำเสมอทั้งระบบ

---

# 5. Elevation System

กำหนดลำดับชั้นของ UI ให้ชัดเจน

| Level | Usage         |
| ----- | ------------- |
| 0     | Background    |
| 1     | Cards         |
| 2     | Sticky Header |
| 3     | Drawers       |
| 4     | Modal         |

Guidelines

* ใช้ Shadow อย่างประหยัด
* อาศัย Contrast และ Spacing ก่อนใช้ Shadow

---

# 6. Layout Architecture

## Mobile First

ระบบถูกออกแบบโดยเริ่มจาก Mobile Experience เป็นหลัก

Responsive Breakpoints

* Mobile: max-w-md
* Tablet: max-w-lg
* Desktop Focus Mode: max-w-xl

## Page Structure

Header

* Sticky Top
* แสดงชื่อหน้าและ Context สำคัญ

Main Content

* Scrollable Area
* รองรับ Dynamic Content

Navigation

* Persistent Bottom Navigation บน Mobile
* Sidebar หรือ Navigation Rail บน Desktop

---

# 7. Surface Design

Glassmorphism ใช้เฉพาะในจุดที่สร้างคุณค่าให้ UX

Recommended

Header

bg-zen-white/80
backdrop-blur-md

Bottom Navigation

bg-white
border-t

Guidelines

* หลีกเลี่ยง Blur หลายชั้น
* เน้นความชัดเจนก่อนความสวยงาม
* Surface ต้องอ่านง่ายในทุกสภาพแสง

---

# 8. Motion Principles

Motion มีไว้เพื่ออธิบายการเปลี่ยนแปลงของระบบ

## Use Motion For

* Add Item
* Delete Item
* Open Drawer
* Switch Tab
* Page Transition

## Avoid Motion For

* Decorative Effects
* Floating Elements
* Continuous Movement
* Unnecessary Hover Effects

Animation Duration

* Fast: 150ms
* Standard: 200ms
* Slow: 300ms

Guidelines

ผู้ใช้ควรเข้าใจการเปลี่ยนแปลงได้โดยไม่ต้องคิด

---

# 9. States & Feedback

ทุก View ต้องรองรับสถานะต่อไปนี้

## Loading

แสดง Skeleton หรือ Progress Indicator

## Empty

อธิบายว่าทำไมข้อมูลยังไม่มี

พร้อม CTA ที่เหมาะสม

## Error

อธิบายปัญหาเป็นภาษาที่เข้าใจง่าย

พร้อม Retry Action

## Success

ยืนยันผลลัพธ์อย่างกระชับ

หลีกเลี่ยง Popup ที่ไม่จำเป็น

---

# 10. Accessibility

Accessibility เป็น Requirement ไม่ใช่ Feature

## Contrast

ต้องผ่าน WCAG AA

ขั้นต่ำ 4.5:1

## Touch Target

ขั้นต่ำ 44x44px

## Keyboard Navigation

ทุก Interactive Element ต้องเข้าถึงได้ด้วย Keyboard

## Focus State

ทุกปุ่มและฟอร์มต้องมี Focus Indicator ที่ชัดเจน

## Screen Readers

ทุก Icon Button ต้องมี Accessible Label

---

# 11. Component Philosophy

ก่อนสร้าง Component ใหม่ ให้ถามเสมอ

1. Component นี้แก้ปัญหาอะไร
2. สามารถใช้ Component เดิมแทนได้หรือไม่
3. ทำให้ผู้ใช้ตัดสินใจง่ายขึ้นหรือยากขึ้น

Rule

Prefer Simplicity Over Creativity

ความเรียบง่ายที่ใช้งานได้จริง สำคัญกว่าความสวยที่ซับซ้อน

---

# 12. Snuze Experience Goal

ผู้ใช้ควรรู้สึกว่า

* ระบบสงบ
* ระบบเชื่อถือได้
* ระบบไม่เร่งเร้า
* ระบบช่วยจัดระเบียบความคิด
* ระบบทำงานเหมือนผู้ช่วยส่วนตัว ไม่ใช่ Dashboard ที่เต็มไปด้วยข้อมูล

Snuze ไม่ได้พยายามดึงความสนใจของผู้ใช้

Snuze ถูกออกแบบมาเพื่อคืนสมาธิให้ผู้ใช้
