import { NextRequest, NextResponse } from 'next/server'

async function getAllProducts() {
  try {
    const backendUrl = process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    
    if (!publishableKey) {
      return { products: [] }
    }
    
    // Fetch all products in batches
    const allProducts = []
    let offset = 0
    const limit = 100
    
    while (true) {
      const response = await fetch(
        `${backendUrl}/store/products?limit=${limit}&offset=${offset}&fields=handle,brand.*,updated_at,created_at,status`,
        {
          method: 'GET',
          headers: {
            'x-publishable-api-key': publishableKey,
            'Content-Type': 'application/json'
          }
        }
      )
      
      if (!response.ok) {
        console.error('❌ Products fetch failed:', response.status)
        break
      }
      
      const data = await response.json()
      if (!data.products || data.products.length === 0) {
        break
      }
      
      allProducts.push(...data.products)
      offset += limit
      
      // Safety break to prevent infinite loops
      if (data.products.length < limit) {
        break
      }
    }
    
    return { products: allProducts }
  } catch (error) {
    console.error('❌ Error fetching products:', error)
    return { products: [] }
  }
}

export async function GET(request: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://revetir.com'
    const currentDate = new Date().toISOString().split('T')[0]
    
    console.log('📄 Generating products sitemap...')
    
    const { products } = await getAllProducts()
    
    if (!products || products.length === 0) {
      console.log('⚠️ No products found')
      return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`, {
        headers: {
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
      })
    }
    
    console.log(`✅ Found ${products.length} products`)
    
    const filteredProducts = products.filter((product: any) => {
      const hasHandle = !!product.handle
      const hasBrand = !!product.brand?.slug
      const hasStatus = 'status' in product
      const isPublished = product.status === 'published'
      return hasHandle && hasBrand && (!hasStatus || isPublished)
    })
    
    const productPages = filteredProducts.map((product: any) => {
      return {
        url: `${baseUrl}/us/products/${product.brand.slug}-${product.handle}`,
        lastModified: product.updated_at ? new Date(product.updated_at).toISOString().split('T')[0] : currentDate,
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
    
    console.log('✅ Products sitemap generated')
    
    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
    
  } catch (error) {
    console.error('❌ Critical error in products sitemap generation:', error)
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
