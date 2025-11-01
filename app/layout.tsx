import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title:
    "Dream Azul - Vintage Clothing, Furniture & Collectibles Online Shop | Utrecht, Netherlands",
  description:
    "Premium online vintage shop based in Utrecht, Netherlands. Curated vintage clothing, furniture, vinyl records, jewelry & collectibles from 1950s-2000s. Worldwide shipping. Authentic pieces with history.",
  keywords: [
    "vintage shop",
    "vintage clothing shop",
    "vintage furniture",
    "vintage online shop",
    "vintage store Netherlands",
    "vintage shop Utrecht",
    "vintage clothes Europe",
    "vintage furniture Netherlands",
    "retro clothing",
    "second hand designer",
    "vintage vinyl records",
    "vintage jewelry",
    "mid-century furniture",
    "vintage collectibles",
  ],
  manifest: "/site.webmanifest",
  alternates: {
    canonical: "https://dreamazul.com",
    languages: {
      en: "https://dreamazul.com/en",
      es: "https://dreamazul.com/es",
      fr: "https://dreamazul.com/fr",
      de: "https://dreamazul.com/de",
      ja: "https://dreamazul.com/ja",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://dreamazul.com",
    siteName: "Dream Azul",
    title:
      "Dream Azul - Premium Vintage Shop | Clothing, Furniture, Collectibles",
    description:
      "Curated vintage clothing, furniture, vinyl records & collectibles. Based in Utrecht, NL. Worldwide shipping.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dream Azul - Premium Vintage Shop",
    description:
      "Vintage clothing, furniture & collectibles from Utrecht, Netherlands",
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-64x64.png", sizes: "64x64", type: "image/png" },
    ],
    shortcut: "/favicon-32x32.png",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "icon", url: "/favicon-192x192.png", sizes: "192x192" },
      { rel: "icon", url: "/favicon-512x512.png", sizes: "512x512" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div
        aria-hidden="true"
        className="fixed inset-0 opacity-80 pointer-events-none z-0 bg-repeat bg-[url(/patterns/gray-floral.png)]"
      />
      {children}
      <SpeedInsights />
      <Analytics />
    </>
  );
}
