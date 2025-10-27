import { Suspense } from 'react';
import { cache } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SerializedProduct, timestampToISO } from '@/types';
import ShopClient from '@/components/ShopClient';

export const revalidate = 180;

const getProducts = cache(async (): Promise<SerializedProduct[]> => {
  const productsRef = collection(db, 'products');
  const q = query(
    productsRef,
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc): SerializedProduct => {
    const data = doc.data();
    return {
      id: doc.id,
      productType: data.productType || 'Clothing', // Default to Clothing for existing products
      title: data.title,
      description: data.description,
      brand: data.brand,
      era: data.era,
      category: data.category,
      size: data.size,
      condition: data.condition,
      conditionNotes: data.conditionNotes,
      price: data.price,
      images: data.images,
      inStock: data.inStock,
      featured: data.featured,
      tags: data.tags,
      specifications: data.specifications,
      createdAt: timestampToISO(data.createdAt) || '',
      updatedAt: timestampToISO(data.updatedAt) || '',
      soldAt: data.soldAt ? timestampToISO(data.soldAt) : undefined,
    };
  });
});

function ShopLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
        <p className="mt-4 text-gray-600">Loading products...</p>
      </div>
    </div>
  );
}

export default async function ShopPage() {
  const products = await getProducts();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dreamazul.com';

  // Helper to strip HTML tags from descriptions
  const stripHtml = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

  // ItemList Schema for product collection
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: products
      .filter((p) => p.inStock)
      .slice(0, 20) // Limit to top 20 products for performance
      .map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: `${product.brand} ${product.title}`,
          url: `${baseUrl}/product/${product.id}`,
          image: product.images && product.images.length > 0 ? product.images[0] : '',
          description: stripHtml(product.description),
          offers: {
            '@type': 'Offer',
            price: product.price.toFixed(2),
            priceCurrency: 'EUR',
            availability: product.inStock
              ? 'https://schema.org/InStock'
              : 'https://schema.org/SoldOut',
            itemCondition: 'https://schema.org/UsedCondition',
          },
        },
      })),
  };

  return (
    <>
      {/* Schema.org JSON-LD for ItemList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <Suspense fallback={<ShopLoading />}>
        <ShopClient initialProducts={products} />
      </Suspense>
    </>
  );
}
