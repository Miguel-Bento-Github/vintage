import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vintage-store.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/cart/', '/checkout/', '/order-confirmation/', '/email-preview/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
