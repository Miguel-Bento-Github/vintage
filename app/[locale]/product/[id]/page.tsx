import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { cache } from 'react';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product } from '@/types';
import ProductGallery from './ProductGallery';
import AddToCartButton from './AddToCartButton';
import { getTranslations } from 'next-intl/server';
import ProductPrice from '@/components/ProductPrice';

// Enable Incremental Static Regeneration (ISR)
// Revalidate every 10 minutes (600 seconds)
export const revalidate = 600;

interface PageProps {
  params: Promise<{ id: string; locale: string }>;
}

// Cache product fetching with React cache() for request deduplication
const getProduct = cache(async (id: string): Promise<Product | null> => {
  const docRef = doc(db, 'products', id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as Product;
});

// Cache similar products fetching
const getSimilarProducts = cache(async (product: Product): Promise<Product[]> => {
  // Get products from same era or category, excluding current product
  const productsRef = collection(db, 'products');
  const q = query(
    productsRef,
    where('era', '==', product.era),
    where('inStock', '==', true),
    limit(4)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }) as Product)
    .filter((p) => p.id !== product.id)
    .slice(0, 3);
});

// Pre-render featured products at build time for faster initial loads
// Note: This only returns 'id' params because the [locale] segment
// is handled by the parent layout's generateStaticParams
export async function generateStaticParams() {
  try {
    const productsRef = collection(db, 'products');
    const q = query(
      productsRef,
      where('featured', '==', true),
      where('inStock', '==', true),
      limit(20) // Pre-render top 20 featured products
    );

    const snapshot = await getDocs(q);
    const products = snapshot.docs.map((doc) => ({
      id: doc.id,
    }));

    return products;
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  // SEO-optimized title with long-tail keywords
  const seoTitle = `${product.brand} ${product.title} ${product.era} - Vintage ${product.category} | Vintage Store`;

  // Rich description with keywords
  const seoDescription = `${product.condition} condition ${product.era} ${product.brand} ${product.title}. ${product.description.slice(0, 120)}... Authentic vintage ${product.category.toLowerCase()}. ${product.inStock ? 'In stock and ready to ship.' : 'Sold out.'}`;

  const imageUrl = product.images && product.images.length > 0 ? product.images[0] : '';

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: [
      `vintage ${product.brand.toLowerCase()}`,
      `${product.era} ${product.category.toLowerCase()}`,
      `vintage ${product.category.toLowerCase()}`,
      product.title.toLowerCase(),
      `${product.brand.toLowerCase()} ${product.title.toLowerCase()}`,
      'authentic vintage',
      'vintage fashion',
      product.era,
    ],
    openGraph: {
      title: `${product.brand} ${product.title}`,
      description: product.description,
      images: imageUrl ? [{ url: imageUrl, alt: `${product.brand} ${product.title}` }] : [],
      siteName: 'Vintage Store',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.brand} ${product.title}`,
      description: product.description.slice(0, 160),
      images: imageUrl ? [imageUrl] : [],
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://vintage-store.vercel.app'}/product/${id}`,
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { id, locale } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  const similarProducts = await getSimilarProducts(product);
  const t = await getTranslations('product');
  const tCommon = await getTranslations('common');

  // Schema.org Product structured data with enhanced details
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vintage-store.vercel.app';

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${product.brand} ${product.title}`,
    description: product.description,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    image: product.images,
    category: product.category,
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Era',
        value: product.era,
      },
      {
        '@type': 'PropertyValue',
        name: 'Size',
        value: product.size.label,
      },
      {
        '@type': 'PropertyValue',
        name: 'Condition',
        value: product.condition,
      },
    ],
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/product/${id}`,
      price: product.price.toFixed(2),
      priceCurrency: 'EUR',
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/SoldOut',
      itemCondition: 'https://schema.org/UsedCondition',
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      seller: {
        '@type': 'Organization',
        name: 'Vintage Store',
      },
    },
  };

  // Breadcrumb structured data
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Shop',
        item: `${baseUrl}/shop`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.category,
        item: `${baseUrl}/shop?category=${encodeURIComponent(product.category)}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: `${product.brand} ${product.title}`,
        item: `${baseUrl}/product/${id}`,
      },
    ],
  };

  return (
    <>
      {/* Schema.org JSON-LD for Product */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      {/* Schema.org JSON-LD for Breadcrumbs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumbs */}
          <nav className="mb-8 text-xs sm:text-sm overflow-x-auto">
            <ol className="flex items-center space-x-2 text-gray-500 whitespace-nowrap">
              <li>
                <Link href={`/${locale}`} className="hover:text-gray-700">
                  {tCommon('home')}
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href={`/${locale}/shop`} className="hover:text-gray-700">
                  {tCommon('shop')}
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link
                  href={`/${locale}/shop?category=${product.category}`}
                  className="hover:text-gray-700"
                >
                  {product.category}
                </Link>
              </li>
              <li>/</li>
              <li className="text-gray-900 font-medium truncate max-w-[150px] sm:max-w-none">{product.title}</li>
            </ol>
          </nav>

          {/* Main Product Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
            {/* Left: Image Gallery */}
            <div>
              <ProductGallery images={product.images} title={product.title} />
            </div>

            {/* Right: Product Details */}
            <div>
              {/* Brand */}
              <p className="text-sm text-gray-500 font-medium mb-2">{product.brand}</p>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                {product.title}
              </h1>

              {/* Price and Era */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6">
                <ProductPrice amount={product.price} className="text-2xl sm:text-3xl font-bold text-gray-900" />
                <span className="px-4 py-1 bg-amber-700 text-white text-sm font-semibold rounded-full">
                  {product.era}
                </span>
                {!product.inStock && (
                  <span className="px-4 py-1 bg-gray-900 text-white text-sm font-semibold rounded-full">
                    {t('sold')}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>

              {/* Measurements */}
              {product.size.measurements && Object.keys(product.size.measurements).length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">{t('measurements')}</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <table className="w-full text-sm">
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="py-2 text-gray-600">{t('size')}</td>
                          <td className="py-2 text-gray-900 font-medium text-right">
                            {product.size.label}
                          </td>
                        </tr>
                        {Object.entries(product.size.measurements).map(([key, value]) => (
                          <tr key={key}>
                            <td className="py-2 text-gray-600 capitalize">{key}</td>
                            <td className="py-2 text-gray-900 font-medium text-right">
                              {value}&quot;
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Condition */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">{t('condition')}</h3>
                <p className="text-gray-700 mb-1">
                  <span className="font-medium">{product.condition}</span>
                </p>
                {product.conditionNotes && (
                  <p className="text-sm text-gray-600 italic">{product.conditionNotes}</p>
                )}
              </div>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Add to Cart / Sold Out */}
              <div className="mb-6">
                <AddToCartButton
                  product={{
                    id: product.id,
                    title: product.title,
                    brand: product.brand,
                    era: product.era,
                    category: product.category,
                    size: product.size.label,
                    price: product.price,
                    imageUrl: product.images[0] || '',
                    inStock: product.inStock,
                  }}
                />
              </div>

              {/* One of a Kind Message */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-amber-900">
                  <span className="font-semibold">{t('oneOfAKind')}</span> {t('uniqueVintageMessage')}
                </p>
              </div>
            </div>
          </div>

          {/* Care Instructions */}
          <div className="border-t pt-12 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('careInstructions')}</h2>
                <div className="prose prose-sm text-gray-700">
                  <ul className="space-y-2">
                    <li>{t('care1')}</li>
                    <li>{t('care2')}</li>
                    <li>{t('care3')}</li>
                    <li>{t('care4')}</li>
                    <li>{t('care5')}</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('returnPolicy')}</h2>
                <div className="prose prose-sm text-gray-700">
                  <p className="mb-2">
                    {t('returnIntro')}
                  </p>
                  <ul className="space-y-2">
                    <li>{t('return1')}</li>
                    <li>{t('return2')}</li>
                    <li>{t('return3')}</li>
                    <li>{t('return4')}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Similar Items */}
          {similarProducts.length > 0 && (
            <div className="border-t pt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('similarItems')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {similarProducts.map((similarProduct) => (
                  <Link
                    key={similarProduct.id}
                    href={`/${locale}/product/${similarProduct.id}`}
                    className="group block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="relative aspect-[3/4] bg-gray-100">
                      {similarProduct.images && similarProduct.images.length > 0 && similarProduct.images[0] ? (
                        <Image
                          src={similarProduct.images[0]}
                          alt={similarProduct.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-sm">{tCommon('noImage')}</span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <span className="px-3 py-1 bg-amber-700 text-white text-xs font-semibold rounded-full">
                          {similarProduct.era}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-gray-500 font-medium mb-1">
                        {similarProduct.brand}
                      </p>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {similarProduct.title}
                      </h3>
                      <ProductPrice amount={similarProduct.price} className="text-xl font-bold text-gray-900" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
