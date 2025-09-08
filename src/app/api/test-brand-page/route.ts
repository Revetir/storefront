import { NextRequest, NextResponse } from "next/server"
import { getBrandBySlug, getBrandProducts } from "@lib/data/brands"
import { getRegion } from "@lib/data/regions"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const brandSlug = searchParams.get('brandSlug') || 'chrome-hearts'
    const countryCode = searchParams.get('countryCode') || 'us'
    const gender = searchParams.get('gender') || 'men'
    
    console.log(`Testing brand page data fetching for: ${brandSlug}`)
    
    // Test each step of the brand page data fetching
    const results: any = {}
    
    // Step 1: Get region
    try {
      const region = await getRegion(countryCode)
      results.region = region ? { id: region.id, name: region.name } : null
    } catch (error) {
      results.regionError = error instanceof Error ? error.message : "Unknown error"
    }
    
    // Step 2: Get brand
    try {
      const brand = await getBrandBySlug(brandSlug)
      results.brand = brand
    } catch (error) {
      results.brandError = error instanceof Error ? error.message : "Unknown error"
    }
    
    // Step 3: Get brand products
    try {
      const { products, count } = await getBrandProducts({
        brandSlug,
        limit: 12,
        offset: 0,
        sort: "created_at",
        countryCode,
      })
      results.products = { count: count, sampleProducts: products.slice(0, 2) }
    } catch (error) {
      results.productsError = error instanceof Error ? error.message : "Unknown error"
    }
    
    return NextResponse.json({
      success: true,
      brandSlug,
      countryCode,
      gender,
      results
    })
    
  } catch (error) {
    console.error("Brand page test error:", error)
    return NextResponse.json({ 
      success: false,
      error: "Brand page test failed",
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
