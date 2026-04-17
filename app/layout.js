import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata = {
  title: "ShipwreckMap — Every Wreck on Earth, Sea & Air",
  description: "30,000+ shipwrecks and aviation disasters mapped. Live vessel tracking. Historical trade routes. The world's most dangerous waters.",
  openGraph: {
    title: "ShipwreckMap — Every Wreck on Earth",
    description: "30,000+ shipwrecks and aviation disasters mapped with live vessel tracking.",
    url: "https://shipwreckmap.ca",
    siteName: "ShipwreckMap",
    type: "website",
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
        </head>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
