const excludedPaths = ["/checkout", "/account/*"]

// Get the site URL from environment variables or use a fallback
const getSiteUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  // Fallback to your custom domain
  return 'https://revetir.com'
}

module.exports = {
  siteUrl: getSiteUrl(),
  generateRobotsTxt: true,
  exclude: excludedPaths + ["/[sitemap]"],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
      },
      {
        userAgent: "*",
        disallow: excludedPaths,
      },
    ],
  },
  // Additional options for better sitemap generation
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 5000,
}
