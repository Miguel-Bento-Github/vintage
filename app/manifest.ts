import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Vintage Store - Authentic Vintage Items',
    short_name: 'Vintage Store',
    description: 'Shop authentic vintage items from the 1950s to 2000s. Curated vintage clothing, furniture, vinyl records, jewelry, and collectibles.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#92400e',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    categories: ['shopping', 'lifestyle', 'fashion'],
  };
}
