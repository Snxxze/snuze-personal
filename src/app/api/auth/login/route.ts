import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getExpectedSessionToken } from "@/lib/sheets-sanitize";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const correctPassword = process.env.SNUZE_PASSWORD;

    if (!correctPassword) {
      return NextResponse.json(
        { error: "Password authentication is not enabled" },
        { status: 400 }
      );
    }

    if (password === correctPassword) {
      const token = getExpectedSessionToken();
      
      const cookieStore = await cookies();
      cookieStore.set("snuze_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24 hours (1 day)
        path: "/",
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });

  } catch (error) {
    console.error("Auth login API error:", error);

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
