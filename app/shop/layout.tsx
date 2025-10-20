import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop Vintage Clothing | Jackets, Jeans, Dresses & More | Vintage Store',
  description: 'Browse our curated collection of authentic vintage clothing. Filter by era (1950s-2000s), category, size, and price. Unique vintage jackets, Levi\'s jeans, band tees, and accessories.',
  keywords: [
    'shop vintage clothing',
    'buy vintage',
    'vintage clothing catalog',
    'vintage jackets for sale',
    'vintage jeans shop',
    'authentic vintage dresses',
    '1970s leather jacket',
    'vintage levi\'s 501',
    '1980s vintage clothing',
    '1990s fashion',
    'retro clothing store',
    'vintage band t-shirts',
    'vintage denim',
    'vintage accessories',
  ],
  openGraph: {
    title: 'Shop Vintage Clothing - Curated Collection',
    description: 'Browse authentic vintage fashion from the 1950s to 2000s. Jackets, jeans, dresses, and unique pieces.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shop Vintage Clothing',
    description: 'Curated vintage fashion from the 1950s to 2000s.',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://vintage-store.vercel.app'}/shop`,
  },
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
