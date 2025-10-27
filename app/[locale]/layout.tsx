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

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
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
