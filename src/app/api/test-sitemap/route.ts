import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🧪 Testing sitemap generation...')
    
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://revetir.com'
    const backendUrl = process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    
    // Test the same product fetching logic as the sitemap
    let productsResponse = null
    try {
      const rawResponse = await fetch(`${backendUrl}/store/products?limit=5`, {
        method: 'GET',
        headers: {
          'x-publishable-api-key': publishableKey!,
          'Content-Type': 'application/json'
        }
      })
      
      if (rawResponse.ok) {
        productsResponse = await rawResponse.json()
        console.log('✅ Products fetched successfully:', { count: productsResponse.count })
      } else {
        console.error('❌ Products fetch failed:', rawResponse.status, rawResponse.statusText)
      }
    } catch (error) {
      console.error('❌ Products fetch failed:', error)
    }
    
    // Generate sample sitemap URLs
    let sampleUrls = []
    if (productsResponse && productsResponse.products) {
      sampleUrls = productsResponse.products
        .filter((product: any) => product.handle && product.status === 'published')
        .map((product: any) => `${baseUrl}/us/products/${product.handle}`)
        .slice(0, 3) // Just show first 3 for testing
    }
    
    return NextResponse.json({
      success: true,
      test: 'sitemap-generation',
      products: productsResponse ? `found ${productsResponse.count} total` : 'failed',
      sampleUrls,
      baseUrl,
      backendUrl: backendUrl ? 'SET' : 'MISSING',
      publishableKey: publishableKey ? 'SET' : 'MISSING',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Sitemap test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
