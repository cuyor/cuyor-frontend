import { NextRequest, NextResponse } from "next/server";

type Bucket = {
  count: number;
  resetAt: number;
};

const RATE_LIMIT_WINDOW_MS = 60_000;
const DEFAULT_RATE_LIMIT = 60;
const ROUTE_LIMITS: Record<string, number> = {
  "/api/login": 10,
  "/api/register": 10,
  "/api/download": 6,
};

const globalForRateLimit = globalThis as typeof globalThis & {
  __cuyorApiRateLimitStore?: Map<string, Bucket>;
};

const rateLimitStore =
  globalForRateLimit.__cuyorApiRateLimitStore ??
  (globalForRateLimit.__cuyorApiRateLimitStore = new Map<string, Bucket>());

function getClientIp(request: NextRequest): string {
  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0]?.trim() || "unknown";
  }

  const xRealIp = request.headers.get("x-real-ip");
  if (xRealIp) {
    return xRealIp;
  }

  return "unknown";
}

function getPathRateLimit(pathname: string): number {
  for (const [route, limit] of Object.entries(ROUTE_LIMITS)) {
    if (pathname.startsWith(route)) {
      return limit;
    }
  }

  return DEFAULT_RATE_LIMIT;
}

function consumeRateLimit(key: string, limit: number, now: number) {
  const existing = rateLimitStore.get(key);

  if (!existing || now > existing.resetAt) {
    const resetAt = now + RATE_LIMIT_WINDOW_MS;
    rateLimitStore.set(key, { count: 1, resetAt });
    return {
      allowed: true,
      remaining: Math.max(limit - 1, 0),
      retryAfter: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000),
    };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.max(Math.ceil((existing.resetAt - now) / 1000), 1),
    };
  }

  existing.count += 1;
  rateLimitStore.set(key, existing);

  return {
    allowed: true,
    remaining: Math.max(limit - existing.count, 0),
    retryAfter: Math.max(Math.ceil((existing.resetAt - now) / 1000), 1),
  };
}

function isSameOriginRequest(request: NextRequest): boolean {
  const host = request.headers.get("host");
  if (!host) {
    return false;
  }

  const origin = request.headers.get("origin");
  if (origin) {
    try {
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  }

  return request.headers.get("sec-fetch-site") === "same-origin";
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { detail: "Forbidden: API access is only allowed from this web app" },
      { status: 403 },
    );
  }

  const clientHeader = request.headers.get("x-cuyor-client");
  if (clientHeader !== "webapp") {
    return NextResponse.json(
      { detail: "Forbidden: Invalid API client" },
      { status: 403 },
    );
  }

  const clientIp = getClientIp(request);
  const limit = getPathRateLimit(pathname);
  const now = Date.now();
  const rateKey = `${clientIp}:${pathname}`;
  const rate = consumeRateLimit(rateKey, limit, now);

  if (!rate.allowed) {
    return NextResponse.json(
      { detail: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rate.retryAfter),
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": "0",
        },
      },
    );
  }

  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Limit", String(limit));
  response.headers.set("X-RateLimit-Remaining", String(rate.remaining));
  response.headers.set("X-RateLimit-Reset", String(rate.retryAfter));
  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};
