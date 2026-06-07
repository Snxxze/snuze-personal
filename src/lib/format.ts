// แปลงวันที่หรือเวลาให้อยู่ในรูปข้อความบอกระยะเวลา
const TIME_UNITS = [
  { label: "y", seconds: 31536000 },
  { label: "mo", seconds: 2592000 },
  { label: "d", seconds: 86400 },
  { label: "h", seconds: 3600 },
  { label: "m", seconds: 60 },
]

export function formatTimeAgo(dataString: string): string {
  const currentTimeStamp = Date.now();
  const targetTimeStamp = new Date(dataString).getTime()

  // เวลาปัจจุบัน (milliseconds)
  // ลบกับเวลาที่ต้องการคำนวณ (milliseconds)
  // แล้วแปลงผลต่างจาก milliseconds → seconds
  const diffInSeconds = Math.floor(
    (currentTimeStamp - targetTimeStamp) / 1000
  )

  if (Number.isNaN(diffInSeconds)) {
    return "Unknown time"
  }

  if (diffInSeconds < 10) {
    return "Just now"
  }

  for (const unit of TIME_UNITS) {
    const value = Math.floor(diffInSeconds / unit.seconds);

    if (value > 0) {
      if (unit.label === "d" && value === 1) {
        return "Yesterday";
      }

      return `${value}${unit.label} ago`;
    }
  }

  return `${diffInSeconds}s ago`;
}

// Mapping ระดับความสำคัญ → ข้อความที่ใช้แสดงบน UI
const PRIORITY_LABELS = {
  high: "ด่วนมาก",
  medium: "ปานกลาง",
  low: "ทั่วไป",
} as const

export type Priority = keyof typeof PRIORITY_LABELS

export function getNotePreview(
  content: string,
  maxLength = 60

): string {
  if (!content) {
    return "";
  }

  if (content.length <= maxLength) {
    return content;
  }

  return `${content.slice(0, maxLength)}...`;
}

/**
 * ตรวจสอบว่า Todo เลยกำหนดส่งหรือไม่
 *
 * Logic:
 * - ไม่มี due date = ไม่ถือว่า overdue
 * - เปรียบเทียบเฉพาะ "วันที่"
 * - หาก due date ก่อนวันปัจจุบัน = overdue
 */
export function isOverdue(
  dueDateString?: string

): boolean {
  if (!dueDateString) {
    return false;
  }

  const dueDate = new Date(dueDateString);

  // ตรวจสอบวันที่ไม่ถูกต้อง
  if (Number.isNaN(dueDate.getTime())) {
    return false;
  }

  const today = new Date();

  // รีเซ็ตเวลาให้เหลือเฉพาะวันที่
  today.setHours(0, 0, 0, 0);

  return dueDate < today;
}

/**
 * แปลงค่า priority เป็นข้อความสำหรับแสดงผลบน UI
 */
export function getPriorityLabel(
  priority: Priority
  
): string {
  return PRIORITY_LABELS[priority];
}

/**
 * แปลงค่าระดับความสำคัญเป็น Variant สำหรับ Badge
 */
export function getPriorityVariant(priority: Priority) {
  const variants = {
    high: "destructive",
    medium: "warning",
    low: "success",
  } as const;
  return variants[priority] || "default";
}