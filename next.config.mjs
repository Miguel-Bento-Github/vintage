import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use separate build directory for dev to avoid conflicts
  distDir: process.env.BUILD_DIR || '.next',

  // Image optimization configuration
  images: {
    // Use WebP for fast loading (images are pre-converted to WebP on upload)
    formats: ['image/webp'],

    // Device-specific sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // Remote image sources
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: '*.firebasestorage.app',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9199',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3478',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],

    // Minimize layout shift with strict dimensions
    unoptimized: false,

    // Increase cache duration for optimized images (1 year)
    minimumCacheTTL: 31536000,
  },

  // Production optimizations
  productionBrowserSourceMaps: false,

  // Compiler optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Allow access from local network for mobile testing
  allowedDevOrigins: [
    'http://192.168.1.53:5577',
    'http://192.168.1.53:3000',
  ],

  // Add cache headers for better performance
  async headers() {
    return [
      {
        source: '/_next/image(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Redirect old routes to new ones
  async redirects() {
    return [
      {
        source: '/admin/add-product',
        destination: '/admin/products/edit/new',
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
