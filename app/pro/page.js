"use client";
import { useUser, SignInButton } from "@clerk/nextjs";
import { useBundleCheck } from "@/lib/useBundleCheck";

const SIMMAPS_BUNDLE_URL = "https://www.simulationmaps.com/#bundle";

export default function ProPage() {
  const { isSignedIn, user } = useUser();
  const tier = user?.publicMetadata?.shipmap_tier;
  const isIndividualPro = tier === "pro" || tier === "lifetime";

  const { active: isBundle, plan: bundlePlan } = useBundleCheck(user?.primaryEmailAddress?.emailAddress);
  const isPro = isIndividualPro || isBundle;

  const YEARLY_LINK = process.env.NEXT_PUBLIC_STRIPE_YEARLY_LINK || "#";
  const LIFETIME_LINK = process.env.NEXT_PUBLIC_STRIPE_LIFETIME_LINK || "#";

  const getCheckoutUrl = (baseUrl) => {
    if (!isSignedIn) return null;
    return `${baseUrl}?client_reference_id=${user.id}&prefilled_email=${encodeURIComponent(user.primaryEmailAddress?.emailAddress || "")}`;
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0e17",
      color: "#e0e0e0",
      fontFamily: "'Source Serif 4', Georgia, serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
    }}>
      <a href="/" style={{
        position: "absolute", top: 20, left: 20,
        color: "#4a6a8a", textDecoration: "none", fontSize: 14,
      }}>← Back</a>

      <div style={{
        fontSize: 11, textTransform: "uppercase", letterSpacing: "4px",
        color: "#4a6a8a", marginBottom: 12,
      }}>
        ShipwreckMap Pro
      </div>

      <h1 style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: 42, fontWeight: 700, marginBottom: 16,
        background: "linear-gradient(135deg, #e0e0e0 0%, #8ab4d8 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}>
        {isPro ? "You're Pro" : "Unlock Everything"}
      </h1>

      {isPro ? (
        <div style={{
          textAlign: "center", maxWidth: 480,
          background: "rgba(41,128,185,0.1)", border: "1px solid rgba(41,128,185,0.3)",
          borderRadius: 12, padding: 32,
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✓</div>
          <p style={{ color: "#8ab4d8", fontSize: 16, marginBottom: 16 }}>
            {isBundle ? (
              <>Access granted via your SimulationMaps <strong>{bundlePlan}</strong> bundle. All features unlocked.</>
            ) : (
              <>You have {tier} Pro access. All features are unlocked.</>
            )}
          </p>
          <a href="/map" style={{
            display: "inline-block", marginTop: 16,
            padding: "10px 24px", background: "rgba(41,128,185,0.2)",
            color: "#8ab4d8", textDecoration: "none", borderRadius: 8,
            border: "1px solid rgba(41,128,185,0.3)",
          }}>Open Map →</a>
        </div>
      ) : (
        <>
          <p style={{ color: "#888", maxWidth: 500, textAlign: "center", lineHeight: 1.6, marginBottom: 32 }}>
            Track live ship movements, export wreck data, bookmark locations, and explore depth contours. Support independent maritime research.
          </p>

          {/* BUNDLE CTA — featured, above individual pricing */}
          <a
            href={SIMMAPS_BUNDLE_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              textDecoration: "none",
              color: "inherit",
              padding: "22px 24px",
              background: "linear-gradient(135deg, rgba(251,146,60,0.14), rgba(251,146,60,0.03))",
              border: "2px solid #fb923c",
              borderRadius: 12,
              marginBottom: 24,
              maxWidth: 580,
              width: "100%",
              position: "relative",
              transition: "transform 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <div style={{ position: "absolute", top: -10, left: 20, background: "#fb923c", color: "#0a0e17", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700, padding: "4px 10px", borderRadius: 3 }}>
              Best value · All 6 Maps
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
              <div style={{ flex: 1, minWidth: 240 }}>
                <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#fb923c", fontWeight: 700, marginBottom: 6 }}>
                  SimulationMaps All-Access Bundle
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 32, fontWeight: 700, color: "#fb923c" }}>$79</span>
                  <span style={{ fontSize: 13, color: "#888" }}>lifetime · all 6 maps</span>
                </div>
                <div style={{ fontSize: 13, color: "#e0e0e0", lineHeight: 1.5, marginBottom: 4 }}>
                  ShipwreckMap Pro + DisasterMap + VolcanoSim + AsteroidSim + UfoMap + Climate Impact Map.
                </div>
                <div style={{ fontSize: 12, color: "#888" }}>
                  Only <strong style={{ color: "#fb923c" }}>$49 more</strong> than ShipwreckMap Lifetime alone. Plus every future map, forever.
                </div>
              </div>
              <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#fb923c", fontWeight: 700, whiteSpace: "nowrap", alignSelf: "center" }}>
                See the bundle →
              </div>
            </div>
          </a>

          <div style={{ fontSize: 11, letterSpacing: "0.16em", color: "#4a6a8a", fontWeight: 600, marginBottom: 16, textAlign: "center", textTransform: "uppercase" }}>
            ◈ Or just ShipwreckMap Pro
          </div>

          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
            {/* Yearly */}
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12, padding: "32px 28px", width: 260, textAlign: "center",
            }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "2px", color: "#666", marginBottom: 12 }}>Yearly</div>
              <div style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 36, fontWeight: 700, marginBottom: 4,
              }}>$12.99</div>
              <div style={{ color: "#666", marginBottom: 24 }}>per year</div>

              {isSignedIn ? (
                <a href={getCheckoutUrl(YEARLY_LINK)} style={{
                  display: "block", padding: "12px 24px",
                  background: "linear-gradient(135deg, #1a5276 0%, #2980b9 100%)",
                  color: "#fff", textDecoration: "none", borderRadius: 8,
                  fontWeight: 600, fontSize: 15,
                }}>Subscribe</a>
              ) : (
                <SignInButton mode="modal">
                  <button style={{
                    width: "100%", padding: "12px 24px",
                    background: "linear-gradient(135deg, #1a5276 0%, #2980b9 100%)",
                    color: "#fff", border: "none", borderRadius: 8,
                    fontWeight: 600, fontSize: 15, cursor: "pointer",
                    fontFamily: "'Source Serif 4', Georgia, serif",
                  }}>Sign In to Subscribe</button>
                </SignInButton>
              )}
            </div>

            {/* Lifetime */}
            <div style={{
              background: "rgba(41,128,185,0.05)",
              border: "2px solid rgba(41,128,185,0.3)",
              borderRadius: 12, padding: "32px 28px", width: 260, textAlign: "center",
              position: "relative",
            }}>
              <div style={{
                position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                background: "#2980b9", color: "#fff", fontSize: 10, fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "1.5px",
                padding: "4px 12px", borderRadius: 20,
              }}>Best Value</div>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "2px", color: "#666", marginBottom: 12 }}>Lifetime</div>
              <div style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 36, fontWeight: 700, marginBottom: 4,
              }}>$29.99</div>
              <div style={{ color: "#666", marginBottom: 24 }}>one time, forever</div>

              {isSignedIn ? (
                <a href={getCheckoutUrl(LIFETIME_LINK)} style={{
                  display: "block", padding: "12px 24px",
                  background: "linear-gradient(135deg, #1a5276 0%, #2980b9 100%)",
                  color: "#fff", textDecoration: "none", borderRadius: 8,
                  fontWeight: 600, fontSize: 15,
                }}>Get Lifetime Access</a>
              ) : (
                <SignInButton mode="modal">
                  <button style={{
                    width: "100%", padding: "12px 24px",
                    background: "linear-gradient(135deg, #1a5276 0%, #2980b9 100%)",
                    color: "#fff", border: "none", borderRadius: 8,
                    fontWeight: 600, fontSize: 15, cursor: "pointer",
                    fontFamily: "'Source Serif 4', Georgia, serif",
                  }}>Sign In to Purchase</button>
                </SignInButton>
              )}
            </div>
          </div>

          {/* Feature list */}
          <div style={{ marginTop: 48, maxWidth: 500 }}>
            {[
              "🚢 Live ship movement trails (30 min history)",
              "📊 Export wreck data as CSV",
              "📌 Bookmark and save wrecks",
              "🌊 Depth contour overlay",
              "🚫 No advertisements",
              "⚡ Priority feature requests",
            ].map((f, i) => (
              <div key={i} style={{
                padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)",
                fontSize: 14, color: "#aaa",
              }}>{f}</div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
