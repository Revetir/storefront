import { NextRequest, NextResponse } from 'next/server'
import { sdk } from '@lib/config'

// Direct product fetching function - no regions dependency
async function getProducts(page: number = 1, limit: number = 100) {
  try {
    console.log('🔍 Fetching products directly...')
    
    const response = await sdk.client.fetch<{ products: any[]; count: number }>(
      "/store/products",
      {
        method: "GET",
        query: {
          limit,
          offset: (page - 1) * limit,
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
    console.error('❌ Error fetching products:', error)
    return { products: [], count: 0 }
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ page: string }> }
) {
  console.log('🚀 Sitemap generation started')
  
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
    
    console.log(`📄 Generating sitemap for products, page ${pageNumber}`)
    
    const { products, count } = await getProducts(pageNumber + 1, 100)
    
    if (!products || products.length === 0) {
      console.log('⚠️ No products found')
      // Return empty but valid content
      return new NextResponse('', {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
      })
    }
    
    console.log(`✅ Found ${products.length} products`)
    
    // Generate SSENSE-style sitemap: plain text with one URL per line
    const productUrls = products
      .filter(product => product.handle) // Only include products with handles
      .map(product => `${baseUrl}/us/products/${product.handle}`)
      .join('\n')

    console.log('✅ Sitemap generated successfully')
    
    return new NextResponse(productUrls, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
    
  } catch (error) {
    console.error('❌ Critical error in sitemap generation:', error)
    
    // Return empty content on error
    return new NextResponse('', {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  }
}
