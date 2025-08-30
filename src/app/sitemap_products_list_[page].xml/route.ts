import { NextRequest, NextResponse } from 'next/server'
import { sdk } from '@lib/config'
import { getRegion } from '@lib/data/regions'

// Simple product fetching function for US products only
async function getUSProducts(page: number = 1, limit: number = 100) {
  try {
    console.log('🔍 Fetching US region...')
    const region = await getRegion('us')
    
    if (!region) {
      console.error('❌ No US region found')
      return { products: [], count: 0, error: 'No US region found' }
    }
    
    console.log('✅ US region found:', { id: region.id, name: region.name })

    const offset = (page - 1) * limit
    
    console.log('🔍 Fetching products with params:', { limit, offset, region_id: region.id })
    
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

    console.log('✅ Products fetched successfully:', { count: response.count, productsLength: response.products?.length })
    return response
  } catch (error) {
    console.error('❌ Error fetching US products:', error)
    return { products: [], count: 0, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ page: string }> }
) {
  console.log('🚀 Sitemap generation started')
  
  // Always return some XML content, even if there's an error
  try {
    const { page } = await params
    const pageNumber = parseInt(page, 10) || 0
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://revetir.com'
    
    // Debug environment variables
    console.log('🔧 Environment check:', {
      MEDUSA_BACKEND_URL: process.env.MEDUSA_BACKEND_URL ? 'SET' : 'MISSING',
      NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ? 'SET' : 'MISSING',
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'using default',
      baseUrl
    })
    
    console.log(`📄 Generating sitemap for US products, page ${pageNumber}`)
    
    const result = await getUSProducts(pageNumber + 1, 100)
    const { products, count } = result
    const error = 'error' in result ? result.error : null
    
    if (error) {
      console.error('❌ Error in product fetching:', error)
      // Return error XML with debug info
      const errorXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Error: ${error} -->
  <url>
    <loc>${baseUrl}/us/products/error-debug</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.1</priority>
  </url>
</urlset>`
      
      return new NextResponse(errorXml, {
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
      })
    }
    
    if (!products || products.length === 0) {
      console.log('⚠️ No products found for US region')
      // Return empty but valid XML with debug info
      const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- No products found - Debug Info -->
  <url>
    <loc>${baseUrl}/us/products/no-products-found</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.1</priority>
  </url>
</urlset>`
      
      return new NextResponse(emptyXml, {
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
      })
    }
    
    console.log(`✅ Found ${products.length} products for US region`)
    
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

    console.log('✅ XML sitemap generated successfully')
    
    return new NextResponse(xmlContent, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
    
  } catch (error) {
    console.error('❌ Critical error in sitemap generation:', error)
    
    // Return error XML with debug info
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://revetir.com'
    
    const errorXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Critical Error: ${errorMessage} -->
  <url>
    <loc>${baseUrl}/us/products/critical-error</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.1</priority>
  </url>
</urlset>`
    
    return new NextResponse(errorXml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  }
}
