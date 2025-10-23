import { Suspense } from 'react';
import { cache } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product } from '@/types';
import ShopClient from '@/components/ShopClient';

export const revalidate = 180;

const getProducts = cache(async (): Promise<Product[]> => {
  const productsRef = collection(db, 'products');
  const q = query(
    productsRef,
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[];
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
