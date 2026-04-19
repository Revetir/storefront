/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@medusajs/ui'],
  },
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  // Vercel-specific optimizations
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ['image/webp', 'image/avif'],
    qualities: [75, 85, 90],
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
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
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
        source: '/:countryCode/products/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=1800, stale-while-revalidate=3600',
          },
        ],
      },
      {
        source: '/:countryCode/:gender/brands/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=1800, stale-while-revalidate=3600',
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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://web.squarecdn.com https://sandbox.web.squarecdn.com https://www.paypal.com https://www.sandbox.paypal.com https://www.paypalobjects.com https://www.gstatic.com https://*.gstatic.com https://pay.google.com https://r.stripe.com https://js.radar.com https://www.googletagmanager.com https://connect.facebook.net https://cdn.jsdelivr.net https://*.facebook.com https://*.facebook.net https://static.cloudflareinsights.com",
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://web.squarecdn.com https://sandbox.web.squarecdn.com https://www.paypal.com https://www.sandbox.paypal.com https://*.paypal.com https://www.google.com https://pay.google.com https://payments.google.com https://www.facebook.com https://*.facebook.com",
              "connect-src 'self' blob: https://application-production-0ced.up.railway.app https://google.com https://www.google.com https://pay.google.com https://payments.google.com https://api.stripe.com https://r.stripe.com https://*.stripe.com https://api.radar.io https://*.radar.io https://web.squarecdn.com https://sandbox.web.squarecdn.com https://pci-connect.squareup.com https://pci-connect.squareupsandbox.com https://o160250.ingest.sentry.io https://www.paypal.com https://www.sandbox.paypal.com https://api-m.paypal.com https://api-m.sandbox.paypal.com https://*.paypal.com https://*.paypalobjects.com https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://www.facebook.com https://*.facebook.com https://*.facebook.net https://*.conversionsapigateway.com https://*.us-central1.run.app https://*.algolia.net https://*.algolianet.com https://*.algolia.io https://static.cloudflareinsights.com https://*.cloudflare.com https://res.17track.net https://*.sanity.io https://*.api.sanity.io",
              "style-src 'self' 'unsafe-inline' https://js.radar.com https://web.squarecdn.com https://sandbox.web.squarecdn.com",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data: https://static.radar.com https://square-fonts-production-f.squarecdn.com https://cash-f.squarecdn.com https://d1g145x70srn7h.cloudfront.net",
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
