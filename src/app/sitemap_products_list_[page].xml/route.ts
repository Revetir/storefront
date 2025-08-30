import { NextRequest, NextResponse } from 'next/server'

// Direct product fetching function using the working authentication method
async function getProducts(page: number = 1, limit: number = 100) {
  try {
    console.log('🔍 Fetching products with publishable API key...')
    
    const backendUrl = process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    
    if (!publishableKey) {
      console.error('❌ No publishable API key found')
      return { products: [], count: 0 }
    }
    
    // Use the working authentication method from the diagnostic
    const rawResponse = await fetch(`${backendUrl}/store/products?limit=${limit}&offset=${(page - 1) * limit}`, {
      method: 'GET',
      headers: {
        'x-publishable-api-key': publishableKey,
        'Content-Type': 'application/json'
      }
    })
    
    if (rawResponse.ok) {
      const response = await rawResponse.json()
      console.log('✅ Products fetched successfully:', { count: response.count, productsLength: response.products?.length })
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
  console.log('🚀 Sitemap generation started')
  
  try {
    const { page } = await params
    const pageNumber = parseInt(page, 10) || 0
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://revetir.com'
    
    console.log(`📄 Generating sitemap for products, page ${pageNumber}`)
    
    const { products, count } = await getProducts(pageNumber + 1, 100)
    
    if (!products || products.length === 0) {
      console.log('⚠️ No products found')
      // Return empty content
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
      .filter((product: any) => product.handle && product.status === 'published') // Only include published products with handles
      .map((product: any) => `${baseUrl}/us/products/${product.handle}`)
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
