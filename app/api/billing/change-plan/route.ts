import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL, SESSION_COOKIE } from "@/lib/session";

// Only paid tiers can be switched to — "basic" is the free fallback you reach by
// cancelling, not a plan you can change into.
const CHANGEABLE_PLANS = new Set(["standard", "max"]);

// POST /api/billing/change-plan { plan } → backend POST /api/v1/billing/change-plan
// (session auth). Returns the reconciled entitlement.
export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!CHANGEABLE_PLANS.has(body?.plan)) {
      return NextResponse.json(
        { detail: "Unsupported plan. Choose 'standard' or 'max'." },
        { status: 400 },
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/billing/change-plan`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ plan: body.plan }),
      cache: "no-store",
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Billing change-plan API error:", error);
    return NextResponse.json(
      { detail: "Failed to connect to server" },
      { status: 500 },
    );
  }
}
