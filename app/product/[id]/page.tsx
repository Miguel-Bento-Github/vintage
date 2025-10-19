import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product } from '@/types';
import ProductGallery from './ProductGallery';
import AddToCartButton from './AddToCartButton';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getProduct(id: string): Promise<Product | null> {
  const docRef = doc(db, 'products', id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as Product;
}

async function getSimilarProducts(product: Product): Promise<Product[]> {
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
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: `${product.title} - ${product.brand} | Vintage Store`,
    description: product.description,
    openGraph: {
      title: product.title,
      description: product.description,
      images: product.images,
      siteName: 'Vintage Store',
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  const similarProducts = await getSimilarProducts(product);

  // Schema.org structured data
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    image: product.images,
    offers: {
      '@type': 'Offer',
      url: `https://vintagestore.com/product/${id}`,
      price: product.price.toFixed(2),
      priceCurrency: 'USD',
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/UsedCondition',
      seller: {
        '@type': 'Organization',
        name: 'Vintage Store',
      },
    },
  };

  return (
    <>
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumbs */}
          <nav className="mb-8 text-sm">
            <ol className="flex items-center space-x-2 text-gray-500">
              <li>
                <Link href="/" className="hover:text-gray-700">
                  Home
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/shop" className="hover:text-gray-700">
                  Shop
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link
                  href={`/shop?category=${product.category}`}
                  className="hover:text-gray-700"
                >
                  {product.category}
                </Link>
              </li>
              <li>/</li>
              <li className="text-gray-900 font-medium">{product.title}</li>
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
              <div className="flex items-center gap-4 mb-6">
                <p className="text-3xl font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </p>
                <span className="px-4 py-1 bg-amber-700 text-white text-sm font-semibold rounded-full">
                  {product.era}
                </span>
                {!product.inStock && (
                  <span className="px-4 py-1 bg-gray-900 text-white text-sm font-semibold rounded-full">
                    SOLD
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
                  <h3 className="font-semibold text-gray-900 mb-3">Measurements</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <table className="w-full text-sm">
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="py-2 text-gray-600">Size</td>
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
                <h3 className="font-semibold text-gray-900 mb-2">Condition</h3>
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
                  <span className="font-semibold">This item is one-of-a-kind.</span> All vintage
                  pieces are unique and once sold, cannot be restocked.
                </p>
              </div>
            </div>
          </div>

          {/* Care Instructions */}
          <div className="border-t pt-12 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Care Instructions</h2>
                <div className="prose prose-sm text-gray-700">
                  <ul className="space-y-2">
                    <li>Dry clean or hand wash in cold water with gentle detergent</li>
                    <li>Lay flat to dry or hang on padded hangers</li>
                    <li>Avoid direct sunlight to prevent fading</li>
                    <li>Steam instead of iron when possible</li>
                    <li>Store in a cool, dry place away from moisture</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Return Policy</h2>
                <div className="prose prose-sm text-gray-700">
                  <p className="mb-2">
                    We want you to love your vintage find! Returns are accepted within 7 days of
                    delivery.
                  </p>
                  <ul className="space-y-2">
                    <li>Item must be unworn and in original condition</li>
                    <li>Original tags must be attached</li>
                    <li>Return shipping is the responsibility of the buyer</li>
                    <li>Refund will be issued within 5-7 business days</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Similar Items */}
          {similarProducts.length > 0 && (
            <div className="border-t pt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Items</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {similarProducts.map((similarProduct) => (
                  <Link
                    key={similarProduct.id}
                    href={`/product/${similarProduct.id}`}
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
                          <span className="text-gray-400 text-sm">No Image</span>
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
                      <p className="text-xl font-bold text-gray-900">
                        ${similarProduct.price.toFixed(2)}
                      </p>
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
