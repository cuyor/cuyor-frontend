import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL, SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { detail: data.detail || "Login failed" },
        { status: response.status },
      );
    }

    // Keep the session token server-side only: store it in an httpOnly cookie
    // and never hand it back to client JS.
    const { session_token, ...safe } = data;
    const res = NextResponse.json(safe);
    if (session_token) {
      res.cookies.set(SESSION_COOKIE, session_token, sessionCookieOptions);
    }
    return res;
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { detail: "Failed to connect to server" },
      { status: 500 },
    );
  }
}
