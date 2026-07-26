// Shared types + display helpers for billing/entitlement. Safe to import from
// both client and server code (no server-only dependencies here).

import type { PlanId } from "@/lib/plans";

export type EntitlementStatus =
  | "pending_activation"
  | "active"
  | "past_due"
  | "expired"
  | "comp";

/** GET /api/v1/me/entitlement */
export interface EntitlementResponse {
  plan: PlanId;
  entitlement_status: EntitlementStatus;
  expires_at: string;
}

/** POST /auth/register|login (AuthWithLicenseResponse), minus session_token. */
export interface StoredAuth {
  message?: string;
  email: string;
  license_key: string;
  plan: PlanId;
  status: "unredeemed" | "redeemed" | "revoked";
  entitlement_status: EntitlementStatus;
  expires_at: string;
}

export const isPaidPlan = (plan: PlanId | undefined): boolean =>
  plan === "standard" || plan === "max";

/**
 * Basic is free and has no checkout (POST /checkout only accepts "standard" and
 * "max"), so a `pending_activation` status on Basic is not something the user
 * can act on — only paid plans can genuinely be awaiting payment.
 */
export const isAwaitingPayment = (
  status: EntitlementStatus | string | undefined,
  plan: PlanId | undefined,
): boolean => status === "pending_activation" && isPaidPlan(plan);

/**
 * A single metered credit pool, as exposed to the browser. The raw
 * remaining/limit counts never leave the Next server — only the derived
 * percentage does (see /api/me/usage).
 */
export interface UsagePool {
  used_percent: number;
  remaining_percent: number;
  unlimited: boolean;
}

/**
 * Usage summary. GET /usage now returns multiple independent credit pools under
 * `features` (e.g. `default` = general guidance, `transcript` = YouTube-tutorial
 * credits), sharing one `resets_at`. See frontend-handoff-usage-and-transcript-quota.md.
 */
export interface UsageSummary {
  resets_at: string;
  features: Partial<Record<string, UsagePool>>;
}

/**
 * The /checkout and /billing/portal endpoints return an untyped `{}` body in the
 * OpenAPI spec (couldn't verify the live shape — backend registration is beta-gated).
 * Pull a URL out of whatever comes back, tolerating a few likely field names.
 */
export function extractUrl(data: unknown): string | null {
  if (typeof data === "string") return data;
  if (data && typeof data === "object") {
    for (const key of [
      "url",
      "checkout_url",
      "portal_url",
      "redirect_url",
      "href",
    ]) {
      const value = (data as Record<string, unknown>)[key];
      if (typeof value === "string" && value.length > 0) return value;
    }
  }
  return null;
}

export function formatDate(iso: string | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
