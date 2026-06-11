import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { safeCompare, getExpectedSessionToken } from "@/lib/sheets-sanitize";

export async function requireAuth(): Promise<NextResponse | null> {
  const isPasswordEnabled = !!process.env.SNUZE_PASSWORD;
  if (isPasswordEnabled) {
    const cookieStore = await cookies();
    const token = cookieStore.get("snuze_session")?.value;
    const expectedToken = getExpectedSessionToken();
    if (!token || !safeCompare(token, expectedToken)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }
  return null;
}
