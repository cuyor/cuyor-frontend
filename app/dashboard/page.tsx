"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ExitIcon,
  CopyIcon,
  CheckIcon,
  DownloadIcon,
  GearIcon,
  ChevronRightIcon,
} from "@radix-ui/react-icons";
import CuyorIcon from "@/components/ui/cuyor-icon";

interface AuthData {
  message: string;
  email: string;
  license_key: string;
  plan: "basic" | "standard" | "max";
  status: "unredeemed" | "redeemed" | "revoked";
  expires_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [authData, setAuthData] = useState<AuthData | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("cuyor_auth");
    if (stored) {
      setAuthData(JSON.parse(stored));
    } else {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("cuyor_auth");
    router.push("/");
  };

  const copyLicenseKey = () => {
    if (authData?.license_key) {
      navigator.clipboard.writeText(authData.license_key);
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
        headers: {
          "x-cuyor-client": "webapp",
        },
      });

      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "Cuyor-latest.dmg";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Download failed:", error);
      setDownloadError(
        "Unable to download installer right now. Please try again.",
      );
    } finally {
      setDownloading(false);
    }
  };

  if (!authData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground/60">Loading...</div>
      </div>
    );
  }

  const planLabels = {
    basic: { name: "Basic", price: "Free" },
    standard: { name: "Standard", price: "$9/mo" },
    max: { name: "Max", price: "$29/mo" },
  };

  const statusStyles = {
    unredeemed: "bg-amber-100 text-amber-700 border-amber-200",
    redeemed: "bg-emerald-100 text-emerald-700 border-emerald-200",
    revoked: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-[--border-secondary]">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <CuyorIcon size={20} />
            <span className="font-bold text-lg text-foreground">Cuyor</span>
          </Link>
          <div className="flex items-center gap-4">
            <button className="p-2 text-foreground/60 hover:text-foreground transition-colors">
              <GearIcon className="w-4 h-4" />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground transition-colors"
            >
              <ExitIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Welcome back
          </h1>
          <p className="text-foreground/60">{authData.email}</p>
        </div>

        {/* License Section */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-foreground/70 uppercase tracking-wide">
              Your License
            </h2>
            <span
              className={`text-xs px-2.5 py-1 rounded-full border ${
                statusStyles[authData.status]
              }`}
            >
              {authData.status.charAt(0).toUpperCase() +
                authData.status.slice(1)}
            </span>
          </div>

          <div className="p-6 rounded-xl border border-[--border-secondary] bg-white">
            <div className="flex items-center justify-between gap-4 mb-4">
              <input
                type="password"
                className="flex-1 px-4 py-3 bg-secondary/50 rounded-lg text-foreground font-mono text-sm truncate outine-none pointer-events-none"
                readOnly
                value={authData.license_key}
              />
              <button
                onClick={copyLicenseKey}
                className="shrink-0 p-3 rounded-lg border border-[--border-secondary] text-foreground/60 hover:text-foreground hover:border-foreground/30 transition-colors"
              >
                {copied ? (
                  <CheckIcon className="w-4 h-4 text-emerald-600" />
                ) : (
                  <CopyIcon className="w-4 h-4" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span className="text-foreground/50">Plan:</span>
                <span className="font-medium text-foreground">
                  {planLabels[authData.plan].name}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-foreground/50">Expires:</span>
                <span className="text-foreground">
                  {new Date(authData.expires_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Download Section */}
        <section className="mb-10">
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
                  Install Cuyor on your Mac and use your license key to
                  activate. Works on macOS 11.0 and later.
                </p>
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={downloading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-white rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <DownloadIcon className="w-4 h-4" />
                  {downloading ? "Preparing download..." : "Download for Mac"}
                </button>
                {downloadError && (
                  <p className="text-xs text-red mt-3">{downloadError}</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Upgrade Section */}
        {authData.plan !== "max" && (
          <section>
            <h2 className="text-sm font-medium text-foreground/70 uppercase tracking-wide mb-4">
              Upgrade
            </h2>

            <div className="p-6 rounded-xl border border-[--border-secondary] bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    {authData.plan === "basic"
                      ? "Upgrade to Standard"
                      : "Upgrade to Max"}
                  </h3>
                  <p className="text-sm text-foreground/60">
                    {authData.plan === "basic"
                      ? "Get advanced vision models and priority support."
                      : "Unlock enterprise features and team collaboration."}
                  </p>
                </div>
                <button className="inline-flex items-center gap-1 px-4 py-2 border border-foreground/20 text-foreground rounded-lg text-sm font-medium hover:bg-secondary/50 transition-colors">
                  {authData.plan === "basic" ? "$9/mo" : "$29/mo"}
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
