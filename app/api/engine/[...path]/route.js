import { NextResponse } from "next/server";

const BACKEND_URL = process.env.FLOOD_ENGINE_URL || "http://137.184.86.1:8004";

export async function GET(request, { params }) {
  const path = (await params).path?.join("/") || "";
  const url = new URL(request.url);
  const queryString = url.search;
  const backendUrl = `${BACKEND_URL}/${path}${queryString}`;

  try {
    const res = await fetch(backendUrl, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("text/csv")) {
      const text = await res.text();
      return new NextResponse(text, {
        status: res.status,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": res.headers.get("content-disposition") || "attachment; filename=export.csv",
        },
      });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
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
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ error: "Backend unavailable" }, { status: 502 });
  }
}
