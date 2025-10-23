import { Suspense } from 'react';
import { cache } from 'react';
import { adminDb } from '@/lib/firebase-admin';
import { Product } from '@/types';
import ShopClient from '@/components/ShopClient';

export const revalidate = 180;

const getProducts = cache(async (): Promise<Product[]> => {
  try {
    const snapshot = await adminDb
      .collection('products')
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
        soldAt: data.soldAt?.toDate?.()?.toISOString() || null,
      };
    }) as Product[];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
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

  return (
    <Suspense fallback={<ShopLoading />}>
      <ShopClient initialProducts={products} />
    </Suspense>
  );
}
