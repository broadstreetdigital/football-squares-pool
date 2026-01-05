/** @type {import('next').NextConfig} */
const nextConfig = {
  // Webflow Cloud environment variable support
  basePath: process.env.BASE_URL || '',
  assetPrefix: process.env.ASSETS_PREFIX || '',

  // Edge runtime compatibility
  experimental: {
    serverComponentsExternalPackages: [],
  },

  // Optimize for production
  reactStrictMode: true,

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ];
  },
};

module.exports = nextConfig;
