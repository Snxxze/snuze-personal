import crypto from "crypto";

export function sanitizeForSheets(value: string): string {
  if (!value) return value;
  if (/^[=\+\-@\t\r\n]/.test(value)) {
    return `'${value}`;
  }
  return value;
}

export function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch (e) {
    console.error("Failed to parse JSON:", e);
    return fallback;
  }
}

export function safeCompare(a: string, b: string): boolean {
  const constantSalt = process.env.SNUZE_API_SECRET || "snuze-constant-salt-for-timing-safe-comparison";
  const aHash = crypto.createHmac("sha256", constantSalt).update(a).digest();
  const bHash = crypto.createHmac("sha256", constantSalt).update(b).digest();
  return crypto.timingSafeEqual(aHash, bHash);
}

export function getExpectedSessionToken(): string {
  const secret = process.env.SNUZE_API_SECRET || process.env.SNUZE_PASSWORD || "";
  return crypto.createHash("sha256").update(secret).digest("hex");
}

