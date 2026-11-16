import { NextResponse } from "next/server";
import { WRECK_CORRECTIONS } from "../../../../lib/wreckCorrections";

const BACKEND_URL = process.env.FLOOD_ENGINE_URL || "http://137.184.86.1:8004";

// Paths whose JSON is rewritten with the curated corrections.
const CORRECTED_PATHS = new Set(["wrecks/all", "wrecks/search"]);

function correctItem(item) {
  if (!item || typeof item !== "object") return item;
  const props = item.properties || item;
  const fix = WRECK_CORRECTIONS[props.id];
  if (!fix) return item;
  if (fix.delete) return null;
  if (item.geometry && Array.isArray(item.geometry.coordinates)) {
    item.geometry.coordinates = [fix.lon, fix.lat];
  }
  if ("lat" in props) props.lat = fix.lat;
  if ("lon" in props) props.lon = fix.lon;
  if ("lng" in props) props.lng = fix.lon;
  if ("latitude" in props) props.latitude = fix.lat;
  if ("longitude" in props) props.longitude = fix.lon;
  if (fix.depth_m != null && "depth_m" in props) props.depth_m = fix.depth_m;
  return item;
}

function applyCorrections(data) {
  const fixList = (list) => list.map(correctItem).filter((x) => x !== null);
  if (Array.isArray(data)) return fixList(data);
  if (data && typeof data === "object") {
    for (const key of ["features", "results", "wrecks", "items"]) {
      if (Array.isArray(data[key])) data[key] = fixList(data[key]);
    }
  }
  return data;
}

export async function GET(request, { params }) {
  const path = (await params).path?.join("/") || "";
  const url = new URL(request.url);
  const queryString = url.search;
  const backendUrl = `${BACKEND_URL}/${path}${queryString}`;

  try {
    const res = await fetch(backendUrl, {
      cache: "no-store",
    });

    if (res.ok && CORRECTED_PATHS.has(path)) {
      try {
        const data = await res.json();
        return NextResponse.json(applyCorrections(data), { status: res.status });
      } catch (parseErr) {
        console.error("Corrections skipped (bad JSON):", parseErr);
        return NextResponse.json({ error: "Backend returned invalid JSON" }, { status: 502 });
      }
    }

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
