import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop Vintage Items | Clothing, Furniture, Vinyl & More | Vintage Store',
  description: 'Browse our curated collection of authentic vintage items. Filter by era (1950s-2000s), category, and price. Unique vintage jackets, furniture, vinyl records, jewelry, and collectibles.',
  keywords: [
    'shop vintage items',
    'buy vintage',
    'vintage store catalog',
    'vintage jackets for sale',
    'vintage furniture',
    'vintage vinyl records',
    'vintage jewelry',
    'authentic vintage collectibles',
    '1970s leather jacket',
    'vintage levi\'s 501',
    '1980s vintage',
    '1990s fashion',
    'retro store',
    'vintage band t-shirts',
    'vintage denim',
    'vintage accessories',
  ],
  openGraph: {
    title: 'Shop Vintage Items - Curated Collection',
    description: 'Browse authentic vintage items from the 1950s to 2000s. Clothing, furniture, vinyl records, jewelry, and unique pieces.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shop Vintage Items',
    description: 'Curated vintage items from the 1950s to 2000s.',
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
