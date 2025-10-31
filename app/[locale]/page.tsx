import Image from "next/image";
import Link from "next/link";
import { cache } from "react";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SerializedProduct, timestampToISO } from "@/types";
import { getTranslations } from "next-intl/server";
import VintageProductCard from "@/components/VintageProductCard";

// Generate static pages for all locales at build time
export function generateStaticParams() {
  return [
    { locale: "en" },
    { locale: "es" },
    { locale: "fr" },
    { locale: "nl" },
    { locale: "pt" },
  ];
}

const getFeaturedProducts = cache(async (): Promise<SerializedProduct[]> => {
  const productsRef = collection(db, "products");
  const q = query(
    productsRef,
    where("featured", "==", true),
    where("inStock", "==", true),
    limit(8)
  );

  const snapshot = await getDocs(q);

  const result: SerializedProduct[] = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      productType: data.productType || "Clothing", // Default to Clothing for existing products
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
      createdAt: timestampToISO(data.createdAt) || "",
      updatedAt: timestampToISO(data.updatedAt) || "",
      soldAt: data.soldAt ? timestampToISO(data.soldAt) : undefined,
    };
  });

  return result;
});

const CATEGORY_IMAGES: Record<string, string> = {
  Jacket:
    "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=600&fit=crop",
  Dress:
    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=600&fit=crop",
  LP: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=800&h=600&fit=crop",
  Chair:
    "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&h=600&fit=crop",
  Necklace:
    "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800&h=600&fit=crop",
  Accessories:
    "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&h=600&fit=crop",
};

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const featuredProducts = await getFeaturedProducts();
  const t = await getTranslations();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-amber-50 to-orange-50 py-20 sm:py-32 overflow-hidden">
        {/* Vintage flowers pattern background */}
        <div
          className="absolute inset-0 opacity-100"
          style={{
            backgroundImage: `url('/patterns/flowers.png')`,
            backgroundRepeat: 'repeat',
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight mb-6">
              {t("homepage.hero.title")}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto mb-8">
              {t("homepage.hero.subtitle")}
            </p>
            <Link
              href={`/${locale}/shop`}
              className="inline-flex items-center justify-center px-16 py-8 bg-gradient-to-b from-amber-600 to-amber-800 text-white rounded-[50%] font-extrabold text-lg border-4 border-amber-900 shadow-[0_4px_0_0_rgba(120,53,15,0.4),inset_0_2px_0_0_rgba(255,255,255,0.2)] hover:shadow-[0_2px_0_0_rgba(120,53,15,0.4),inset_0_2px_0_0_rgba(255,255,255,0.2)] hover:translate-y-[2px] transition-all duration-150 relative overflow-hidden"
            >
              <span className="relative z-10">
                {t("homepage.hero.shopNow")}
              </span>
              <span className="absolute inset-0 rounded-[50%] border-2 border-white/20 pointer-events-none"></span>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {t("homepage.featured.title")}
            </h2>
            <p className="text-gray-600 text-lg">
              {t("homepage.categories.description")}
            </p>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <VintageProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>{t("shop.noProducts")}</p>
              <Link
                href={`/${locale}/shop`}
                className="text-amber-700 hover:text-amber-800 font-semibold mt-2 inline-block"
              >
                {t("homepage.featured.viewAll")} →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {t("homepage.categories.title")}
            </h2>
            <p className="text-gray-600 text-lg">
              {t("homepage.categories.description")}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 auto-rows-[200px]">
            {Object.entries(CATEGORY_IMAGES).map(([category, imageUrl], index) => {
              // Pattern: Jacket(2), Dress(1), LP(2), Chair(2), Necklace(1), Accessories(2)
              // This makes: Col1: 2+1=3, Col2: 1+2=3, Col3: 2+2=4 -> Need Col3: 2+1=3
              // Index: 0,1,2,3,4,5 -> Rows: 2,1,2,2,1,1
              let rowSpan = 2;
              if (index === 1 || index === 4 || index === 5) {
                rowSpan = 1;
              }

              return (
                <Link
                  key={category}
                  href={`/${locale}/shop?category=${category}`}
                  className="group relative rounded-lg overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all border-4 border-amber-900/30"
                  style={{ gridRow: `span ${rowSpan}` }}
                >
                  <Image
                    src={imageUrl}
                    alt={`Shop vintage ${category.toLowerCase()}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    loading="lazy"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20 group-hover:from-black/70 transition-colors" />
                  {/* Vintage inner frame border */}
                  <div className="absolute inset-2 border-2 border-amber-100/20 pointer-events-none rounded" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                    <h3 className="text-white text-xl sm:text-2xl font-bold">
                      {category}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
