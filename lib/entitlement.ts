// Shared types + display helpers for billing/entitlement. Safe to import from
// both client and server code (no server-only dependencies here).

import type { PlanId } from "@/lib/plans";

export type EntitlementStatus =
  | "pending_activation"
  | "active"
  | "past_due"
  | "expired"
  | "comp";

/**
 * GET /api/v1/me/entitlement — also the response shape of POST /billing/cancel
 * and POST /billing/change-plan, which return the reconciled entitlement.
 *
 * The cancel-at-period-end flag isn't in the documented shape; the status stays
 * `active` until `expires_at`. We read a few plausible field names so that if
 * the backend does send one, it beats our locally remembered flag.
 */
export interface EntitlementResponse {
  plan: PlanId;
  entitlement_status: EntitlementStatus;
  expires_at: string;
  cancel_at_period_end?: boolean;
  cancelled?: boolean;
  canceled?: boolean;
}

/** True when the backend explicitly says the subscription won't renew. */
export function isCancelledAtPeriodEnd(
  ent: EntitlementResponse | null | undefined,
): boolean {
  if (!ent) return false;
  return Boolean(ent.cancel_at_period_end ?? ent.cancelled ?? ent.canceled);
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
 * The subscription can be cancelled or switched in-app. `comp` is excluded —
 * complimentary access has no subscription to manage.
 *
 * There is no customer-portal equivalent: card updates and receipts are handled
 * by Lemon Squeezy's own emails, so every billing action we surface is
 * first-party.
 */
export const isManageable = (
  status: EntitlementStatus | string | undefined,
  plan: PlanId | undefined,
): boolean =>
  isPaidPlan(plan) && (status === "active" || status === "past_due");

/** How the UI should react to a failed billing-management call. */
export type BillingErrorKind =
  | "session_expired" // 401 — re-login
  | "plan_changes_disabled" // 403, server-side feature flag off
  | "no_subscription" // 403 inactive / 404 / 409 — offer Upgrade instead
  | "upstream" // 502 — Lemon Squeezy call failed, safe to retry
  | "unknown";

export interface BillingError {
  kind: BillingErrorKind;
  message: string;
}

/**
 * Map a billing endpoint failure onto the reaction the UI owes the user.
 * Detail strings are matched loosely — status code is the primary signal.
 */
export function classifyBillingError(
  status: number,
  detail?: unknown,
): BillingError {
  const text = typeof detail === "string" ? detail : "";

  if (status === 401) {
    return {
      kind: "session_expired",
      message: "Your session expired. Please sign in again.",
    };
  }
  if (status === 403 && /plan change/i.test(text)) {
    return {
      kind: "plan_changes_disabled",
      message: "Plan changes are temporarily unavailable.",
    };
  }
  if (status === 403 || status === 404 || status === 409) {
    return {
      kind: "no_subscription",
      message: text || "You don't have a subscription to manage.",
    };
  }
  if (status === 502) {
    return {
      kind: "upstream",
      message: "Our payment provider didn't respond. Please try again.",
    };
  }
  return { kind: "unknown", message: text || "Something went wrong." };
}

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
 * /checkout returns an untyped `{}` body in the OpenAPI spec (the live shape is
 * `{ checkout_url }`). Pull a URL out of whatever comes back, tolerating a few
 * likely field names.
 */
export function extractUrl(data: unknown): string | null {
  if (typeof data === "string") return data;
  if (data && typeof data === "object") {
    for (const key of ["url", "checkout_url", "redirect_url", "href"]) {
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
