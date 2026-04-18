"use client";
import { useUser, SignInButton } from "@clerk/nextjs";
import { useBundleCheck } from "../../lib/useBundleCheck";
import { useEffect } from "react";

const SIMMAPS_BUNDLE_URL = "https://www.simulationmaps.com/#bundle";

const PRO_FEATURES = {
  trail: {
    icon: "🚢",
    title: "Ship Movement Trails",
    desc: "Track a vessel's path over the last 30 minutes. See where ships have been and where they're heading.",
  },
  export: {
    icon: "📊",
    title: "Export Wreck Data",
    desc: "Download wreck data as CSV for your own research, analysis, or projects.",
  },
  bookmark: {
    icon: "📌",
    title: "Bookmarked Wrecks",
    desc: "Save wrecks you've discovered and build your own collection to revisit later.",
  },
  depth: {
    icon: "🌊",
    title: "Depth Contours",
    desc: "Overlay ocean depth contours to understand the seafloor beneath wrecks and shipping lanes.",
  },
  weather: {
    icon: "🌧️",
    title: "Historical Weather",
    desc: "See what conditions were like when a wreck occurred — wind, waves, visibility.",
  },
  search: {
    icon: "🔍",
    title: "Advanced Search",
    desc: "Filter wrecks by name, vessel type, nationality, year, and more.",
  },
};

export default function PaywallModal({ feature, onClose }) {
  const { isSignedIn, user } = useUser();
  const { active: isBundle } = useBundleCheck(user?.primaryEmailAddress?.emailAddress);

  // Auto-close if user has bundle — they shouldn't be paywalled
  useEffect(() => {
    if (feature && isBundle) onClose();
  }, [feature, isBundle, onClose]);

  if (!feature) return null;
  if (isBundle) return null;

  const config = PRO_FEATURES[feature] || PRO_FEATURES.trail;

  const YEARLY_LINK = process.env.NEXT_PUBLIC_STRIPE_YEARLY_LINK || "#";
  const LIFETIME_LINK = process.env.NEXT_PUBLIC_STRIPE_LIFETIME_LINK || "#";

  const getCheckoutUrl = (baseUrl) => {
    if (!isSignedIn || !user) return null;
    return `${baseUrl}?client_reference_id=${user.id}&prefilled_email=${encodeURIComponent(user.primaryEmailAddress?.emailAddress || "")}`;
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#0f1520",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 14,
          padding: "36px 32px",
          maxWidth: 440,
          width: "100%",
          position: "relative",
          fontFamily: "'Source Serif 4', Georgia, serif",
          color: "#e0e0e0",
          maxHeight: "92vh",
          overflowY: "auto",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 12, right: 14,
            background: "none", border: "none",
            color: "#555", fontSize: 20, cursor: "pointer",
            lineHeight: 1,
          }}
        >✕</button>

        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>{config.icon}</div>
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 22, fontWeight: 700, marginBottom: 8,
          }}>
            {config.title}
          </h2>
          <p style={{ color: "#888", fontSize: 14, lineHeight: 1.5 }}>
            {config.desc}
          </p>
        </div>

        <div style={{
          textAlign: "center",
          fontSize: 11, textTransform: "uppercase", letterSpacing: "2px",
          color: "#4a90d9", marginBottom: 16,
        }}>
          Pro Feature
        </div>

        {/* BUNDLE CTA */}
        <a
          href={SIMMAPS_BUNDLE_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            padding: "12px 14px",
            background: "linear-gradient(135deg, rgba(251,146,60,0.14), rgba(251,146,60,0.04))",
            border: "1.5px solid #fb923c",
            borderRadius: 10,
            marginBottom: 16,
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "#fb923c", fontWeight: 700, marginBottom: 2 }}>
              Or get all 6 maps
            </div>
            <div style={{ fontSize: 13, color: "#e0e0e0", fontWeight: 600, lineHeight: 1.3 }}>
              <strong style={{ color: "#fb923c" }}>$79 lifetime</strong> · all SimulationMaps Pro
            </div>
          </div>
          <div style={{ fontSize: 10, color: "#fb923c", fontWeight: 700, letterSpacing: "0.1em", whiteSpace: "nowrap" }}>
            SEE BUNDLE →
          </div>
        </a>

        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <PriceOption
            label="Yearly"
            price="$12.99"
            sub="/year"
            href={isSignedIn ? getCheckoutUrl(YEARLY_LINK) : null}
            isSignedIn={isSignedIn}
          />
          <PriceOption
            label="Lifetime"
            price="$29.99"
            sub="once"
            href={isSignedIn ? getCheckoutUrl(LIFETIME_LINK) : null}
            isSignedIn={isSignedIn}
            highlight
          />
        </div>

        {!isSignedIn && (
          <div style={{ textAlign: "center" }}>
            <SignInButton mode="modal">
              <button style={{
                width: "100%", padding: "14px",
                background: "linear-gradient(135deg, #1a5276 0%, #2980b9 100%)",
                color: "#fff", border: "none", borderRadius: 8,
                fontSize: 15, fontWeight: 600, cursor: "pointer",
                fontFamily: "'Source Serif 4', Georgia, serif",
              }}>
                Sign in to upgrade
              </button>
            </SignInButton>
          </div>
        )}

        <div style={{
          marginTop: 18, paddingTop: 14,
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "1.5px", color: "#555", marginBottom: 8 }}>
            Also included with Pro
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {Object.entries(PRO_FEATURES)
              .filter(([key]) => key !== feature)
              .map(([key, cfg]) => (
                <span key={key} style={{
                  fontSize: 12, color: "#666",
                  background: "rgba(255,255,255,0.04)",
                  padding: "4px 10px", borderRadius: 20,
                }}>
                  {cfg.icon} {cfg.title}
                </span>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PriceOption({ label, price, sub, href, isSignedIn, highlight }) {
  const content = (
    <div style={{
      flex: 1,
      background: highlight ? "rgba(41,128,185,0.08)" : "rgba(255,255,255,0.03)",
      border: highlight ? "1px solid rgba(41,128,185,0.3)" : "1px solid rgba(255,255,255,0.08)",
      borderRadius: 10,
      padding: "16px 12px",
      textAlign: "center",
      cursor: isSignedIn && href ? "pointer" : "default",
      transition: "border-color 0.2s",
    }}>
      <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "1.5px", color: "#666", marginBottom: 6 }}>
        {label}
      </div>
      <div style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: 24, fontWeight: 700, marginBottom: 2,
      }}>
        {price}
      </div>
      <div style={{ fontSize: 12, color: "#555" }}>{sub}</div>
    </div>
  );

  if (isSignedIn && href) {
    return <a href={href} style={{ flex: 1, textDecoration: "none", color: "inherit" }}>{content}</a>;
  }
  return content;
}
