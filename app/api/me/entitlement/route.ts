import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL, SESSION_COOKIE } from "@/lib/session";

// GET /api/me/entitlement → backend GET /api/v1/me/entitlement (session auth).
// Reads the httpOnly session cookie and forwards it as a bearer token.
export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/me/entitlement`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Entitlement API error:", error);
    return NextResponse.json(
      { detail: "Failed to connect to server" },
      { status: 500 },
    );
  }
}
