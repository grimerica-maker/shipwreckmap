import { NextResponse } from "next/server";

const BACKEND_URL = process.env.FLOOD_ENGINE_URL || "http://137.184.86.1:8004";

export async function GET(request, { params }) {
  const path = (await params).path?.join("/") || "";
  const url = new URL(request.url);
  const queryString = url.search;
  const backendUrl = `${BACKEND_URL}/${path}${queryString}`;

  try {
    const res = await fetch(backendUrl, {
      cache: "no-store",
    });

    // Stream the response directly — don't parse and re-serialize
    const contentType = res.headers.get("content-type") || "application/json";
    const responseHeaders = {
      "Content-Type": contentType,
    };

    // Pass through CSV disposition header
    if (contentType.includes("text/csv")) {
      responseHeaders["Content-Disposition"] =
        res.headers.get("content-disposition") || "attachment; filename=export.csv";
    }

    return new NextResponse(res.body, {
      status: res.status,
      headers: responseHeaders,
    });
  } catch (err) {
    console.error("Backend proxy error:", err);
    return NextResponse.json({ error: "Backend unavailable" }, { status: 502 });
  }
}

export async function POST(request, { params }) {
  const path = (await params).path?.join("/") || "";
  const body = await request.text();
  const backendUrl = `${BACKEND_URL}/${path}`;

  try {
    const res = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    return new NextResponse(res.body, {
      status: res.status,
      headers: { "Content-Type": res.headers.get("content-type") || "application/json" },
    });
  } catch (err) {
    return NextResponse.json({ error: "Backend unavailable" }, { status: 502 });
  }
}
