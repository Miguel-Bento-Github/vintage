import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dream Azul - Authentic Vintage Clothing",
  description: "Curated collection of authentic vintage clothing from the 1950s-2000s. One-of-a-kind pieces with character and history.",
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-64x64.png', sizes: '64x64', type: 'image/png' },
    ],
    shortcut: '/favicon-32x32.png',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'icon', url: '/favicon-192x192.png', sizes: '192x192' },
      { rel: 'icon', url: '/favicon-512x512.png', sizes: '512x512' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The <html> tag is rendered in the [locale]/layout.tsx
  // to allow for dynamic lang attribute based on locale
  return children;
}
