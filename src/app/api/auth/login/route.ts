import { NextResponse } from "next/server";

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
      const token = process.env.SNUZE_API_SECRET || correctPassword;
      return NextResponse.json({ token });
    }

    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  } catch (error) {
    console.error("Auth login API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
