import { MetadataRoute } from 'next';
import { getProducts } from '@/services/productService';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dreamazul.com';

  // Supported locales
  const locales = ['en', 'es', 'fr', 'de', 'ja'];

  // Static pages (without locale prefix - home page)
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ];

  // Localized static pages
  const localizedPages: MetadataRoute.Sitemap = [];

  locales.forEach((locale) => {
    // Main pages
    localizedPages.push(
      {
        url: `${baseUrl}/${locale}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/${locale}/shop`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/${locale}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      {
        url: `${baseUrl}/${locale}/tax-policy`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.4,
      }
    );
  });

  // Get all products for dynamic pages
  const productsResult = await getProducts();
  const products = productsResult.success && productsResult.data ? productsResult.data : [];

  // Product pages (localized)
  const productPages: MetadataRoute.Sitemap = [];
  locales.forEach((locale) => {
    products.forEach((product) => {
      productPages.push({
        url: `${baseUrl}/${locale}/product/${product.id}`,
        lastModified: product.updatedAt ? new Date(product.updatedAt.toDate()) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: product.featured ? 0.8 : 0.7,
      });
    });
  });

  return [...staticPages, ...localizedPages, ...productPages];
}
