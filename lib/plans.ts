// Source of truth for pricing tiers shown in the #pricing section.
//
// Checkout is intentionally DORMANT while we're under Lemon Squeezy review.
// To go live later:
//   1. Set NEXT_PUBLIC_CHECKOUT_ENABLED=true in the environment.
//   2. Fill in each paid plan's `checkoutUrl` with its Lemon Squeezy checkout URL.
// No Lemon Squeezy SDK / API keys / webhooks are wired here — only the config shape.

export type PlanId = "basic" | "standard" | "max";

export interface Plan {
  name: string;
  /** Big, prominent price label (e.g. "$10" or "Free"). */
  priceLabel: string;
  /** Numeric price in USD, used for logic/analytics. */
  price: number;
  /** Billing cadence shown muted beside the price. `null` for free plans. */
  cadence: "month" | null;
  /** One-line value prop under the plan name. */
  blurb: string;
  /**
   * Whether this plan includes Create Mode (YouTube tutorial → live on-screen
   * guidance) — our flagship paid differentiator. Drives the "Create Mode" pill.
   */
  createMode: boolean;
  /** Feature chips rendered as a "•"-separated row. */
  chips: string[];
  /**
   * Usage allowance line (e.g. "500 guidance sessions / month").
   * TODO: real Standard/Max limits are not yet defined in any plan config —
   * fill these in with the confirmed numbers. Left `null` so we don't ship a
   * guessed figure; the card simply omits the line while null.
   */
  usage: string | null;
  /**
   * Lemon Squeezy checkout URL. Left `null` until we exit review.
   * When NEXT_PUBLIC_CHECKOUT_ENABLED is true, the CTA opens this URL.
   */
  checkoutUrl: string | null;
}

export const PLANS: Record<PlanId, Plan> = {
  basic: {
    name: "Basic",
    priceLabel: "Free",
    price: 0,
    cadence: null,
    blurb: "Free forever for personal use",
    createMode: false,
    chips: ["Local processing", "Basic guidance", "All macOS apps"],
    usage: null,
    checkoutUrl: null,
  },
  standard: {
    name: "Standard",
    priceLabel: "$10",
    price: 10,
    cadence: "month",
    blurb: "Everything in Basic, plus Create Mode for your daily work",
    createMode: true,
    chips: ["Advanced vision", "Priority support", "Code assistance"],
    usage: null, // TODO: confirm real Standard Create Mode / guidance cap (e.g. "N sessions / month")
    checkoutUrl: null,
  },
  max: {
    name: "Max",
    priceLabel: "$20",
    price: 20,
    cadence: "month",
    blurb: "Everything in Standard, with higher Create Mode limits for teams",
    createMode: true,
    chips: ["Team features", "Enterprise support", "Custom training"],
    usage: null, // TODO: confirm real Max Create Mode limit (higher / unlimited)
    checkoutUrl: null,
  },
} as const;

export const PLAN_ORDER: PlanId[] = ["basic", "standard", "max"];

/**
 * Build-time flag gating live checkout. Defaults to `false` (dormant) so no
 * navigation or Lemon Squeezy call happens until we're out of review.
 */
export const CHECKOUT_ENABLED =
  process.env.NEXT_PUBLIC_CHECKOUT_ENABLED === "true";
