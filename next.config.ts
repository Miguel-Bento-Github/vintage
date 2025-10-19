import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9199',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  // Allow access from local network for mobile testing
  allowedDevOrigins: [
    'http://192.168.1.53:5577',
    'http://192.168.1.53:3000',
  ],
};

export default nextConfig;
