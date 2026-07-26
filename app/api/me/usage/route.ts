import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/session";

// GET /api/me/usage → backend GET /api/v1/usage (App API, license-key auth).
//
// The backend returns raw { remaining, limit, resets_at }. We compute the
// percentage HERE and return only that — the raw counts never reach the client.
//
// NOTE / flagged gap: /api/v1/usage is a license-key-authed App API endpoint
// (meant for the macOS app), so the browser must supply the user's license key.
// The proper fix is a session-authed `GET /api/v1/me/usage` (mirroring
// /me/entitlement); if/when that lands, swap the auth below to the session cookie.
export async function GET(request: NextRequest) {
  const licenseKey = request.headers.get("x-cuyor-license");
  if (!licenseKey) {
    return NextResponse.json(
      { detail: "Missing license key" },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/usage`, {
      // Auth header format for the license-key App API is unverified (backend is
      // beta-gated) — assuming `Bearer <license_key>`. One-line change if wrong.
      headers: { Authorization: `Bearer ${licenseKey}` },
      cache: "no-store",
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        { detail: data.detail || "Could not load usage" },
        { status: response.status },
      );
    }

    // GET /usage returns multiple independent credit pools under `features`,
    // each { remaining, limit, used }. Reduce each to a percentage here so the
    // raw counts never reach the client.
    const rawFeatures =
      data.features && typeof data.features === "object" ? data.features : {};
    const features: Record<
      string,
      { used_percent: number; remaining_percent: number; unlimited: boolean }
    > = {};

    for (const [name, pool] of Object.entries(rawFeatures)) {
      const p = (pool ?? {}) as Record<string, unknown>;
      const limit = Number(p.limit);
      const remaining = Number(p.remaining);

      // limit <= 0 (or non-finite) is treated as unlimited (e.g. Max tier).
      const unlimited = !Number.isFinite(limit) || limit <= 0;
      let usedPercent = 0;
      if (!unlimited) {
        const used = Number.isFinite(Number(p.used))
          ? Number(p.used)
          : Number.isFinite(remaining)
            ? limit - remaining
            : 0;
        usedPercent = Math.min(100, Math.max(0, Math.round((used / limit) * 100)));
      }

      features[name] = {
        used_percent: usedPercent,
        remaining_percent: 100 - usedPercent,
        unlimited,
      };
    }

    // Only the derived percentages + shared reset date leave the server.
    return NextResponse.json({
      resets_at: data.resets_at,
      features,
    });
  } catch (error) {
    console.error("Usage API error:", error);
    return NextResponse.json(
      { detail: "Failed to connect to server" },
      { status: 500 },
    );
  }
}
