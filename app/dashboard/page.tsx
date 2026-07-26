"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ExitIcon,
  CopyIcon,
  CheckIcon,
  DownloadIcon,
  ChevronRightIcon,
  ReloadIcon,
  ExclamationTriangleIcon,
  RocketIcon,
} from "@radix-ui/react-icons";
import CuyorIcon from "@/components/ui/cuyor-icon";
import { PLANS, CHECKOUT_ENABLED, type PlanId } from "@/lib/plans";
import {
  type EntitlementResponse,
  type StoredAuth,
  type UsageSummary,
  type UsagePool,
  extractUrl,
  formatDate,
  isAwaitingPayment,
  isPaidPlan,
} from "@/lib/entitlement";

// Same-origin API calls must carry this header (enforced by proxy.ts).
const WEB_HEADERS = { "x-cuyor-client": "webapp" };

const POLL_INTERVAL_MS = 3000;
const POLL_MAX_ATTEMPTS = 10; // ~30s total

export default function DashboardPage() {
  const router = useRouter();

  const [auth, setAuth] = useState<StoredAuth | null>(null);
  const [entitlement, setEntitlement] = useState<EntitlementResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [usage, setUsage] = useState<UsageSummary | null>(null);

  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const [actionBusy, setActionBusy] = useState<null | "checkout" | "portal">(
    null,
  );
  const [actionError, setActionError] = useState("");

  // Post-checkout activation polling.
  const [activating, setActivating] = useState(false);
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---- data loading -------------------------------------------------------

  const fetchEntitlement =
    useCallback(async (): Promise<EntitlementResponse | null> => {
      const res = await fetch("/api/me/entitlement", {
        headers: WEB_HEADERS,
        cache: "no-store",
      });
      if (res.status === 401) {
        router.push("/login");
        return null;
      }
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Could not load your plan");
      }
      setEntitlement(data as EntitlementResponse);
      return data as EntitlementResponse;
    }, [router]);

  useEffect(() => {
    // license_key + email come from the auth response persisted at login/register
    // (they are NOT returned by GET /me/entitlement — see flagged backend gap).
    const stored = localStorage.getItem("cuyor_auth");
    if (stored) {
      try {
        setAuth(JSON.parse(stored) as StoredAuth);
      } catch {
        /* ignore malformed cache */
      }
    }

    fetchEntitlement()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    // If we just came back from checkout, poll until the async webhook activates us.
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      startActivationPolling();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (pollTimer.current) clearTimeout(pollTimer.current);
    };
  }, []);

  // Usage meter — fetch once we have a license key and an active-ish plan. The
  // Next route returns only a percentage (never the raw counts). Non-critical:
  // if it fails we just don't show the meter. Refetches when entitlement changes
  // (e.g. after activation polling flips the plan to active).
  useEffect(() => {
    const licenseKey = auth?.license_key;
    const st = entitlement?.entitlement_status ?? auth?.entitlement_status;
    const pl = (entitlement?.plan ?? auth?.plan) as PlanId | undefined;
    if (!licenseKey || !st || isAwaitingPayment(st, pl)) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/me/usage", {
          headers: { ...WEB_HEADERS, "x-cuyor-license": licenseKey },
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as UsageSummary;
        if (!cancelled) setUsage(data);
      } catch {
        /* usage is non-critical */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [auth, entitlement]);

  // ---- activation polling -------------------------------------------------

  const startActivationPolling = useCallback(() => {
    setActivating(true);
    let attempts = 0;

    const tick = async () => {
      attempts += 1;
      try {
        const ent = await fetchEntitlement();
        if (ent && ent.entitlement_status === "active") {
          setActivating(false);
          // Clean the ?checkout=success param without a reload.
          router.replace("/dashboard");
          return;
        }
      } catch {
        /* keep polling; transient errors are expected */
      }
      if (attempts >= POLL_MAX_ATTEMPTS) {
        setActivating(false);
        return;
      }
      pollTimer.current = setTimeout(tick, POLL_INTERVAL_MS);
    };

    pollTimer.current = setTimeout(tick, POLL_INTERVAL_MS);
  }, [fetchEntitlement, router]);

  const manualRefresh = useCallback(async () => {
    setError("");
    try {
      await fetchEntitlement();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Refresh failed");
    }
  }, [fetchEntitlement]);

  // ---- actions ------------------------------------------------------------

  const startCheckout = useCallback(async (plan: PlanId) => {
    setActionError("");
    setActionBusy("checkout");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { ...WEB_HEADERS, "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Could not start checkout");
      const url = extractUrl(data);
      if (!url) throw new Error("No checkout URL returned by the server");
      // Leave the SPA for Lemon Squeezy hosted checkout (or the synthetic URL).
      window.location.href = url;
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Checkout failed");
      setActionBusy(null);
    }
  }, []);

  const openBilling = useCallback(async () => {
    setActionError("");
    setActionBusy("portal");
    try {
      const res = await fetch("/api/billing/portal", {
        headers: WEB_HEADERS,
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Could not open billing");
      const url = extractUrl(data);
      if (!url) throw new Error("No portal URL returned by the server");
      window.location.href = url;
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Billing failed");
      setActionBusy(null);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/logout", { method: "POST", headers: WEB_HEADERS });
    } catch {
      /* best-effort */
    }
    localStorage.removeItem("cuyor_auth");
    router.push("/");
  }, [router]);

  const copyLicenseKey = () => {
    if (auth?.license_key) {
      navigator.clipboard.writeText(auth.license_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = async () => {
    setDownloadError("");
    setDownloading(true);
    try {
      const response = await fetch("/api/download", {
        method: "GET",
        headers: WEB_HEADERS,
      });
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "Cuyor-latest.dmg";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch {
      setDownloadError(
        "Unable to download installer right now. Please try again.",
      );
    } finally {
      setDownloading(false);
    }
  };

  // ---- derived state ------------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground/60">Loading…</div>
      </div>
    );
  }

  // Entitlement is authoritative; fall back to the stored auth blob when needed.
  const status = entitlement?.entitlement_status ?? auth?.entitlement_status;
  const plan = (entitlement?.plan ?? auth?.plan) as PlanId | undefined;
  const expiresAt = entitlement?.expires_at ?? auth?.expires_at;
  const email = auth?.email;
  const licenseKey = auth?.license_key;
  const planName = plan ? PLANS[plan].name : "—";
  // Basic is free — it is never "awaiting payment", whatever the backend says.
  const awaitingPayment = isAwaitingPayment(status, plan);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-[--border-secondary]">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <CuyorIcon size={20} />
            <span className="font-bold text-lg text-foreground">Cuyor</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground transition-colors"
          >
            <ExitIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Welcome back
          </h1>
          {email && <p className="text-foreground/60">{email}</p>}
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between gap-4">
            <span>{error}</span>
            <button
              onClick={manualRefresh}
              className="shrink-0 inline-flex items-center gap-1.5 text-red-700 hover:text-red-900"
            >
              <ReloadIcon className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        )}

        {/* Activation polling banner (post-checkout return) */}
        {activating && <ActivatingCard onRefresh={manualRefresh} />}

        {/* Status-driven content (usage ring lives inside the plan card) */}
        {!activating && (
          <StatusView
            status={status}
            plan={plan}
            planName={planName}
            expiresAt={expiresAt}
            actionBusy={actionBusy}
            actionError={actionError}
            onCheckout={startCheckout}
            onBilling={openBilling}
            usage={usage}
          />
        )}

        {/* License key — shown for any state where the user has a key. Marked
            inactive while pending_activation (the key does not work yet). */}
        {licenseKey && (
          <LicenseCard
            licenseKey={licenseKey}
            expiresAt={auth?.expires_at}
            copied={copied}
            onCopy={copyLicenseKey}
            inactive={awaitingPayment}
          />
        )}

        {/* Download — hidden while awaiting payment (nothing to activate yet). */}
        {!awaitingPayment && (
          <DownloadCard
            downloading={downloading}
            downloadError={downloadError}
            onDownload={handleDownload}
          />
        )}
      </main>
    </div>
  );
}

// ---- sub-components --------------------------------------------------------

function ActivatingCard({ onRefresh }: { onRefresh: () => void }) {
  return (
    <section className="mb-8 p-6 rounded-xl border border-primary/30 bg-primary/[0.04]">
      <div className="flex items-start gap-4">
        <ReloadIcon className="w-5 h-5 text-primary mt-0.5 animate-spin" />
        <div className="flex-1">
          <h2 className="font-semibold text-foreground mb-1">
            Activating your plan…
          </h2>
          <p className="text-sm text-foreground/60 mb-3">
            Payment received. We&apos;re waiting for confirmation — this usually
            takes a few seconds. This page will update automatically.
          </p>
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium"
          >
            <ReloadIcon className="w-3.5 h-3.5" /> Refresh now
          </button>
        </div>
      </div>
    </section>
  );
}

function TestModeNote() {
  if (CHECKOUT_ENABLED) return null;
  return (
    <p className="mt-3 text-xs text-foreground/50">
      Test mode — checkout is not live yet, so nothing will be charged.
    </p>
  );
}

function PrimaryButton({
  children,
  onClick,
  busy,
  variant = "accent",
}: {
  children: React.ReactNode;
  onClick: () => void;
  busy?: boolean;
  variant?: "accent" | "dark";
}) {
  const color =
    variant === "accent"
      ? "bg-primary hover:bg-primary/90"
      : "bg-foreground hover:bg-foreground/90";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={`inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-medium text-white shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${color}`}
    >
      {children}
    </button>
  );
}

function UpgradeButtons({
  targets,
  onCheckout,
  busy,
}: {
  targets: PlanId[];
  onCheckout: (plan: PlanId) => void;
  busy: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {targets.map((p) => (
        <PrimaryButton
          key={p}
          variant={p === "standard" ? "accent" : "dark"}
          busy={busy}
          onClick={() => onCheckout(p)}
        >
          Upgrade to {PLANS[p].name} · {PLANS[p].priceLabel}
          <ChevronRightIcon className="w-4 h-4" />
        </PrimaryButton>
      ))}
    </div>
  );
}

function StatusView({
  status,
  plan,
  planName,
  expiresAt,
  actionBusy,
  actionError,
  onCheckout,
  onBilling,
  usage,
}: {
  status: string | undefined;
  plan: PlanId | undefined;
  planName: string;
  expiresAt: string | undefined;
  actionBusy: null | "checkout" | "portal";
  actionError: string;
  onCheckout: (plan: PlanId) => void;
  onBilling: () => void;
  usage: UsageSummary | null;
}) {
  const busy = actionBusy !== null;

  const err = actionError ? (
    <p className="mt-3 text-xs text-red-600">{actionError}</p>
  ) : null;

  // Status couldn't be determined (entitlement load failed and no cache). The
  // error banner above already prompts a retry — don't render a misleading card.
  if (!status) return null;

  // pending_activation — paid plan not yet paid. The license does NOT work yet.
  // Basic is free and has no checkout, so it falls through to the normal card
  // even if the backend reports pending_activation for it.
  if (isAwaitingPayment(status, plan)) {
    return (
      <section className="mb-8 p-6 rounded-xl border border-primary/40 bg-primary/[0.04]">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-3 rounded-full text-xs font-semibold bg-primary text-white">
          <RocketIcon className="w-3 h-3" /> Action needed
        </span>
        <h2 className="text-xl font-bold text-foreground mb-1">
          Activate your {planName} plan
        </h2>
        <p className="text-sm text-foreground/70 mb-4 max-w-prose">
          Your {planName} license <strong>won&apos;t work until you complete
          payment</strong>. Finish checkout to activate it and unlock Create
          Mode.
        </p>
        <PrimaryButton
          onClick={() => plan && onCheckout(plan)}
          busy={busy}
        >
          Activate — complete payment <ChevronRightIcon className="w-4 h-4" />
        </PrimaryButton>
        <TestModeNote />
        {err}
      </section>
    );
  }

  // past_due — payment issue, access continues until expires_at.
  if (status === "past_due") {
    return (
      <section className="mb-8 p-6 rounded-xl border border-amber-300 bg-amber-50">
        <div className="flex items-start gap-3 mb-3">
          <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <h2 className="font-semibold text-foreground mb-1">
              There&apos;s a problem with your payment
            </h2>
            <p className="text-sm text-foreground/70">
              Your {planName} access continues until{" "}
              <strong>{formatDate(expiresAt)}</strong>. Update your payment
              method to avoid losing access.
            </p>
          </div>
        </div>
        <PrimaryButton variant="dark" onClick={onBilling} busy={busy}>
          Manage billing <ChevronRightIcon className="w-4 h-4" />
        </PrimaryButton>
        {err}
      </section>
    );
  }

  // expired — lapsed back to Basic.
  if (status === "expired") {
    return (
      <section className="mb-8 p-6 rounded-xl border border-[--border-secondary] bg-white">
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Your plan has lapsed
        </h2>
        <p className="text-sm text-foreground/70 mb-4">
          Your subscription expired, so you&apos;re on <strong>Basic</strong>{" "}
          now. Upgrade any time to bring back Create Mode and advanced features.
        </p>
        <UpgradeButtons
          targets={["standard", "max"]}
          onCheckout={onCheckout}
          busy={busy}
        />
        <TestModeNote />
        {err}
      </section>
    );
  }

  // active / comp — the good states.
  const isComp = status === "comp";
  const paid = isPaidPlan(plan);

  return (
    <section className="mb-8 p-6 rounded-xl border border-[--border-secondary] bg-white">
      <div className="flex flex-col-reverse sm:flex-row items-center sm:items-start justify-between gap-6">
        {/* Left: plan details + actions */}
        <div className="flex-1 min-w-0 w-full">
          <div className="flex items-center gap-3 flex-wrap mb-2">
            <h2 className="text-lg font-semibold text-foreground">
              Your plan: {planName}
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
              <CheckIcon className="w-3.5 h-3.5" />{" "}
              {isComp ? "Complimentary" : "Active"}
            </span>
          </div>

          {paid && !isComp && (
            <p className="text-sm text-foreground/60 mb-4">
              Renews on <strong>{formatDate(expiresAt)}</strong>.
            </p>
          )}
          {isComp && (
            <p className="text-sm text-foreground/60 mb-4">
              Complimentary access — no billing on this account.
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            {/* Basic: offer upgrades. Standard: offer Max. */}
            {plan === "basic" && (
              <UpgradeButtons
                targets={["standard", "max"]}
                onCheckout={onCheckout}
                busy={busy}
              />
            )}
            {plan === "standard" && (
              <UpgradeButtons
                targets={["max"]}
                onCheckout={onCheckout}
                busy={busy}
              />
            )}

            {/* Manage billing for paid subscriptions only (comp has none). */}
            {paid && !isComp && (
              <PrimaryButton variant="dark" onClick={onBilling} busy={busy}>
                Manage billing <ChevronRightIcon className="w-4 h-4" />
              </PrimaryButton>
            )}
          </div>
          {plan === "basic" && <TestModeNote />}
          {err}
        </div>

        {/* Right: circular usage rings, one per credit pool (percentage only) */}
        {usage && <UsageRings usage={usage} plan={plan} />}
      </div>
    </section>
  );
}

// Known credit pools we surface, in display order. Unknown feature keys are
// ignored per the usage handoff ("treat an unknown feature key as not shown").
const USAGE_POOLS: { key: string; label: string }[] = [
  { key: "default", label: "Guidance" },
  { key: "transcript", label: "Transcript" },
];

function UsageRings({
  usage,
  plan,
}: {
  usage: UsageSummary;
  plan: PlanId | undefined;
}) {
  const present = USAGE_POOLS.filter((p) => {
    if (!usage.features[p.key]) return false;
    // Basic has no transcript credits (0 by default) — don't show that ring.
    if (p.key === "transcript" && plan === "basic") return false;
    return true;
  });
  if (present.length === 0) return null;

  return (
    <div
      className="flex flex-row gap-4 shrink-0"
      title={`Resets on ${formatDate(usage.resets_at)}`}
    >
      {present.map((p) => (
        <UsageRing key={p.key} pool={usage.features[p.key]!} label={p.label} />
      ))}
    </div>
  );
}

/**
 * Circular usage meter for a single pool. Shows only a percentage — the raw
 * remaining/limit counts are computed on the Next server and never sent down.
 */
function UsageRing({ pool, label }: { pool: UsagePool; label: string }) {
  const size = 76;
  const stroke = 7;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = pool.unlimited ? 100 : pool.used_percent;
  const offset = circumference - (pct / 100) * circumference;
  const danger = !pool.unlimited && pool.used_percent >= 90;

  return (
    <div className="flex flex-col items-center shrink-0">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="-rotate-90"
          role="progressbar"
          aria-valuenow={pool.unlimited ? undefined : pool.used_percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label} credits used this period`}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            className="stroke-secondary/70"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={pool.unlimited ? 0 : offset}
            className={danger ? "stroke-red-500" : "stroke-primary"}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-base font-bold text-foreground">
            {pool.unlimited ? "∞" : `${pool.used_percent}%`}
          </span>
        </div>
      </div>
      <span className="mt-1 text-xs text-foreground/50">{label}</span>
    </div>
  );
}

function LicenseCard({
  licenseKey,
  expiresAt,
  copied,
  onCopy,
  inactive,
}: {
  licenseKey: string;
  expiresAt: string | undefined;
  copied: boolean;
  onCopy: () => void;
  inactive: boolean;
}) {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-foreground/70 uppercase tracking-wide">
          Your License
        </h2>
        {inactive && (
          <span className="text-xs px-2.5 py-1 rounded-full border bg-amber-100 text-amber-700 border-amber-200">
            Inactive until activated
          </span>
        )}
      </div>

      <div className="p-6 rounded-xl border border-[--border-secondary] bg-white">
        <div className="flex items-center justify-between gap-4 mb-4">
          <input
            type="password"
            className="flex-1 px-4 py-3 bg-secondary/50 rounded-lg text-foreground font-mono text-sm truncate outline-none pointer-events-none"
            readOnly
            value={licenseKey}
          />
          <button
            onClick={onCopy}
            className="shrink-0 p-3 rounded-lg border border-[--border-secondary] text-foreground/60 hover:text-foreground hover:border-foreground/30 transition-colors"
            aria-label="Copy license key"
          >
            {copied ? (
              <CheckIcon className="w-4 h-4 text-emerald-600" />
            ) : (
              <CopyIcon className="w-4 h-4" />
            )}
          </button>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-foreground/50">Expires:</span>
          <span className="text-foreground">{formatDate(expiresAt)}</span>
        </div>
      </div>
    </section>
  );
}


function DownloadCard({
  downloading,
  downloadError,
  onDownload,
}: {
  downloading: boolean;
  downloadError: string;
  onDownload: () => void;
}) {
  return (
    <section>
      <h2 className="text-sm font-medium text-foreground/70 uppercase tracking-wide mb-4">
        Get Started
      </h2>
      <div className="p-6 rounded-xl border border-[--border-secondary] bg-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <DownloadIcon className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground mb-1">
              Download Cuyor for macOS
            </h3>
            <p className="text-sm text-foreground/60 mb-4">
              Install Cuyor on your Mac and use your license key to activate.
              Works on macOS 11.0 and later.
            </p>
            <button
              type="button"
              onClick={onDownload}
              disabled={downloading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-white rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <DownloadIcon className="w-4 h-4" />
              {downloading ? "Preparing download…" : "Download for Mac"}
            </button>
            {downloadError && (
              <p className="text-xs text-red-600 mt-3">{downloadError}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
