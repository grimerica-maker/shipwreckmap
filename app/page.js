"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [count, setCount] = useState(null);

  useEffect(() => {
    fetch("/api/engine/wrecks/stats")
      .then(r => r.json())
      .then(d => setCount(d))
      .catch(() => {});
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0e17",
      color: "#e0e0e0",
      fontFamily: "'Source Serif 4', Georgia, serif",
    }}>
      {/* Hero */}
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "40px 20px",
        background: "radial-gradient(ellipse at 50% 80%, rgba(20,60,100,0.3) 0%, transparent 60%), #0a0e17",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Subtle wave lines */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 200,
          background: "repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(74,144,217,0.03) 8px, rgba(74,144,217,0.03) 9px)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <img
            src="/logo.png"
            alt="ShipwreckMap.ca"
            style={{
              width: "clamp(200px, 35vw, 360px)",
              height: "auto",
              marginBottom: 20,
              filter: "drop-shadow(0 8px 32px rgba(0,0,0,0.5))",
            }}
          />

          <p style={{
            fontSize: "clamp(16px, 2.5vw, 22px)",
            color: "#8899aa",
            maxWidth: 600,
            lineHeight: 1.6,
            margin: "0 auto 32px",
          }}>
            {count
              ? `${count.total.toLocaleString()} documented wrecks. ${count.total_casualties.toLocaleString()} lives lost. Centuries of maritime and aviation disasters — mapped.`
              : "Explore centuries of maritime and aviation disasters on a single interactive map. Historical wrecks. Live vessel tracking. The world's most dangerous waters."
            }
          </p>

          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/map" style={{
              display: "inline-block",
              padding: "14px 36px",
              background: "linear-gradient(135deg, #1a5276 0%, #2980b9 100%)",
              color: "#fff",
              textDecoration: "none",
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              letterSpacing: "0.5px",
              transition: "transform 0.2s, box-shadow 0.2s",
              boxShadow: "0 4px 20px rgba(41,128,185,0.3)",
            }}
              onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 30px rgba(41,128,185,0.4)"; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(41,128,185,0.3)"; }}
            >
              Open the Map →
            </a>
            <a href="/pro" style={{
              display: "inline-block",
              padding: "14px 36px",
              background: "transparent",
              color: "#8ab4d8",
              textDecoration: "none",
              borderRadius: 8,
              fontSize: 16,
              border: "1px solid rgba(138,180,216,0.3)",
              letterSpacing: "0.5px",
              transition: "border-color 0.2s",
            }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = "rgba(138,180,216,0.6)"; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = "rgba(138,180,216,0.3)"; }}
            >
              Go Pro
            </a>
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={{
        maxWidth: 1000, margin: "0 auto", padding: "80px 20px",
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32 }}>
          <FeatureCard
            icon="⚓"
            title="Historical Shipwrecks"
            desc="30,000+ documented shipwrecks from the Age of Sail to modern disasters. Cause of loss, casualties, depth, cargo — every detail mapped."
          />
          <FeatureCard
            icon="✈️"
            title="Aviation Disasters"
            desc="Major aviation accidents worldwide. Ocean crashes, mountain impacts, disappearances. From Amelia Earhart to MH370."
          />
          <FeatureCard
            icon="🚢"
            title="Live Vessel Tracking"
            desc="Real-time AIS positions of ships worldwide. Filter by type — cargo, tanker, passenger, fishing, military. Updated every 60 seconds."
          />
          <FeatureCard
            icon="🗺️"
            title="Historical Routes"
            desc="The Maritime Silk Road. The Spanish Treasure Fleet. The Middle Passage. See the routes that shaped — and ended — history."
          />
          <FeatureCard
            icon="⚠️"
            title="Danger Zones"
            desc="The Bermuda Triangle. Cape Horn. The Strait of Malacca. The world's most treacherous waters, mapped with wreck density."
          />
          <FeatureCard
            icon="📊"
            title="Export & Research"
            desc="Pro users can export wreck data as CSV, bookmark wrecks, and track live vessel movements over time."
          />
        </div>
      </div>

      {/* Pricing teaser */}
      <div style={{
        textAlign: "center", padding: "60px 20px 80px",
        borderTop: "1px solid rgba(255,255,255,0.05)",
      }}>
        <div style={{
          fontSize: 11, textTransform: "uppercase", letterSpacing: "3px",
          color: "#4a6a8a", marginBottom: 12,
        }}>
          Pro Access
        </div>
        <div style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 36, fontWeight: 700, color: "#e0e0e0", marginBottom: 8,
        }}>
          $12.99<span style={{ fontSize: 16, color: "#666" }}>/year</span>
          <span style={{ margin: "0 16px", color: "#333" }}>or</span>
          $29.99 <span style={{ fontSize: 16, color: "#666" }}>lifetime</span>
        </div>
        <p style={{ color: "#666", marginBottom: 24 }}>
          Ship trails · CSV export · Bookmarks · Depth contours · No ads
        </p>
        <a href="/pro" style={{
          display: "inline-block",
          padding: "12px 32px",
          background: "linear-gradient(135deg, #1a5276 0%, #2980b9 100%)",
          color: "#fff",
          textDecoration: "none",
          borderRadius: 8,
          fontSize: 15,
          fontWeight: 600,
        }}>
          Upgrade to Pro →
        </a>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: "center", padding: "20px",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        fontSize: 12, color: "#444",
      }}>
        © 2026 ShipwreckMap.ca · Data: Wikidata, NOAA AWOIS, OpenStreetMap, AISStream ·{" "}
        <a href="https://disastermap.ca" style={{ color: "#4a6a8a", textDecoration: "none" }}>DisasterMap</a> ·{" "}
        <a href="https://volcanosim.com" style={{ color: "#4a6a8a", textDecoration: "none" }}>VolcanoSim</a> ·{" "}
        <a href="https://ufomap.ca" style={{ color: "#4a6a8a", textDecoration: "none" }}>UFOMAP</a>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 12,
      padding: "28px 24px",
      transition: "border-color 0.2s, background 0.2s",
    }}
      onMouseOver={(e) => { e.currentTarget.style.borderColor = "rgba(74,144,217,0.2)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
      onMouseOut={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
    >
      <div style={{ fontSize: 28, marginBottom: 12 }}>{icon}</div>
      <h3 style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: 18, fontWeight: 700, color: "#e0e0e0", margin: "0 0 8px",
      }}>{title}</h3>
      <p style={{ fontSize: 14, color: "#888", lineHeight: 1.6, margin: 0 }}>{desc}</p>
    </div>
  );
}
