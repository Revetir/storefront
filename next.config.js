/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    optimizePackageImports: ['@medusajs/ui'],
  },
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Vercel-specific optimizations
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400, // 24 hours for better caching
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Add iOS-specific optimizations
    unoptimized: false,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "medusa-server-testing.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "medusa-server-testing.s3.us-east-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "fscswsaqnvpbvpoijecn.supabase.co",
      },
      {
        protocol: "https",
        hostname: "media.revetir.com",
      },
    ],
  },
  // Add headers for better caching and iOS compatibility
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.gstatic.com https://r.stripe.com https://js.radar.com",
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://www.google.com https://pay.google.com",
              "connect-src 'self' https://api.stripe.com https://r.stripe.com https://pay.google.com https://*.stripe.com https://api.radar.io https://*.radar.io",
              "style-src 'self' 'unsafe-inline' https://js.radar.com",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
            ].join('; '),
          },
        ],
      },
      // Add iOS-specific headers for better image handling
      {
        source: '/_next/image(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Accept-Ranges',
            value: 'bytes',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
