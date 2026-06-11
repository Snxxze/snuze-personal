import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { safeCompare, getExpectedSessionToken } from "@/lib/sheets-sanitize";

export async function GET() {
  const isRequired = !!process.env.SNUZE_PASSWORD;
  if (!isRequired) {
    return NextResponse.json({ required: false, authenticated: true });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("snuze_session")?.value;
  const expectedToken = getExpectedSessionToken();

  const isAuthenticated = !!token && safeCompare(token, expectedToken);

  return NextResponse.json({
    required: true,
    authenticated: isAuthenticated,
  });
}
