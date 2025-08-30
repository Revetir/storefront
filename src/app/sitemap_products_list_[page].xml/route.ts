import { NextRequest, NextResponse } from 'next/server'
import { sdk } from '@lib/config'
import { getRegion } from '@lib/data/regions'

// Enhanced product fetching function for sitemap
async function getAllProductsWithImages(countryCode: string, page: number = 1, limit: number = 100) {
  try {
    const region = await getRegion(countryCode)
    if (!region) {
      console.error(`No region found for country code: ${countryCode}`)
      return { products: [], count: 0 }
    }

    const offset = (page - 1) * limit
    
    const response = await sdk.client.fetch<{ products: any[]; count: number }>(
      "/store/products",
      {
        method: "GET",
        query: {
          limit,
          offset,
          region_id: region.id,
          status: "published",
          fields: "handle,title,updated_at,created_at,status,thumbnail,images,type,metadata",
        },
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    return response
  } catch (error) {
    console.error(`Error fetching products for ${countryCode}:`, error)
    return { products: [], count: 0 }
  }
}

// Generate image URLs for a product
function generateImageUrls(product: any, baseUrl: string, countryCode: string): string[] {
  const imageUrls: string[] = []
  
  // Add thumbnail if available
  if (product.thumbnail) {
    imageUrls.push(product.thumbnail)
  }
  
  // Add product images if available
  if (product.images && Array.isArray(product.images)) {
    product.images.forEach((image: any) => {
      if (image.url) {
        imageUrls.push(image.url)
      }
    })
  }
  
  // If no images found, create placeholder image URLs based on product handle
  if (imageUrls.length === 0 && product.handle) {
    // Generate placeholder image URLs (you can customize this pattern)
    for (let i = 1; i <= 4; i++) {
      imageUrls.push(`${baseUrl}/api/images/${product.handle}_${i}.jpg`)
    }
  }
  
  return imageUrls
}

// Get all available regions dynamically
async function getAvailableRegions() {
  try {
    const response = await sdk.client.fetch<{ regions: any[] }>(
      "/store/regions",
      {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    
    const countryCodes: string[] = []
    response.regions?.forEach((region) => {
      region.countries?.forEach((country: any) => {
        if (country.iso_2) {
          countryCodes.push(country.iso_2)
        }
      })
    })
    
    return countryCodes.length > 0 ? countryCodes : ['us']
  } catch (error) {
    console.error('Error fetching regions:', error)
    return ['us'] // Fallback to US
  }
}

// Generate fallback URLs for when backend is unavailable
function generateFallbackUrls(baseUrl: string, pageNumber: number): string[] {
  const fallbackUrls: string[] = []
  
  // Generate some fallback product URLs based on common patterns
  const fallbackHandles = [
    'classic-tshirt',
    'vintage-jeans',
    'leather-jacket',
    'sneakers',
    'hoodie',
    'dress-shirt',
    'casual-pants',
    'summer-dress',
    'winter-coat',
    'accessories'
  ]
  
  const countries = ['us', 'ca', 'gb']
  
  countries.forEach(country => {
    fallbackHandles.forEach(handle => {
      const productUrl = `${baseUrl}/${country}/products/${handle}`
      fallbackUrls.push(productUrl)
      
      // Add some fallback image URLs
      for (let i = 1; i <= 4; i++) {
        fallbackUrls.push(`${baseUrl}/api/images/${handle}_${i}.jpg`)
      }
    })
  })
  
  return fallbackUrls
}

// Validate and clean image URLs
function validateImageUrl(url: string): boolean {
  if (!url) return false
  
  // Check if it's a valid URL
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ page: string }> }
) {
  const { page } = await params
  const pageNumber = parseInt(page, 10) || 0
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://revetir.com'
  
  let allUrls: string[] = []
  let hasValidData = false
  
  try {
    // Get available regions dynamically
    const countryCodes = await getAvailableRegions()
    console.log(`Processing ${countryCodes.length} countries for sitemap page ${pageNumber}`)
    
    // Fetch products for each country
    for (const countryCode of countryCodes) {
      try {
        const { products, count } = await getAllProductsWithImages(countryCode, pageNumber + 1, 100)
        
        if (products && products.length > 0) {
          hasValidData = true
          // Generate URLs for each product
          products.forEach((product) => {
            if (product.handle) {
              // Product URL
              const productUrl = `${baseUrl}/${countryCode}/products/${product.handle}`
              allUrls.push(productUrl)
              
              // Image URLs
              const imageUrls = generateImageUrls(product, baseUrl, countryCode)
              // Filter out invalid image URLs
              const validImageUrls = imageUrls.filter(validateImageUrl)
              allUrls.push(...validImageUrls)
            }
          })
          
          console.log(`Generated ${products.length} products for ${countryCode} (page ${pageNumber})`)
        }
      } catch (countryError) {
        console.error(`Error processing country ${countryCode}:`, countryError)
        // Continue with other countries even if one fails
      }
    }
    
    console.log(`Total URLs generated: ${allUrls.length}`)
    
  } catch (error) {
    console.error('Error generating sitemap:', error)
  }

  // If no valid data was found, use fallback URLs
  if (!hasValidData || allUrls.length === 0) {
    console.log('Using fallback URLs for sitemap')
    allUrls = generateFallbackUrls(baseUrl, pageNumber)
  }

  // Generate the sitemap content in SSENSE-like format
  const sitemapContent = allUrls.join('')

  return new NextResponse(sitemapContent, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
