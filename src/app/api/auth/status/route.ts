import { NextResponse } from "next/server";

export async function GET() {
  const isRequired = !!process.env.SNUZE_PASSWORD;
  return NextResponse.json({ required: isRequired });
}
