import { NextRequest, NextResponse } from 'next/server'

async function getProductsForPage(page: number, limit: number = 100) {
  try {
    const backendUrl = process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    
    if (!publishableKey) {
      return { products: [], count: 0 }
    }
    
    const rawResponse = await fetch(`${backendUrl}/store/products?limit=${limit}&offset=${(page - 1) * limit}`, {
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ page: string }> }
) {
  try {
    const { page } = await params
    const pageNumber = parseInt(page, 10) || 0
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://revetir.com'
    
    console.log(`📄 Generating sitemap for products, page ${pageNumber}`)
    
    const { products, count } = await getProductsForPage(pageNumber + 1, 100)
    
    if (!products || products.length === 0) {
      console.log('⚠️ No products found for this page')
      return new NextResponse('', {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
      })
    }
    
    console.log(`✅ Found ${products.length} products for page ${pageNumber}`)
    
    const filteredProducts = products.filter((product: any) => {
      const hasHandle = !!product.handle
      const hasStatus = 'status' in product
      const isPublished = product.status === 'published'
      return hasHandle && (!hasStatus || isPublished)
    })
    
    // Generate URLs with BOTH formats for SEO - FIXED to actually include brand keywords
    const productUrls = filteredProducts.map((product: any) => {
      const productType = product.type?.value || 'unknown'
      const cleanType = productType.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      
      // Debug: Log what we're generating
      console.log(`🔍 Product: ${product.title}, Type: ${productType}, Clean: ${cleanType}`)
      
      // Return both URL formats for SEO - NOW WITH ACTUAL BRAND KEYWORDS
      const standardUrl = `${baseUrl}/us/products/${product.handle}`
      const brandUrl = `${baseUrl}/us/products/${cleanType}/${product.handle}`
      
      return `${standardUrl}\n${brandUrl}`
    }).join('\n')
    
    console.log('✅ Sitemap generated with brand keywords')
    
    return new NextResponse(productUrls, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
    
  } catch (error) {
    console.error('❌ Critical error in sitemap generation:', error)
    return new NextResponse('', {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  }
}
