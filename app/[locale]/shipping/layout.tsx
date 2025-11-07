import { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dreamazul.com';

  return {
    title: 'Shipping Policy - Dream Azul Vintage',
    description: 'International shipping rates and policies for Dream Azul vintage store. We ship worldwide from Utrecht, Netherlands.',
    alternates: {
      canonical: `${baseUrl}/${locale}/shipping`,
      languages: {
        'x-default': `${baseUrl}/en/shipping`,
        'en': `${baseUrl}/en/shipping`,
        'es': `${baseUrl}/es/shipping`,
        'fr': `${baseUrl}/fr/shipping`,
        'de': `${baseUrl}/de/shipping`,
        'ja': `${baseUrl}/ja/shipping`,
      },
    },
  };
}

export default function ShippingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
