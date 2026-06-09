import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const isRequired = !!process.env.SNUZE_PASSWORD;
  if (!isRequired) {
    return NextResponse.json({ required: false, authenticated: true });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("snuze_session")?.value;
  const expectedToken = process.env.SNUZE_API_SECRET || process.env.SNUZE_PASSWORD;

  const isAuthenticated = !!token && token === expectedToken;

  return NextResponse.json({
    required: true,
    authenticated: isAuthenticated,
  });
}
