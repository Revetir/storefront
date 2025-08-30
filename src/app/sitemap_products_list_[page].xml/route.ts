import { NextRequest, NextResponse } from 'next/server'
import { sdk } from '@lib/config'
import { getRegion } from '@lib/data/regions'

// Simple product fetching function for US products only
async function getUSProducts(page: number = 1, limit: number = 100) {
  try {
    const region = await getRegion('us')
    if (!region) {
      console.error('No US region found')
      return { products: [], count: 0 }
    }

    const offset = (page - 1) * limit
    
    const response = await sdk.client.fetch<{ products: any[]; count: number }>(
      "/store/products",
      {
        method: "GET",
        query: {
          limit,
          offset,
          region_id: region.id,
          status: "published",
          fields: "handle,title,updated_at",
        },
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    return response
  } catch (error) {
    console.error('Error fetching US products:', error)
    return { products: [], count: 0 }
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ page: string }> }
) {
  const { page } = await params
  const pageNumber = parseInt(page, 10) || 0
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://revetir.com'
  
  console.log(`Generating sitemap for US products, page ${pageNumber}`)
  
  try {
    const { products, count } = await getUSProducts(pageNumber + 1, 100)
    
    if (!products || products.length === 0) {
      console.log('No products found for US region')
      // Return empty but valid XML
      const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`
      
      return new NextResponse(emptyXml, {
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
      })
    }
    
    console.log(`Found ${products.length} products for US region`)
    
    // Generate XML sitemap with product URLs
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${products
  .filter(product => product.handle) // Only include products with handles
  .map(product => `  <url>
    <loc>${baseUrl}/us/products/${product.handle}</loc>
    <lastmod>${product.updated_at || new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`)
  .join('\n')}
</urlset>`

    return new NextResponse(xmlContent, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
    
  } catch (error) {
    console.error('Error generating sitemap:', error)
    
    // Return error XML
    const errorXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`
    
    return new NextResponse(errorXml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  }
}
