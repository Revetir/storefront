import { NextRequest, NextResponse } from 'next/server'
import { getAllProductsForSitemap } from '@lib/data/products'
import { listRegions } from '@lib/data/regions'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ page: string }> }
) {
  const { page } = await params
  const pageNumber = parseInt(page, 10) || 0
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://revetir.com'
  const currentDate = new Date().toISOString().split('T')[0]
  
  // For now, we'll return all products in the first page
  // In the future, you can implement pagination here if you have thousands of products
  let productPages: Array<{
    url: string
    lastModified: string
    changeFrequency: string
    priority: number
  }> = []
  
  try {
    // Get all regions to fetch products for each country
    const regions = await listRegions()
    const countryCodes = regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat().filter((code): code is string => Boolean(code)) || ['us']
    
    // Fetch products for each country
    const productPromises = countryCodes.map(async (countryCode) => {
      const products = await getAllProductsForSitemap({ countryCode })
      
      return products
        .filter((product) => product.handle) // Only include products with handles
        .map((product) => ({
          url: `${baseUrl}/${countryCode}/products/${product.handle}`,
          lastModified: new Date(product.updated_at || product.created_at || new Date()).toISOString().split('T')[0],
          changeFrequency: 'weekly',
          priority: 0.7,
        }))
    })
    
    const allProductPages = await Promise.all(productPromises)
    productPages = allProductPages.flat()
    
    console.log(`Generated ${productPages.length} product pages for sitemap page ${pageNumber}`)
  } catch (error) {
    console.error('Error generating product pages for sitemap:', error)
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${productPages.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastModified}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
