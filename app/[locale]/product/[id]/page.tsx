import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { cache } from "react";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product } from "@/types";
import ProductGallery from "./ProductGallery";
import AddToCartButton from "./AddToCartButton";
import { getTranslations } from "next-intl/server";
import ProductPrice from "@/components/ProductPrice";
import ShippingCalculator from "@/components/ShippingCalculator";
import { formatMeasurement, isMeasurementField } from "@/lib/measurements";
import { getTranslatedProduct } from "@/lib/productTranslations";
import { toLocale } from "@/i18n";
import { isDiscountActive, getEffectivePrice } from "@/lib/discount";

export const revalidate = 600;

interface PageProps {
  params: Promise<{ id: string; locale: string }>;
}

const getProduct = cache(async (id: string): Promise<Product | null> => {
  const docRef = doc(db, "products", id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as Product;
});

const getSimilarProducts = cache(
  async (product: Product): Promise<Product[]> => {
    const productsRef = collection(db, "products");
    const q = query(
      productsRef,
      where("era", "==", product.era),
      where("inStock", "==", true),
      limit(4)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs
      .map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Product
      )
      .filter((p) => p.id !== product.id)
      .slice(0, 3);
  }
);

export async function generateStaticParams() {
  try {
    const productsRef = collection(db, "products");
    const q = query(
      productsRef,
      where("featured", "==", true),
      where("inStock", "==", true),
      limit(20)
    );

    const snapshot = await getDocs(q);
    const products = snapshot.docs.map((doc) => ({
      id: doc.id,
    }));

    return products;
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id, locale: localeParam } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  // Get translated product for metadata
  const locale = toLocale(localeParam);
  const translatedProduct = getTranslatedProduct(product, locale);

  // SEO-optimized title with long-tail keywords
  const seoTitle = `${translatedProduct.brand} ${translatedProduct.title} ${translatedProduct.era} - Vintage ${translatedProduct.category} | Vintage Store`;

  // Strip HTML tags for SEO descriptions
  const stripHtml = (html: string) =>
    html
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  const plainDescription = stripHtml(translatedProduct.description);

  // Rich description with keywords
  const seoDescription = `${translatedProduct.condition} condition ${translatedProduct.era} ${translatedProduct.brand} ${translatedProduct.title}. ${plainDescription.slice(0, 120)}... Authentic vintage ${translatedProduct.category.toLowerCase()}. ${translatedProduct.inStock ? "In stock and ready to ship." : "Sold out."}`;

  const imageUrl =
    product.images && product.images.length > 0 ? product.images[0] : "";

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: [
      `vintage ${translatedProduct.brand.toLowerCase()}`,
      `${translatedProduct.era} ${translatedProduct.category.toLowerCase()}`,
      `vintage ${translatedProduct.category.toLowerCase()}`,
      translatedProduct.title.toLowerCase(),
      `${translatedProduct.brand.toLowerCase()} ${translatedProduct.title.toLowerCase()}`,
      "authentic vintage",
      "vintage fashion",
      translatedProduct.era,
    ],
    openGraph: {
      title: `${translatedProduct.brand} ${translatedProduct.title}`,
      description: plainDescription,
      images: imageUrl
        ? [
            {
              url: imageUrl,
              alt: `${translatedProduct.brand} ${translatedProduct.title}`,
            },
          ]
        : [],
      siteName: "Vintage Store",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${translatedProduct.brand} ${translatedProduct.title}`,
      description: plainDescription.slice(0, 160),
      images: imageUrl ? [imageUrl] : [],
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://vintage-store.vercel.app"}/${localeParam}/product/${id}`,
      languages: {
        'x-default': `${process.env.NEXT_PUBLIC_SITE_URL || "https://vintage-store.vercel.app"}/en/product/${id}`,
        'en': `${process.env.NEXT_PUBLIC_SITE_URL || "https://vintage-store.vercel.app"}/en/product/${id}`,
        'es': `${process.env.NEXT_PUBLIC_SITE_URL || "https://vintage-store.vercel.app"}/es/product/${id}`,
        'fr': `${process.env.NEXT_PUBLIC_SITE_URL || "https://vintage-store.vercel.app"}/fr/product/${id}`,
        'de': `${process.env.NEXT_PUBLIC_SITE_URL || "https://vintage-store.vercel.app"}/de/product/${id}`,
        'ja': `${process.env.NEXT_PUBLIC_SITE_URL || "https://vintage-store.vercel.app"}/ja/product/${id}`,
      },
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { id, locale: localeParam } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  // Get translations for current locale
  const locale = toLocale(localeParam);
  const translatedProduct = getTranslatedProduct(product, locale);

  const similarProducts = await getSimilarProducts(product);
  const translatedSimilarProducts = similarProducts.map((p) =>
    getTranslatedProduct(p, locale)
  );

  const t = await getTranslations("product");
  const tCommon = await getTranslations("common");

  // Schema.org Product structured data with enhanced details
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://vintage-store.vercel.app";

  // Strip HTML tags for schema descriptions
  const stripHtml = (html: string) =>
    html
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${translatedProduct.brand} ${translatedProduct.title}`,
    description: stripHtml(translatedProduct.description),
    sku: product.id,
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    image: product.images,
    category: product.category,
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Era",
        value: product.era,
      },
      ...(product.size
        ? [
            {
              "@type": "PropertyValue",
              name: "Size",
              value: product.size.label,
            },
          ]
        : []),
      {
        "@type": "PropertyValue",
        name: "Condition",
        value: product.condition,
      },
    ],
    offers: {
      "@type": "Offer",
      url: `${baseUrl}/product/${id}`,
      price: product.price.toFixed(2),
      priceCurrency: "EUR",
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/SoldOut",
      itemCondition: "https://schema.org/UsedCondition",
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      seller: {
        "@type": "Organization",
        name: "Dream Azul",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0",
          currency: "EUR",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "NL",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 2,
            maxValue: 3,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 2,
            maxValue: 7,
            unitCode: "DAY",
          },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "NL",
        returnPolicyCategory:
          "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 7,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
    },
  };

  // Breadcrumb structured data
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Shop",
        item: `${baseUrl}/shop`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.category,
        item: `${baseUrl}/shop?category=${encodeURIComponent(product.category)}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: `${translatedProduct.brand} ${translatedProduct.title}`,
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

      <div className="min-h-screen bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumbs */}
          <nav className="mb-8 text-xs sm:text-sm overflow-x-auto">
            <ol className="flex items-center space-x-2 text-gray-500 whitespace-nowrap">
              <li>
                <Link href={`/${locale}`} className="hover:text-gray-700">
                  {tCommon("home")}
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href={`/${locale}/shop`} className="hover:text-gray-700">
                  {tCommon("shop")}
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link
                  href={`/${locale}/shop?category=${translatedProduct.category}`}
                  className="hover:text-gray-700"
                >
                  {translatedProduct.category}
                </Link>
              </li>
              <li>/</li>
              <li className="text-gray-900 font-medium truncate max-w-[150px] sm:max-w-none">
                {translatedProduct.title}
              </li>
            </ol>
          </nav>

          {/* Main Product Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
            {/* Left: Image Gallery */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <ProductGallery
                images={translatedProduct.images}
                title={translatedProduct.title}
              />
            </div>

            {/* Right: Product Details */}
            <div>
              {/* Brand */}
              <p className="text-sm text-gray-500 font-medium mb-2">
                {translatedProduct.brand}
              </p>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                {translatedProduct.title}
              </h1>

              {/* Price and Era */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6">
                <ProductPrice
                  amount={getEffectivePrice(translatedProduct)}
                  originalAmount={
                    isDiscountActive(translatedProduct)
                      ? translatedProduct.price
                      : undefined
                  }
                  className="text-2xl sm:text-3xl font-bold text-gray-900"
                />
                <span className="px-4 py-1 bg-amber-700 text-white text-sm font-semibold rounded-full">
                  {translatedProduct.era}
                </span>
                {!translatedProduct.inStock && (
                  <span className="px-4 py-1 bg-gray-900 text-white text-sm font-semibold rounded-full">
                    {t("sold")}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <div
                  className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: translatedProduct.description,
                  }}
                />
              </div>

              {/* Specifications */}
              {product.size?.specifications &&
                Object.keys(product.size.specifications).length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      {t("measurements")}
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <table className="w-full text-sm">
                        <tbody className="divide-y divide-gray-200">
                          <tr>
                            <td className="py-2 text-gray-600">{t("size")}</td>
                            <td className="py-2 text-gray-900 font-medium text-right">
                              {product.size.label}
                            </td>
                          </tr>
                          {Object.entries(product.size.specifications).map(
                            ([key, value]) => {
                              // Format measurement fields based on locale, display others as-is
                              const displayValue =
                                typeof value === "number" &&
                                isMeasurementField(key)
                                  ? formatMeasurement(value, locale)
                                  : value;

                              return (
                                <tr key={key}>
                                  <td className="py-2 text-gray-600 capitalize">
                                    {key}
                                  </td>
                                  <td className="py-2 text-gray-900 font-medium text-right">
                                    {displayValue}
                                  </td>
                                </tr>
                              );
                            }
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              {/* Condition */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t("condition")}
                </h3>
                <p className="text-gray-700 mb-1">
                  <span className="font-medium">
                    {translatedProduct.condition}
                  </span>
                </p>
                {translatedProduct.conditionNotes && (
                  <p className="text-sm text-gray-600 italic">
                    {translatedProduct.conditionNotes}
                  </p>
                )}
              </div>

              {/* Dimensions */}
              {(product.weightGrams || product.lengthCm || product.widthCm || product.heightCm) && (
                <details className="mb-6 bg-gray-50 rounded-lg" open>
                  <summary className="font-semibold text-gray-900 p-4 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors">
                    {t("dimensions")}
                  </summary>
                  <div className="px-4 pb-4">
                    <table className="w-full text-sm">
                      <tbody className="divide-y divide-gray-200">
                        {product.weightGrams && (
                          <tr>
                            <td className="py-2 text-gray-600">{t("weight")}</td>
                            <td className="py-2 text-gray-900 font-medium text-right">
                              {product.weightGrams}g
                            </td>
                          </tr>
                        )}
                        {product.lengthCm && (
                          <tr>
                            <td className="py-2 text-gray-600">{t("length")}</td>
                            <td className="py-2 text-gray-900 font-medium text-right">
                              {product.lengthCm} cm
                            </td>
                          </tr>
                        )}
                        {product.widthCm && (
                          <tr>
                            <td className="py-2 text-gray-600">{t("width")}</td>
                            <td className="py-2 text-gray-900 font-medium text-right">
                              {product.widthCm} cm
                            </td>
                          </tr>
                        )}
                        {product.heightCm && (
                          <tr>
                            <td className="py-2 text-gray-600">{t("height")}</td>
                            <td className="py-2 text-gray-900 font-medium text-right">
                              {product.heightCm} cm
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </details>
              )}

              {/* Tags */}
              {translatedProduct.tags && translatedProduct.tags.length > 0 && (
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {translatedProduct.tags.map((tag) => (
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
                    id: translatedProduct.id,
                    title: translatedProduct.title,
                    brand: translatedProduct.brand,
                    era: translatedProduct.era,
                    category: translatedProduct.category,
                    size: translatedProduct.size?.label || "N/A",
                    price: translatedProduct.price,
                    imageUrl: translatedProduct.images[0] || "",
                    inStock: translatedProduct.inStock,
                    weightGrams: translatedProduct.weightGrams,
                    freeShipping: translatedProduct.freeShipping,
                    discountPrice: translatedProduct.discountPrice,
                    discountStartDate: translatedProduct.discountStartDate
                      ? translatedProduct.discountStartDate
                          .toDate()
                          .toISOString()
                      : undefined,
                    discountEndDate: translatedProduct.discountEndDate
                      ? translatedProduct.discountEndDate.toDate().toISOString()
                      : undefined,
                  }}
                />
              </div>

              {/* One of a Kind Message */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-amber-900">
                  <span className="font-semibold">{t("oneOfAKind")}</span>{" "}
                  {t("uniqueVintageMessage")}
                </p>
              </div>

              {/* Shipping Calculator or Free Shipping Badge */}
              {translatedProduct.freeShipping ? (
                <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-lg font-semibold text-green-800">
                      🎁 Free Shipping
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-green-700">
                    This item ships free worldwide!
                  </p>
                </div>
              ) : (
                <ShippingCalculator
                  productWeight={translatedProduct.weightGrams}
                  className="mb-6"
                />
              )}
            </div>
          </div>

          {/* Care Instructions & Return Policy */}
          <div className="border-t pt-12 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Care Instructions - Product Type Specific */}
              {product.productType === "Clothing" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {t("careInstructions")}
                  </h2>
                  <div className="prose prose-sm text-gray-700">
                    <ul className="space-y-2">
                      <li>{t("care1")}</li>
                      <li>{t("care2")}</li>
                      <li>{t("care3")}</li>
                      <li>{t("care4")}</li>
                      <li>{t("care5")}</li>
                    </ul>
                  </div>
                </div>
              )}

              {product.productType === "Vinyl Records" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {t("careInstructions")}
                  </h2>
                  <div className="prose prose-sm text-gray-700">
                    <ul className="space-y-2">
                      <li>{t("vinylCare1")}</li>
                      <li>{t("vinylCare2")}</li>
                      <li>{t("vinylCare3")}</li>
                      <li>{t("vinylCare4")}</li>
                      <li>{t("vinylCare5")}</li>
                    </ul>
                  </div>
                </div>
              )}

              {product.productType === "Furniture" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {t("careInstructions")}
                  </h2>
                  <div className="prose prose-sm text-gray-700">
                    <ul className="space-y-2">
                      <li>{t("furnitureCare1")}</li>
                      <li>{t("furnitureCare2")}</li>
                      <li>{t("furnitureCare3")}</li>
                      <li>{t("furnitureCare4")}</li>
                    </ul>
                  </div>
                </div>
              )}

              {product.productType === "Jewelry" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {t("careInstructions")}
                  </h2>
                  <div className="prose prose-sm text-gray-700">
                    <ul className="space-y-2">
                      <li>{t("jewelryCare1")}</li>
                      <li>{t("jewelryCare2")}</li>
                      <li>{t("jewelryCare3")}</li>
                      <li>{t("jewelryCare4")}</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Generic care for other product types */}
              {!["Clothing", "Vinyl Records", "Furniture", "Jewelry"].includes(
                product.productType
              ) && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {t("careInstructions")}
                  </h2>
                  <div className="prose prose-sm text-gray-700">
                    <ul className="space-y-2">
                      <li>{t("genericCare1")}</li>
                      <li>{t("genericCare2")}</li>
                      <li>{t("genericCare3")}</li>
                    </ul>
                  </div>
                </div>
              )}

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {t("returnPolicy")}
                </h2>
                <div className="prose prose-sm text-gray-700">
                  <p className="mb-2">{t("returnIntro")}</p>
                  <ul className="space-y-2">
                    <li>{t("return1")}</li>
                    <li>{t("return2")}</li>
                    <li>{t("return3")}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Similar Items */}
          {translatedSimilarProducts.length > 0 && (
            <div className="border-t pt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t("similarItems")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {translatedSimilarProducts.map((similarProduct) => (
                  <Link
                    key={similarProduct.id}
                    href={`/${locale}/product/${similarProduct.id}`}
                    className="group block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="relative aspect-[3/4] bg-gray-100">
                      {similarProduct.images &&
                      similarProduct.images.length > 0 &&
                      similarProduct.images[0] ? (
                        <Image
                          src={similarProduct.images[0]}
                          alt={similarProduct.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-sm">
                            {tCommon("noImage")}
                          </span>
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
                      <ProductPrice
                        amount={getEffectivePrice(similarProduct)}
                        originalAmount={
                          isDiscountActive(similarProduct)
                            ? similarProduct.price
                            : undefined
                        }
                        className="text-xl font-bold text-gray-900"
                      />
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
