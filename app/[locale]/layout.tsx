import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n';
import QueryProvider from '@/providers/QueryProvider';
import { CartProvider } from '@/context/CartContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const descriptions: Record<string, string> = {
    en: "Curated collection of authentic vintage items from the 1950s-2000s. One-of-a-kind pieces with character and history.",
    es: "Colección curada de artículos vintage auténticos de los años 1950-2000. Piezas únicas con carácter e historia.",
    fr: "Collection soignée d'articles vintage authentiques des années 1950 à 2000. Pièces uniques avec caractère et histoire.",
    de: "Kuratierte Kollektion authentischer Vintage-Artikel aus den 1950er-2000er Jahren. Einzigartige Stücke mit Charakter und Geschichte.",
    ja: "1950年代から2000年代の本物のヴィンテージ商品のキュレーションコレクション。個性と歴史のあるユニークなアイテム。",
  };

  return {
    description: descriptions[locale] || descriptions.en,
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as typeof locales[number])) {
    notFound();
  }

  const messages = await getMessages();

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dreamazul.com';

  // Localized descriptions
  const descriptions: Record<string, string> = {
    en: "Curated collection of authentic vintage items from the 1950s-2000s. One-of-a-kind pieces with character and history.",
    es: "Colección curada de artículos vintage auténticos de los años 1950-2000. Piezas únicas con carácter e historia.",
    fr: "Collection soignée d'articles vintage authentiques des années 1950 à 2000. Pièces uniques avec caractère et histoire.",
    de: "Kuratierte Kollektion authentischer Vintage-Artikel aus den 1950er-2000er Jahren. Einzigartige Stücke mit Charakter und Geschichte.",
    ja: "1950年代から2000年代の本物のヴィンテージ商品のキュレーションコレクション。個性と歴史のあるユニークなアイテム。",
  };

  const localizedDescription = descriptions[locale] || descriptions.en;

  // LocalBusiness Schema for online vintage shop with location and service areas
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': ['OnlineStore', 'LocalBusiness'],
    name: 'Dream Azul',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: localizedDescription,
    image: `${baseUrl}/og-image.jpg`,
    foundingDate: '2024',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Utrecht',
      addressRegion: 'Utrecht',
      addressCountry: 'NL',
      postalCode: '3500',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 52.0907,
      longitude: 5.1214,
    },
    areaServed: [
      {
        '@type': 'Country',
        name: 'Netherlands',
      },
      {
        '@type': 'Country',
        name: 'Germany',
      },
      {
        '@type': 'Country',
        name: 'Belgium',
      },
      {
        '@type': 'Country',
        name: 'France',
      },
      'Worldwide',
    ],
    priceRange: '€€',
    currenciesAccepted: 'EUR',
    paymentAccepted: 'Credit Card, Debit Card, PayPal',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: ['English', 'Spanish', 'French', 'German', 'Japanese'],
      email: 'support@dreamazul.com',
    },
    sameAs: [
      // Add your social media profiles here when available
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Vintage Items',
      itemListElement: [
        {
          '@type': 'OfferCatalog',
          name: 'Vintage Clothing',
          itemListElement: [
            { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Vintage Jackets' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Vintage Dresses' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Vintage Jeans' } },
          ],
        },
        {
          '@type': 'OfferCatalog',
          name: 'Vintage Furniture',
          itemListElement: [
            { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Mid-Century Furniture' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Vintage Chairs' } },
          ],
        },
        {
          '@type': 'OfferCatalog',
          name: 'Collectibles',
          itemListElement: [
            { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Vintage Vinyl Records' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Vintage Jewelry' } },
          ],
        },
      ],
    },
  };

  // WebSite Schema with SearchAction for sitelinks search box
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: baseUrl,
    name: 'Dream Azul',
    description: localizedDescription,
    inLanguage: locale,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/${locale}/shop?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Schema.org JSON-LD for LocalBusiness + OnlineStore */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        {/* Schema.org JSON-LD for WebSite with SearchAction */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />

        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <CurrencyProvider>
              <CartProvider>
                <div className="flex flex-col min-h-screen">
                  <Header />
                  <main className="flex-grow">
                    {children}
                  </main>
                  <Footer />
                </div>
              </CartProvider>
            </CurrencyProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
