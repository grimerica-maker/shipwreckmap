import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata = {
  title: "ShipwreckMap — 87,000+ Wrecks Mapped Worldwide",
  description: "87,000+ shipwrecks and aviation disasters on a satellite globe. Live vessel tracking. WWII submarine graveyards. 20 danger zones. Wikipedia summaries. The ocean floor's darkest history — mapped.",
  metadataBase: new URL("https://shipwreckmap.ca"),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "ShipwreckMap — 87,000+ Wrecks Mapped Worldwide",
    description: "87,000+ shipwrecks and aviation disasters on a satellite globe. Live vessel tracking. WWII submarine graveyards. 20 danger zones. Wikipedia summaries.",
    url: "https://shipwreckmap.ca",
    siteName: "ShipwreckMap",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ShipwreckMap — 87,000+ Wrecks Mapped Worldwide",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ShipwreckMap — 87,000+ Wrecks Mapped Worldwide",
    description: "87,000+ shipwrecks and aviation disasters on a satellite globe. Live vessel tracking. WWII wrecks. Danger zones.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Source+Serif+4:wght@300;400;600;700&display=swap"
            rel="stylesheet"
          />
          <meta name="theme-color" content="#0a0e17" />
        </head>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
