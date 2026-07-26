import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL, SESSION_COOKIE } from "@/lib/session";

// POST /api/checkout { plan } → backend POST /api/v1/checkout (session auth).
// Returns whatever the backend returns (a checkout URL, synthetic while dormant).
export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const response = await fetch(`${BACKEND_URL}/api/v1/checkout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ plan: body.plan }),
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Checkout API error:", error);
    return NextResponse.json(
      { detail: "Failed to connect to server" },
      { status: 500 },
    );
  }
}
