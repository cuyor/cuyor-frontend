import { NextResponse } from "next/server";

const RELEASE_URL =
  "https://github.com/cuyor/cuyor-client-mac/releases/latest/download/Cuyor-latest.dmg";
const DOWNLOAD_FILENAME = "Cuyor-latest.dmg";

export async function GET() {
  try {
    const upstreamResponse = await fetch(RELEASE_URL, {
      redirect: "follow",
      cache: "no-store",
    });

    if (!upstreamResponse.ok || !upstreamResponse.body) {
      return NextResponse.json(
        { detail: "Failed to fetch installer" },
        { status: 502 },
      );
    }

    const headers = new Headers();
    headers.set(
      "Content-Type",
      upstreamResponse.headers.get("content-type") ||
        "application/octet-stream",
    );
    headers.set(
      "Content-Disposition",
      `attachment; filename="${DOWNLOAD_FILENAME}"`,
    );
    headers.set("Cache-Control", "no-store");

    const contentLength = upstreamResponse.headers.get("content-length");
    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }

    return new Response(upstreamResponse.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Download API error:", error);
    return NextResponse.json(
      { detail: "Failed to process installer download" },
      { status: 500 },
    );
  }
}
