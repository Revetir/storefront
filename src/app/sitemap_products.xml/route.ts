import { NextRequest, NextResponse } from 'next/server'
import { 
  getSupportedRegions, 
  generateSitemapXML,
  SitemapPage 
} from '../../lib/sitemap-utils'

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
    return { products: [] }
  }
}

export async function GET(request: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://revetir.com'
    const currentDate = new Date().toISOString().split('T')[0]

    const { products } = await getAllProducts()

    if (!products || products.length === 0) {
      return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`, {
        headers: {
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
      })
    }
    
    const filteredProducts = products.filter((product: any) => {
      const hasHandle = !!product.handle
      const hasBrand = !!product.brand?.slug
      const hasStatus = 'status' in product
      const isPublished = product.status === 'published'
      return hasHandle && hasBrand && (!hasStatus || isPublished)
    })
    
    // Get all supported regions
    const regions = await getSupportedRegions()
    
    // Generate product pages for all regions
    const productPages: SitemapPage[] = []
    
    filteredProducts.forEach((product: any) => {
      const productPath = `/products/${product.brand.slug}-${product.handle}`
      const lastModified = product.updated_at 
        ? new Date(product.updated_at).toISOString().split('T')[0] 
        : currentDate
      
      // Generate hreflang annotations for this product across all regions
      const hreflang: { [lang: string]: string } = {}
      regions.forEach(region => {
        const url = `${baseUrl}/${region.code}${productPath}`
        hreflang[region.hreflang] = url
      })
      
      // Create page entries for each region
      regions.forEach(region => {
        productPages.push({
          url: `${baseUrl}/${region.code}${productPath}`,
          lastModified,
          changeFrequency: 'weekly',
          priority: 0.6,
          hreflang
        })
      })
    })
    
    // Generate XML with hreflang support
    const xml = generateSitemapXML(productPages)

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })

  } catch (error) {
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