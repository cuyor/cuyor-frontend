import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL, SESSION_COOKIE } from "@/lib/session";

// GET /api/billing/portal → backend GET /api/v1/billing/portal (session auth).
// Returns the Lemon Squeezy Customer Portal URL for the current user.
export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/billing/portal`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Billing portal API error:", error);
    return NextResponse.json(
      { detail: "Failed to connect to server" },
      { status: 500 },
    );
  }
}
