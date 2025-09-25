import { NextRequest, NextResponse } from 'next/server'

async function getProductsForPage(page: number, limit: number = 100) {
  try {
    const backendUrl = process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    
    console.log(`🔍 Fetching products: page=${page}, limit=${limit}, backendUrl=${backendUrl}`)
    
    if (!publishableKey) {
      console.log('❌ No publishable key found')
      return { products: [], count: 0 }
    }
    
    const apiUrl = `${backendUrl}/store/products?limit=${limit}&offset=${(page - 1) * limit}&fields=handle,brand.*,updated_at,created_at,status`
    console.log(`🔍 API URL: ${apiUrl}`)
    
    const rawResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'x-publishable-api-key': publishableKey,
        'Content-Type': 'application/json'
      }
    })
    
    if (rawResponse.ok) {
      const response = await rawResponse.json()
      console.log(`✅ API response: ${response.products?.length || 0} products found`)
      return response
    } else {
      console.error('❌ Products fetch failed:', rawResponse.status, rawResponse.statusText)
      return { products: [], count: 0 }
    }
  } catch (error) {
    console.error('❌ Error fetching products:', error)
    return { products: [], count: 0 }
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ page: string }> }
) {
  try {
    const { page } = await params
    const pageNumber = parseInt(page, 10) || 0
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://revetir.com'
    
    console.log(`📄 Generating sitemap for products, page ${pageNumber} (URL: ${request.url})`)
    
    const { products, count } = await getProductsForPage(pageNumber + 1, 100)
    
    if (!products || products.length === 0) {
      console.log('⚠️ No products found for this page')
      return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`, {
        headers: {
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
      })
    }
    
    console.log(`✅ Found ${products.length} products for page ${pageNumber}`)
    
    const filteredProducts = products.filter((product: any) => {
      const hasHandle = !!product.handle
      const hasBrand = !!product.brand?.slug
      const hasStatus = 'status' in product
      const isPublished = product.status === 'published'
      return hasHandle && hasBrand && (!hasStatus || isPublished)
    })
    
    // Generate XML sitemap with canonical product URLs
    const productPages: Array<{
      url: string;
      lastModified: string;
      changeFrequency: string;
      priority: number;
    }> = filteredProducts.map((product: any) => {
      return {
        url: `${baseUrl}/us/products/${product.brand.slug}-${product.handle}`,
        lastModified: new Date().toISOString().split('T')[0],
        changeFrequency: 'weekly',
        priority: 0.6,
      }
    })
    
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${productPages.map(productPage => `  <url>
    <loc>${productPage.url}</loc>
    <lastmod>${productPage.lastModified}</lastmod>
    <changefreq>${productPage.changeFrequency}</changefreq>
    <priority>${productPage.priority}</priority>
  </url>`).join('\n')}
</urlset>`
    
    console.log('✅ XML sitemap generated with canonical brand-product URLs')
    
    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
    
  } catch (error) {
    console.error('❌ Critical error in sitemap generation:', error)
    return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  }
}
