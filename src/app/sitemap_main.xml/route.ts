import { NextRequest, NextResponse } from 'next/server'
import { 
  getSupportedRegions, 
  generateMultiRegionPages, 
  generateSitemapXML,
  SitemapPage 
} from '@lib/sitemap-utils'

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://revetir.com'
  const currentDate = new Date().toISOString().split('T')[0]
  
  // Get all supported regions
  const regions = await getSupportedRegions()
  
  // Define static pages structure (without region prefix)
  const staticPages = [
    // Main pages
    {
      path: '',
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      path: '/partnerships',
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    },
    
    // Main categories - Men's versions
    {
      path: '/men/clothing',
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      path: '/men/accessories',
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      path: '/men/shoes',
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      path: '/men/bags',
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      path: '/men/jewelry',
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      path: '/men/rings',
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      path: '/men/pendants-charms',
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      path: '/men/necklaces',
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      path: '/men/earrings',
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      path: '/men/bracelets',
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      path: '/men/scarves',
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      path: '/men/sneakers',
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      path: '/men/t-shirts',
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      path: '/men/hats',
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      path: '/men/caps',
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      path: '/men/eyewear',
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      path: '/men/sunglasses',
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      path: '/men/glasses',
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    
    // Main categories - Women's versions
    {
      path: '/women/clothing',
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      path: '/women/accessories',
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      path: '/women/shoes',
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      path: '/women/bags',
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      path: '/women/jewelry',
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      path: '/women/rings',
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      path: '/women/pendants-charms',
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      path: '/women/necklaces',
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      path: '/women/earrings',
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      path: '/women/bracelets',
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      path: '/women/scarves',
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      path: '/women/sneakers',
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      path: '/women/t-shirts',
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      path: '/women/hats',
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      path: '/women/caps',
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      path: '/women/eyewear',
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      path: '/women/sunglasses',
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      path: '/women/glasses',
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    
    // Customer Care main section
    {
      path: '/customer-care',
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    
    // Important customer-care subpages
    {
      path: '/customer-care/about-us',
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      path: '/customer-care/contact-us',
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      path: '/customer-care/faq',
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      path: '/customer-care/shipping',
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      path: '/customer-care/return-policy',
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    
    // Legal pages
    {
      path: '/privacy-policy',
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      path: '/terms-conditions',
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ]

  // Generate pages for all regions with hreflang annotations
  const pages = generateMultiRegionPages(baseUrl, staticPages, regions)
  
  // Generate XML with hreflang support
  const xml = generateSitemapXML(pages)

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}