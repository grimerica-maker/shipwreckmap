"use client";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

export default function SuccessPage() {
  const { user, isLoaded } = useUser();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    // Poll for tier update (webhook may take a few seconds)
    const interval = setInterval(async () => {
      await user?.reload();
      if (user?.publicMetadata?.shipmap_tier) {
        setChecking(false);
        clearInterval(interval);
      }
    }, 2000);

    // Stop after 30s regardless
    setTimeout(() => { setChecking(false); clearInterval(interval); }, 30000);

    return () => clearInterval(interval);
  }, [isLoaded]);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#0a0e17",
      color: "#e0e0e0",
      fontFamily: "'Source Serif 4', Georgia, serif",
      textAlign: "center",
      padding: 40,
    }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>⚓</div>
      <h1 style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: 32, fontWeight: 700, marginBottom: 12,
      }}>
        {checking ? "Activating Pro..." : "Welcome Aboard"}
      </h1>
      <p style={{ color: "#888", maxWidth: 400, marginBottom: 32 }}>
        {checking
          ? "Setting up your Pro access. This usually takes a few seconds..."
          : "Your ShipwreckMap Pro access is active. All features are now unlocked."
        }
      </p>
      {!checking && (
        <a href="/map" style={{
          padding: "14px 36px",
          background: "linear-gradient(135deg, #1a5276 0%, #2980b9 100%)",
          color: "#fff",
          textDecoration: "none",
          borderRadius: 8,
          fontSize: 16,
          fontWeight: 600,
        }}>
          Open the Map →
        </a>
      )}
    </div>
  );
}
