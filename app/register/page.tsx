"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  EyeOpenIcon,
  EyeClosedIcon,
  ChevronRightIcon,
  CheckIcon,
  Cross2Icon,
} from "@radix-ui/react-icons";
import CuyorIcon from "@/components/ui/cuyor-icon";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [plan, setPlan] = useState<"basic" | "standard" | "max">("basic");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pre-fill email from URL params (from landing page)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
    const planParam = params.get("plan");
    if (planParam && ["basic", "standard", "max"].includes(planParam)) {
      setPlan(planParam as "basic" | "standard" | "max");
    }
  }, []);

  // Password validation
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasMinLength = password.length >= 8;
  const isPasswordValid = hasLetter && hasNumber && hasMinLength;

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError("");

    if (!isPasswordValid) {
      setError("Please meet all password requirements");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-cuyor-client": "webapp",
        },
        body: JSON.stringify({ email, password, plan }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Registration failed");
      }

      // Store auth data and redirect to dashboard
      localStorage.setItem("cuyor_auth", JSON.stringify(data));
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-[--border-secondary] px-8">
        <div className="flex items-center justify-between h-14 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <CuyorIcon size={20} />
            <div className="font-bold text-xl text-foreground">Cuyor</div>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-foreground/60">Already have an account?</span>
            <Link
              href="/login"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-8 py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Create your account
            </h1>
            <p className="text-foreground/60">
              Get started with Cuyor in seconds
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-[--border-secondary] bg-white text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  required
                  minLength={8}
                  maxLength={128}
                  className="w-full px-4 py-2.5 pr-12 rounded-lg border border-[--border-secondary] bg-white text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeClosedIcon className="w-4 h-4" />
                  ) : (
                    <EyeOpenIcon className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Password requirements */}
              {password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    {hasMinLength ? (
                      <CheckIcon className="w-3 h-3 text-green" />
                    ) : (
                      <Cross2Icon className="w-3 h-3 text-red" />
                    )}
                    <span
                      className={
                        hasMinLength ? "text-green" : "text-foreground/50"
                      }
                    >
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {hasLetter ? (
                      <CheckIcon className="w-3 h-3 text-green" />
                    ) : (
                      <Cross2Icon className="w-3 h-3 text-red" />
                    )}
                    <span
                      className={
                        hasLetter ? "text-green" : "text-foreground/50"
                      }
                    >
                      Contains a letter
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {hasNumber ? (
                      <CheckIcon className="w-3 h-3 text-green" />
                    ) : (
                      <Cross2Icon className="w-3 h-3 text-red" />
                    )}
                    <span
                      className={
                        hasNumber ? "text-green" : "text-foreground/50"
                      }
                    >
                      Contains a number
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Plan selection */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Select a plan
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["basic", "standard", "max"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => p !== "basic" ? setPlan(p) : ''}
                    className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                      plan === p
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-[--border-secondary] bg-white text-foreground/70 hover:border-primary/50"
                    }`}
                    disabled={p !== "basic"}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-foreground/50">
                {plan === "basic" && "Free forever for personal use"}
                {plan === "standard" && "$9/month - Advanced vision & support"}
                {plan === "max" && "$29/month - Enterprise features for teams"}
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 rounded-lg bg-red/10 border border-red/20 text-red text-sm">
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-foreground text-white rounded-lg font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                "Creating account..."
              ) : (
                <>
                  Create account <ChevronRightIcon className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-foreground/50">
            By creating an account, you agree to our{" "}
            <Link href="#" className="underline hover:text-foreground">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="underline hover:text-foreground">
              Privacy Policy
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
