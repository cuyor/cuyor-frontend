// Server-only helpers for talking to the Cuyor backend with the user's session.
//
// The session token is kept in an httpOnly cookie so it is never readable from
// client JS (and never lands in client logs). The dashboard's browser code calls
// same-origin Next routes under /api/*, which read this cookie and forward the
// token to the backend as `Authorization: Bearer <token>`.

export const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

/** Name of the httpOnly cookie holding the backend session token. */
export const SESSION_COOKIE = "cuyor_session";

/** Cookie options for the session token. */
export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30, // 30 days
};
