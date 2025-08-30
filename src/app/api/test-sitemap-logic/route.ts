import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🧪 Testing sitemap logic...')
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://revetir.com'
    const backendUrl = process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

    if (!publishableKey) {
      return NextResponse.json({ error: 'No publishable key' }, { status: 400 })
    }

    // Fetch products using the same logic as the sitemap
    const rawResponse = await fetch(`${backendUrl}/store/products?limit=5`, {
      method: 'GET',
      headers: {
        'x-publishable-api-key': publishableKey,
        'Content-Type': 'application/json'
      }
    })

    if (!rawResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: rawResponse.status })
    }

    const response = await rawResponse.json()
    const products = response.products || []

    // Test the filtering logic
    const filteredProducts = products.filter((product: any) => {
      const hasHandle = !!product.handle
      const hasStatus = 'status' in product
      const isPublished = product.status === 'published'
      
      return hasHandle && (!hasStatus || isPublished)
    })

    // Generate sample URLs
    const sampleUrls = filteredProducts.map((product: any) => `${baseUrl}/us/products/${product.handle}`)

    return NextResponse.json({
      success: true,
      totalProducts: products.length,
      filteredProducts: filteredProducts.length,
      sampleUrls,
      productDetails: filteredProducts.map((p: any) => ({
        title: p.title,
        handle: p.handle,
        status: p.status,
        hasStatus: 'status' in p
      }))
    })

  } catch (error) {
    console.error('❌ Sitemap logic test failed:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
