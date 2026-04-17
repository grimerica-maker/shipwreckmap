import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata = {
  title: "ShipwreckMap — Every Wreck on Earth, Sea & Air",
  description: "28,000+ shipwrecks and aviation disasters mapped. Live vessel tracking. Historical trade routes. The world's most dangerous waters.",
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
    title: "ShipwreckMap — Every Wreck on Earth, Sea & Air",
    description: "28,000+ shipwrecks and aviation disasters mapped with live vessel tracking. Historical trade routes. The world's most dangerous waters.",
    url: "https://shipwreckmap.ca",
    siteName: "ShipwreckMap",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ShipwreckMap — Every Wreck on Earth",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ShipwreckMap — Every Wreck on Earth, Sea & Air",
    description: "28,000+ shipwrecks and aviation disasters mapped with live vessel tracking.",
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
