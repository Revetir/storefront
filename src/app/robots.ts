import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                  process.env.NEXT_PUBLIC_VERCEL_URL ? 
                  `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 
                  'https://revetir.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/checkout', '/account', '/admin'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
