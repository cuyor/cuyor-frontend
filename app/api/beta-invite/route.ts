import postgres from "postgres";
import { NextRequest, NextResponse } from "next/server";

const databaseUrl = process.env.XATA_DATABASE_URL;

if (!databaseUrl) {
  throw new Error("XATA_DATABASE_URL is required");
}

const sql = postgres(databaseUrl, { ssl: "require" });

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS beta_invites (
      id BIGSERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

function normalizeEmail(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const email = value.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return null;
  }

  return email;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = normalizeEmail(body?.email);

    if (!email) {
      return NextResponse.json(
        { detail: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    await ensureTable();

    await sql`
      INSERT INTO beta_invites (email)
      VALUES (${email})
    `;

    return NextResponse.json({
      success: true,
      detail: "Thanks. You're on the beta list.",
    });
  } catch (error: any) {
    if (error?.code === "23505") {
      return NextResponse.json(
        { detail: "You're already on the beta list." },
        { status: 409 },
      );
    }

    console.error("Beta invite API error:", error);
    return NextResponse.json(
      { detail: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}