import { NextResponse } from 'next/server'

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
      
      // Debug: Log first product structure
      if (response.products && response.products.length > 0) {
        const firstProduct = response.products[0]
        console.log('🔍 First product structure:', {
          id: firstProduct.id,
          handle: firstProduct.handle,
          title: firstProduct.title,
          status: firstProduct.status,
          hasStatus: 'status' in firstProduct,
          keys: Object.keys(firstProduct)
        })
      }
      
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

export async function GET() {
  console.log('🚀 Sitemap generation started for page 0')
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://revetir.com'
    
    console.log('📄 Generating sitemap for products, page 0')
    
    const { products, count } = await getProducts(1, 100)
    
    if (!products || products.length === 0) {
      console.log('⚠️ No products found')
      return new NextResponse('', {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
      })
    }
    
    console.log(`✅ Found ${products.length} products`)
    
    // Debug: Log all products and their filtering status
    const filteredProducts = products.filter((product: any) => {
      const hasHandle = !!product.handle
      const hasStatus = 'status' in product
      const isPublished = product.status === 'published'
      
      console.log(`🔍 Product "${product.title}":`, {
        handle: product.handle,
        hasHandle,
        hasStatus,
        status: product.status,
        isPublished,
        willInclude: hasHandle && (!hasStatus || isPublished)
      })
      
      // Include products that have handles and either no status field or are published
      return hasHandle && (!hasStatus || isPublished)
    })
    
    console.log(`✅ Filtered to ${filteredProducts.length} products with valid handles`)
    
    // Generate SSENSE-style sitemap: plain text with one URL per line
    const productUrls = filteredProducts
      .map((product: any) => `${baseUrl}/us/products/${product.handle}`)
      .join('\n')

    console.log('✅ Sitemap generated successfully')
    console.log('📝 Sample URLs:', productUrls.split('\n').slice(0, 3))
    
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
