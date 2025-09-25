import { NextRequest, NextResponse } from 'next/server'

async function getProductsForPage(page: number, limit: number = 100) {
  try {
    const backendUrl = process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    
    if (!publishableKey) {
      return { products: [], count: 0 }
    }
    
    const rawResponse = await fetch(`${backendUrl}/store/products?limit=${limit}&offset=${(page - 1) * limit}&fields=handle,brand.*,updated_at,created_at,status`, {
      method: 'GET',
      headers: {
        'x-publishable-api-key': publishableKey,
        'Content-Type': 'application/json'
      }
    })
    
    if (rawResponse.ok) {
      const response = await rawResponse.json()
      return response
    } else {
      console.error('❌ Products fetch failed:', rawResponse.status)
      return { products: [], count: 0 }
    }
  } catch (error) {
    console.error('❌ Error fetching products:', error)
    return { products: [], count: 0 }
  }
}

export async function GET(request: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://revetir.com'
    const currentDate = new Date().toISOString().split('T')[0]
    
    console.log('📄 Generating comprehensive product sitemap...')
    
    // Get total product count first
    const { count: totalCount } = await getProductsForPage(1, 1)
    const totalPages = Math.ceil(totalCount / 100)
    
    console.log(`📊 Found ${totalCount} total products across ${totalPages} pages`)
    
    // Generate sitemap index that references individual product sitemaps
    const sitemapEntries = []
    
    for (let i = 0; i < totalPages; i++) {
      sitemapEntries.push({
        url: `${baseUrl}/sitemap_products_${i}.xml`,
        lastModified: currentDate,
      })
    }
    
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries.map(entry => `  <sitemap>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`
    
    console.log('✅ Product sitemap index generated')
    
    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
    
  } catch (error) {
    console.error('❌ Critical error in product sitemap generation:', error)
    return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</sitemapindex>`, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  }
}
