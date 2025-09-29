import { NextRequest, NextResponse } from 'next/server'
import { 
  getSupportedRegions, 
  generateMultiRegionPages, 
  generateSitemapXML,
  SitemapPage 
} from '../../lib/sitemap-utils'

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://revetir.com'
  const currentDate = new Date().toISOString().split('T')[0]
  
  // Get all supported regions
  const regions = await getSupportedRegions()
  
  // Define brand + category combinations (without region prefix)
  const brandCategoryPages = [
    // Chrome Hearts combinations
    {
      path: '/men/brands/chrome-hearts/jewelry',
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      path: '/men/brands/chrome-hearts/rings',
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      path: '/men/brands/chrome-hearts/pendants-charms',
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      path: '/men/brands/chrome-hearts/necklaces',
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      path: '/men/brands/chrome-hearts/earrings',
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      path: '/men/brands/chrome-hearts/bracelets',
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      path: '/men/brands/chrome-hearts/hats',
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      path: '/men/brands/chrome-hearts/glasses',
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      path: '/men/brands/chrome-hearts/t-shirts',
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    // Chrome Hearts - Women's versions
    {
      path: '/women/brands/chrome-hearts/jewelry',
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      path: '/women/brands/chrome-hearts/rings',
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      path: '/women/brands/chrome-hearts/pendants-charms',
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      path: '/women/brands/chrome-hearts/necklaces',
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      path: '/women/brands/chrome-hearts/earrings',
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      path: '/women/brands/chrome-hearts/bracelets',
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      path: '/women/brands/chrome-hearts/hats',
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      path: '/women/brands/chrome-hearts/glasses',
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      path: '/women/brands/chrome-hearts/t-shirts',
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    
    // Maison Margiela combinations
    {
      path: '/men/brands/maison-margiela/shoes',
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      path: '/men/brands/maison-margiela/sneakers',
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      path: '/women/brands/maison-margiela/shoes',
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      path: '/women/brands/maison-margiela/sneakers',
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    
    // Rick Owens combinations
    {
      path: '/men/brands/rick-owens/clothing',
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      path: '/men/brands/rick-owens/t-shirts',
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      path: '/men/brands/rick-owens/pants',
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      path: '/men/brands/rick-owens/sneakers',
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      path: '/men/brands/rick-owens/shoes',
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      path: '/women/brands/rick-owens/clothing',
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      path: '/women/brands/rick-owens/t-shirts',
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      path: '/women/brands/rick-owens/pants',
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      path: '/women/brands/rick-owens/sneakers',
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      path: '/women/brands/rick-owens/shoes',
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    
    // Gentle Monster combinations
    {
      path: '/men/brands/gentle-monster/sunglasses',
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      path: '/men/brands/gentle-monster/eyewear',
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      path: '/women/brands/gentle-monster/sunglasses',
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      path: '/women/brands/gentle-monster/eyewear',
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    
    // Acne Studios combinations
    {
      path: '/men/brands/acne-studios/scarves',
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      path: '/men/brands/acne-studios/jeans',
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      path: '/men/brands/acne-studios/clothing',
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      path: '/men/brands/acne-studios/accessories',
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      path: '/women/brands/acne-studios/scarves',
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      path: '/women/brands/acne-studios/jeans',
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      path: '/women/brands/acne-studios/clothing',
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      path: '/women/brands/acne-studios/accessories',
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
  ]

  // Generate pages for all regions with hreflang annotations
  const pages = generateMultiRegionPages(baseUrl, brandCategoryPages, regions)
  
  // Generate XML with hreflang support
  const xml = generateSitemapXML(pages)

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}