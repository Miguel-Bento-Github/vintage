import Image from 'next/image';
import Link from 'next/link';
import { cache } from 'react';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product } from '@/types';
import { getTranslations } from 'next-intl/server';
import ProductPrice from '@/components/ProductPrice';

// Enable Incremental Static Regeneration (ISR)
// Revalidate every 5 minutes (300 seconds)
export const revalidate = 300;

// Metadata will be generated dynamically based on locale

// Cache featured products with React cache() for request deduplication
const getFeaturedProducts = cache(async (): Promise<Product[]> => {
  const productsRef = collection(db, 'products');
  const q = query(
    productsRef,
    where('featured', '==', true),
    where('inStock', '==', true),
    limit(8)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[];
});

// Category images mapping - using Unsplash placeholder images
const CATEGORY_IMAGES: Record<string, string> = {
  Jacket: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=600&fit=crop',
  Dress: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=600&fit=crop',
  Jeans: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=600&fit=crop',
  Shirt: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=600&fit=crop',
  Pants: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&h=600&fit=crop',
  Accessories: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&h=600&fit=crop',
};

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const featuredProducts = await getFeaturedProducts();
  const t = await getTranslations();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-amber-50 to-orange-50 py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight mb-6">
              {t('homepage.hero.title')}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto mb-8">
              {t('homepage.hero.subtitle')}
            </p>
            <Link
              href={`/${locale}/shop`}
              className="inline-flex items-center justify-center px-16 py-8 bg-gradient-to-b from-amber-600 to-amber-800 text-white rounded-[50%] font-extrabold text-lg border-4 border-amber-900 shadow-[0_4px_0_0_rgba(120,53,15,0.4),inset_0_2px_0_0_rgba(255,255,255,0.2)] hover:shadow-[0_2px_0_0_rgba(120,53,15,0.4),inset_0_2px_0_0_rgba(255,255,255,0.2)] hover:translate-y-[2px] transition-all duration-150 relative overflow-hidden"
            >
              <span className="relative z-10">{t('homepage.hero.shopNow')}</span>
              <span className="absolute inset-0 rounded-[50%] border-2 border-white/20 pointer-events-none"></span>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {t('homepage.featured.title')}
            </h2>
            <p className="text-gray-600 text-lg">
              {t('homepage.categories.description')}
            </p>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/${locale}/product/${product.id}`}
                  className="group block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative aspect-[3/4] bg-gray-100">
                    <Image
                      src={product.images[0]}
                      alt={`${product.brand} ${product.title} - ${product.era} vintage ${product.category}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      loading="eager"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-amber-700 font-semibold mb-1">
                      {product.era}
                    </p>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {product.title}
                    </h3>
                    <ProductPrice amount={product.price} className="text-xl font-bold text-gray-900" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>{t('shop.noProducts')}</p>
              <Link
                href={`/${locale}/shop`}
                className="text-amber-700 hover:text-amber-800 font-semibold mt-2 inline-block"
              >
                {t('homepage.featured.viewAll')} →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {t('homepage.categories.title')}
            </h2>
            <p className="text-gray-600 text-lg">
              {t('homepage.categories.description')}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {Object.entries(CATEGORY_IMAGES).map(([category, imageUrl]) => (
              <Link
                key={category}
                href={`/${locale}/shop?category=${category}`}
                className="group relative aspect-square rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
              >
                <Image
                  src={imageUrl}
                  alt={`Shop vintage ${category.toLowerCase()}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  loading="lazy"
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20 group-hover:from-black/70 transition-colors" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                  <h3 className="text-white text-xl sm:text-2xl font-bold">
                    {category}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
