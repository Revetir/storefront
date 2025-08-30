import { NextRequest, NextResponse } from 'next/server'

async function getProducts(page: number = 1, limit: number = 100) {
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
      return { products: [], count: 0 }
    }
  } catch (error) {
    return { products: [], count: 0 }
  }
}

export async function GET(request: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://revetir.com'
    const { products } = await getProducts(1, 100)
    
    if (!products || products.length === 0) {
      return new NextResponse('', {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
      })
    }
    
    const filteredProducts = products.filter((product: any) => {
      const hasHandle = !!product.handle
      const hasStatus = 'status' in product
      const isPublished = product.status === 'published'
      return hasHandle && (!hasStatus || isPublished)
    })
    
    const productUrls = filteredProducts
      .map((product: any) => `${baseUrl}/us/products/${product.handle}`)
      .join('\n')
    
    return new NextResponse(productUrls, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
    
  } catch (error) {
    return new NextResponse('', {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  }
}
