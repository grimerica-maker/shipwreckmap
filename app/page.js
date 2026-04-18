"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useBundleCheck } from "../lib/useBundleCheck";

const NOTABLE = [
  { name: "RMS Titanic", date: "1912-04-15", lat: 41.726, lng: -49.948, depth: 3784, cause: "Iceberg collision", dead: 1517 },
  { name: "RMS Lusitania", date: "1915-05-07", lat: 51.25, lng: -8.55, depth: 93, cause: "Torpedo", dead: 1198 },
  { name: "SS Edmund Fitzgerald", date: "1975-11-10", lat: 46.99, lng: -85.11, depth: 160, cause: "Storm", dead: 29 },
  { name: "MV Wilhelm Gustloff", date: "1945-01-30", lat: 55.07, lng: 17.41, depth: 44, cause: "Torpedo", dead: 9343 },
  { name: "SS Andrea Doria", date: "1956-07-25", lat: 40.29, lng: -69.85, depth: 69, cause: "Collision", dead: 46 },
  { name: "HMS Hood", date: "1941-05-24", lat: 63.33, lng: -31.87, depth: 2800, cause: "Naval battle", dead: 1415 },
  { name: "Bismarck", date: "1941-05-27", lat: 48.17, lng: -16.2, depth: 4791, cause: "Scuttled under fire", dead: 2104 },
  { name: "USS Arizona", date: "1941-12-07", lat: 21.365, lng: -157.95, depth: 12, cause: "Aerial bombing", dead: 1177 },
  { name: "SS Eastland", date: "1915-07-24", lat: 41.886, lng: -87.632, depth: 6, cause: "Capsized at dock", dead: 844 },
  { name: "MV Dona Paz", date: "1987-12-20", lat: 12.25, lng: 121.6, depth: 545, cause: "Collision + fire", dead: 4386 },
  { name: "ARA San Juan", date: "2017-11-15", lat: -46.44, lng: -59.78, depth: 907, cause: "Implosion", dead: 44 },
  { name: "Yamato", date: "1945-04-07", lat: 30.43, lng: 128.08, depth: 340, cause: "Aerial attack", dead: 3055 },
];

export default function Home() {
  const { user } = useUser();
  const tier = user?.publicMetadata?.shipmap_tier;
  const isIndividualPro = tier === "pro" || tier === "lifetime";
  const { active: isBundle } = useBundleCheck(user?.primaryEmailAddress?.emailAddress);
  const isPro = isIndividualPro || isBundle;

  const [stats, setStats] = useState(null);
  const [tickerIdx, setTickerIdx] = useState(0);
  const [wrecks, setWrecks] = useState([]);
  const [wreckPage, setWreckPage] = useState(0);
  const [wreckSearch, setWreckSearch] = useState("");
  const [wreckTypeFilter, setWreckTypeFilter] = useState("all");
  const WRECKS_PER_PAGE = 50;

  useEffect(() => {
    fetch("/api/engine/wrecks/stats")
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/engine/wrecks/all")
      .then(r => r.json())
      .then(d => { if (d.features) setWrecks(d.features); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTickerIdx(i => (i + 1) % NOTABLE.length), 4000);
    return () => clearInterval(t);
  }, []);

  const notable = NOTABLE[tickerIdx];

  const filtered = wrecks.filter(f => {
    const p = f.properties;
    if (wreckTypeFilter !== "all" && p.type !== wreckTypeFilter) return false;
    if (wreckSearch) {
      const q = wreckSearch.toLowerCase();
      return (p.name || "").toLowerCase().includes(q) ||
        (p.cause || "").toLowerCase().includes(q) ||
        (p.flag || "").toLowerCase().includes(q);
    }
    return true;
  });
  const totalPages = Math.ceil(filtered.length / WRECKS_PER_PAGE);
  const pageWrecks = filtered.slice(wreckPage * WRECKS_PER_PAGE, (wreckPage + 1) * WRECKS_PER_PAGE);

  const shareText = stats
    ? `${stats.total.toLocaleString()} shipwrecks mapped worldwide. Live vessel tracking. WWII wrecks. Danger zones.\n\nhttps://www.shipwreckmap.ca`
    : "87,000+ shipwrecks mapped worldwide with live vessel tracking, WWII filter, and danger zones.\n\nhttps://www.shipwreckmap.ca";

  return (
    <div style={{
      minHeight: "100vh", background: "#060a12", color: "#c8d0da",
      fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet" />

      {/* ═══ HERO ═══ */}
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "40px 20px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 50% 120%, rgba(8,40,70,0.5) 0%, rgba(6,10,18,0) 65%), radial-gradient(ellipse at 20% 0%, rgba(15,35,60,0.3) 0%, transparent 50%), radial-gradient(ellipse at 80% 10%, rgba(10,25,50,0.2) 0%, transparent 40%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "repeating-linear-gradient(0deg, transparent 0px, transparent 60px, rgba(30,80,130,0.04) 60px, rgba(30,80,130,0.04) 61px), repeating-linear-gradient(90deg, transparent 0px, transparent 120px, rgba(30,80,130,0.02) 120px, rgba(30,80,130,0.02) 121px)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 800 }}>
          <img src="/logo.png" alt="ShipwreckMap.ca" style={{
            width: "clamp(180px, 30vw, 320px)", height: "auto", marginBottom: 24,
            filter: "drop-shadow(0 12px 40px rgba(0,0,0,0.7))",
          }} />

          {stats && (
            <div style={{
              display: "flex", gap: "clamp(16px, 4vw, 48px)",
              justifyContent: "center", flexWrap: "wrap", marginBottom: 28,
            }}>
              <StatNumber value={stats.total} label="Wrecks Mapped" />
              <StatNumber value={stats.by_type?.ship || 85428} label="Ships" />
              <StatNumber value={stats.by_type?.aviation || 1848} label="Aircraft" />
              <StatNumber value={6} label="Data Sources" />
            </div>
          )}

          <p style={{
            fontSize: "clamp(15px, 2.2vw, 20px)", color: "#6a7a8a",
            maxWidth: 620, lineHeight: 1.7, margin: "0 auto 12px",
            fontFamily: "'DM Sans', sans-serif", fontWeight: 400,
          }}>
            87,000+ historical shipwrecks and aviation disasters on a satellite globe.
            Live vessel tracking. WWII submarine graveyards. Wikipedia summaries.
            The ocean floor's darkest history — mapped.
          </p>

          <div style={{
            margin: "0 auto 32px", padding: "10px 20px",
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 8, maxWidth: 500, transition: "opacity 0.3s",
          }}>
            <div style={{ fontSize: 13, color: "#4a7a9a", fontFamily: "'DM Sans', sans-serif", marginBottom: 2 }}>
              ⚓ {notable.name}
            </div>
            <div style={{ fontSize: 11, color: "#3a5a6a", fontFamily: "'DM Sans', sans-serif" }}>
              {notable.date} · {notable.cause} · {notable.dead.toLocaleString()} lost · {notable.depth}m deep
            </div>
          </div>

          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 20 }}>
            <Link href="/map" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "15px 38px",
              background: "linear-gradient(135deg, #0c3d5f 0%, #1a6b9a 100%)",
              color: "#fff", textDecoration: "none", borderRadius: 10,
              fontSize: 17, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
              letterSpacing: "0.3px",
              boxShadow: "0 4px 24px rgba(26,107,154,0.35), inset 0 1px 0 rgba(255,255,255,0.1)",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
              onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(26,107,154,0.5), inset 0 1px 0 rgba(255,255,255,0.1)"; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 24px rgba(26,107,154,0.35), inset 0 1px 0 rgba(255,255,255,0.1)"; }}
            >
              Explore the Map →
            </Link>
            <Link href="/pro" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "15px 32px", background: "transparent",
              color: "#5a9abf", textDecoration: "none", borderRadius: 10,
              fontSize: 16, fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
              border: "1px solid rgba(90,154,191,0.25)", transition: "border-color 0.2s, color 0.2s",
            }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = "rgba(90,154,191,0.5)"; e.currentTarget.style.color = "#7ab8da"; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = "rgba(90,154,191,0.25)"; e.currentTarget.style.color = "#5a9abf"; }}
            >
              Go Pro — $12.99/yr
            </Link>
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            <ShareBtn label="𝕏 Share" onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, "_blank")} bg="#000" />
            <ShareBtn label="f Share" onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent("https://www.shipwreckmap.ca")}`, "_blank")} bg="#1877f2" />
            <ShareBtn label="🔗 Copy" onClick={() => { navigator.clipboard.writeText("https://www.shipwreckmap.ca"); }} bg="#1a2a3a" />
          </div>
        </div>

        <div style={{
          position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)",
          fontSize: 11, color: "#2a4a5a", fontFamily: "'DM Sans', sans-serif",
          letterSpacing: "2px", textTransform: "uppercase", animation: "pulse 2s infinite",
        }}>↓ scroll ↓</div>
      </div>

      {/* ═══ FEATURES ═══ */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 20px" }}>
        <div style={{
          fontSize: 11, textTransform: "uppercase", letterSpacing: "4px",
          color: "#2a5a7a", marginBottom: 12, textAlign: "center",
          fontFamily: "'DM Sans', sans-serif",
        }}>What You Get</div>
        <h2 style={{
          fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 700, color: "#d0d8e0",
          textAlign: "center", margin: "0 0 48px", lineHeight: 1.2,
        }}>Six data sources. One map.</h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          <FeatureCard icon="⚓" title="87,000+ Shipwrecks" accent="#1a6b9a"
            desc="Six merged sources: UKHO, NOAA AWOIS, NOAA ENC, Wikidata, OpenStreetMap, and hand-curated notable wrecks. Deduplicated, geocoded, depth-enriched from GEBCO bathymetry." />
          <FeatureCard icon="✈️" title="1,848 Aviation Crashes" accent="#c0392b"
            desc="Ocean ditchings, mountain impacts, and disappearances. MH370, Air France 447, Amelia Earhart — every major aviation disaster with coordinates." />
          <FeatureCard icon="🚢" title="19,000+ Live Vessels" accent="#2ecc71"
            desc="Real-time AIS positions streaming via AISStream.io. Cargo, tanker, passenger, fishing, military. Updated every 60 seconds with 30-minute trail history." />
          <FeatureCard icon="💣" title="WWII Filter" accent="#f39c12"
            desc="3,851 dated World War II wrecks including 683 U-boats with coordinates. Toggle the WWII filter to see submarine graveyards across the Atlantic and Pacific." />
          <FeatureCard icon="⚠️" title="20 Danger Zones" accent="#e74c3c"
            desc="Bermuda Triangle. Cape Horn. Strait of Malacca. Iron Bottom Sound. Each zone shows live wreck counts, ship traffic, and aviation crash density." />
          <FeatureCard icon="📖" title="Wikipedia In-Popup" accent="#8e44ad"
            desc="44,000 wrecks with Wikipedia buttons. Click any wreck to see the full article summary, photo, and link — rendered directly in the map popup." />
          <FeatureCard icon="🌊" title="Bathymetry Overlay" accent="#0ea5e9" pro
            desc="GEBCO ocean floor visualization via ArcGIS tiles. See the underwater terrain where wrecks rest — continental shelves, trenches, and abyssal plains." />
          <FeatureCard icon="🗺️" title="12 Trade Routes" accent="#d97706"
            desc="Maritime Silk Road. Spanish Treasure Fleet. Triangle Trade. Spice Route. See the historical corridors that shaped world commerce — and where ships were lost." />
          <FeatureCard icon="📊" title="CSV Export & Trails" accent="#06b6d4" pro
            desc="Export the full wreck database as CSV. Track live vessel movements with 30-minute trail lines. Research-grade data access for maritime historians." />
        </div>
      </div>

      {/* ═══ WRECK DATABASE ═══ */}
      <div id="wrecks" style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 20px 80px" }}>
        <div style={{
          fontSize: 11, textTransform: "uppercase", letterSpacing: "4px",
          color: "#2a5a7a", marginBottom: 12, textAlign: "center",
          fontFamily: "'DM Sans', sans-serif",
        }}>Browse the Database</div>
        <h2 style={{
          fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 700, color: "#d0d8e0",
          textAlign: "center", margin: "0 0 24px", lineHeight: 1.2,
        }}>{filtered.length.toLocaleString()} Wrecks</h2>

        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", justifyContent: "center" }}>
          <input type="text" placeholder="Search by name, cause, flag..."
            value={wreckSearch}
            onChange={(e) => { setWreckSearch(e.target.value); setWreckPage(0); }}
            style={{
              padding: "10px 16px", background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
              color: "#c8d0da", fontSize: 14, fontFamily: "'DM Sans', sans-serif",
              width: "clamp(200px, 40vw, 360px)", outline: "none",
            }} />
          <select value={wreckTypeFilter}
            onChange={(e) => { setWreckTypeFilter(e.target.value); setWreckPage(0); }}
            style={{
              padding: "10px 14px", background: "#0d1520",
              border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
              color: "#c8d0da", fontSize: 14, fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
            }}>
            <option value="all">All Types</option>
            <option value="ship">Ships Only</option>
            <option value="aviation">Aviation Only</option>
          </select>
        </div>

        <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                {["Name", "Type", "Date", "Cause", "Depth", "Flag", ""].map(h => (
                  <th key={h} style={{
                    padding: "10px 12px", textAlign: "left", color: "#4a7090",
                    fontSize: 11, textTransform: "uppercase", letterSpacing: "1px",
                    borderBottom: "1px solid rgba(255,255,255,0.06)", whiteSpace: "nowrap",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageWrecks.map((f, i) => {
                const p = f.properties;
                return (
                  <tr key={p.id || i} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", transition: "background 0.15s" }}
                    onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                    onMouseOut={(e) => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "8px 12px", color: "#b0bcc8", fontWeight: 600 }}>
                      {p.type === "aviation" ? "✈️" : "⚓"} {p.name || "Unknown"}
                    </td>
                    <td style={{ padding: "8px 12px", color: "#5a7080", fontSize: 12, textTransform: "capitalize" }}>
                      {p.vessel_type || p.type || "—"}
                    </td>
                    <td style={{ padding: "8px 12px", color: "#5a7080", whiteSpace: "nowrap" }}>{p.date || "—"}</td>
                    <td style={{ padding: "8px 12px", color: "#5a7080", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.cause || "—"}
                    </td>
                    <td style={{ padding: "8px 12px", color: "#5a7080" }}>{p.depth_m ? `${Math.round(p.depth_m)}m` : "—"}</td>
                    <td style={{ padding: "8px 12px", color: "#5a7080" }}>{p.flag || "—"}</td>
                    <td style={{ padding: "8px 12px" }}>
                      <Link href={isPro
                        ? `/map?lat=${f.geometry?.coordinates?.[1]}&lng=${f.geometry?.coordinates?.[0]}&wreck=${encodeURIComponent(p.name || "Wreck")}`
                        : "/pro"}
                        style={{
                          color: isPro ? "#22c55e" : "#1a6b9a", fontSize: 11, textDecoration: "none",
                          padding: "4px 10px",
                          border: `1px solid ${isPro ? "rgba(34,197,94,0.3)" : "rgba(26,107,154,0.3)"}`,
                          borderRadius: 6, whiteSpace: "nowrap", transition: "background 0.15s",
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = isPro ? "rgba(34,197,94,0.15)" : "rgba(26,107,154,0.15)"}
                        onMouseOut={(e) => e.currentTarget.style.background = "transparent"}>
                        {isPro ? "✈️ Fly to →" : "🔒 Fly to →"}
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {pageWrecks.length === 0 && (
                <tr><td colSpan={7} style={{ padding: 24, textAlign: "center", color: "#3a5060" }}>
                  {wrecks.length === 0 ? "Loading wrecks..." : "No wrecks match your search."}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 16, fontFamily: "'DM Sans', sans-serif" }}>
            <PageBtn label="← Prev" onClick={() => setWreckPage(p => Math.max(0, p - 1))} disabled={wreckPage === 0} />
            <span style={{ color: "#4a7090", fontSize: 13 }}>Page {wreckPage + 1} of {totalPages.toLocaleString()}</span>
            <PageBtn label="Next →" onClick={() => setWreckPage(p => Math.min(totalPages - 1, p + 1))} disabled={wreckPage >= totalPages - 1} />
          </div>
        )}
      </div>

      {/* ═══ PRICING ═══ */}
      <div style={{
        textAlign: "center", padding: "64px 20px 40px",
        borderTop: "1px solid rgba(255,255,255,0.04)",
        background: "linear-gradient(180deg, transparent 0%, rgba(8,25,45,0.3) 100%)",
      }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "4px", color: "#2a5a7a", marginBottom: 16, fontFamily: "'DM Sans', sans-serif" }}>Pro Access</div>
        <div style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700, color: "#d0d8e0", marginBottom: 8 }}>
          $12.99<span style={{ fontSize: "0.4em", color: "#4a6a80" }}>/year</span>
          <span style={{ margin: "0 16px", color: "#1a2a3a", fontSize: "0.5em" }}>or</span>
          $29.99 <span style={{ fontSize: "0.4em", color: "#4a6a80" }}>lifetime</span>
        </div>
        <p style={{ color: "#4a6a80", marginBottom: 28, fontSize: 15, fontFamily: "'DM Sans', sans-serif", maxWidth: 500, margin: "0 auto 28px" }}>
          Ship trail tracking · Bathymetry overlay · CSV export · Full database access
        </p>
        <Link href="/pro" style={{
          display: "inline-block", padding: "14px 36px",
          background: "linear-gradient(135deg, #0c3d5f 0%, #1a6b9a 100%)",
          color: "#fff", textDecoration: "none", borderRadius: 10,
          fontSize: 16, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
          boxShadow: "0 4px 20px rgba(26,107,154,0.3)",
        }}>Upgrade to Pro →</Link>
      </div>

      {/* ═══ BUNDLE CTA ═══ */}
      <div style={{
        padding: "8px 20px 80px",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#4a6a80", marginBottom: 16, fontFamily: "'DM Sans', sans-serif" }}>— OR —</div>
        <a
          href="https://www.simulationmaps.com/#bundle"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            textDecoration: "none",
            maxWidth: 560,
            width: "100%",
            padding: "24px 28px",
            background: "linear-gradient(135deg, rgba(251,146,60,0.10), rgba(251,146,60,0.02))",
            border: "2px solid #fb923c",
            borderRadius: 14,
            textAlign: "left",
            position: "relative",
            transition: "transform 0.15s",
            fontFamily: "'DM Sans', sans-serif",
          }}
          onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseOut={(e) => { e.currentTarget.style.transform = ""; }}
        >
          <div style={{
            position: "absolute", top: -10, left: 20,
            background: "#fb923c", color: "#0a0e17",
            fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700,
            padding: "4px 10px", borderRadius: 3,
          }}>
            Best value · All 6 Maps
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#fb923c", fontWeight: 700, marginBottom: 6 }}>
                SimulationMaps All-Access Bundle
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 34, fontWeight: 700, color: "#fb923c" }}>$79</span>
                <span style={{ fontSize: 13, color: "#6a8aa0" }}>lifetime · all 6 maps</span>
              </div>
              <div style={{ fontSize: 13, color: "#d0d8e0", lineHeight: 1.5, marginBottom: 4 }}>
                ShipwreckMap Pro + DisasterMap + VolcanoSim + AsteroidSim + UfoMap + Climate Impact Map.
              </div>
              <div style={{ fontSize: 12, color: "#6a8aa0" }}>
                Only <strong style={{ color: "#fb923c" }}>$49 more</strong> than ShipwreckMap Lifetime alone.
              </div>
            </div>
            <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#fb923c", fontWeight: 700, whiteSpace: "nowrap" }}>
              See bundle →
            </div>
          </div>
        </a>
      </div>

      {/* ═══ FOOTER ═══ */}
      <div style={{
        textAlign: "center", padding: "24px 20px",
        borderTop: "1px solid rgba(255,255,255,0.04)",
        fontSize: 12, color: "#2a3a4a", fontFamily: "'DM Sans', sans-serif",
      }}>
        <div style={{ marginBottom: 8 }}>© 2026 ShipwreckMap.ca · Data: UKHO/EMODnet · NOAA · Wikidata · OSM · AISStream</div>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="https://x.com/grimerica" style={{ color: "#5a9abf", textDecoration: "none", fontWeight: 600 }}>𝕏 @grimerica</a>
          <a href="https://disastermap.ca" style={{ color: "#3a5a7a", textDecoration: "none" }}>DisasterMap</a>
          <a href="https://volcanosim.com" style={{ color: "#3a5a7a", textDecoration: "none" }}>VolcanoSim</a>
          <a href="https://ufomap.ca" style={{ color: "#3a5a7a", textDecoration: "none" }}>UFOMAP</a>
          <a href="https://theclimateimpactmap.com" style={{ color: "#3a5a7a", textDecoration: "none" }}>Climate Impact Map</a>
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #060a12; }
        ::-webkit-scrollbar-thumb { background: #1a2a3a; border-radius: 3px; }
      `}</style>
    </div>
  );
}

function StatNumber({ value, label }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 700, color: "#c0d0e0", lineHeight: 1 }}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      <div style={{ fontSize: 11, color: "#3a5a6a", textTransform: "uppercase", letterSpacing: "2px", marginTop: 4, fontFamily: "'DM Sans', sans-serif" }}>{label}</div>
    </div>
  );
}

function FeatureCard({ icon, title, desc, accent = "#1a6b9a", pro = false }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)",
      borderRadius: 12, padding: "24px 22px", transition: "border-color 0.2s, background 0.2s",
      position: "relative",
    }}
      onMouseOver={(e) => { e.currentTarget.style.borderColor = `${accent}33`; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
      onMouseOut={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; e.currentTarget.style.background = "rgba(255,255,255,0.015)"; }}>
      {pro && <span style={{
        position: "absolute", top: 12, right: 12, fontSize: 9, color: accent, fontWeight: 700,
        background: `${accent}15`, padding: "2px 8px", borderRadius: 6, letterSpacing: "1px",
        fontFamily: "'DM Sans', sans-serif",
      }}>PRO</span>}
      <div style={{ fontSize: 26, marginBottom: 10 }}>{icon}</div>
      <h3 style={{ fontSize: 17, fontWeight: 700, color: "#c8d4de", margin: "0 0 8px", fontFamily: "'DM Sans', sans-serif" }}>{title}</h3>
      <p style={{ fontSize: 13, color: "#5a6a7a", lineHeight: 1.65, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{desc}</p>
    </div>
  );
}

function ShareBtn({ label, onClick, bg }) {
  return (
    <button onClick={onClick} style={{
      padding: "7px 14px", background: bg, color: "#fff",
      border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700,
      cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "opacity 0.15s",
    }}
      onMouseOver={(e) => e.currentTarget.style.opacity = "0.8"}
      onMouseOut={(e) => e.currentTarget.style.opacity = "1"}>
      {label}
    </button>
  );
}

function PageBtn({ label, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: "7px 14px", background: disabled ? "transparent" : "rgba(255,255,255,0.04)",
      color: disabled ? "#2a3a4a" : "#6a8a9a",
      border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8,
      fontSize: 12, cursor: disabled ? "default" : "pointer",
      fontFamily: "'DM Sans', sans-serif", fontWeight: 600, transition: "background 0.15s",
    }}>{label}</button>
  );
}
