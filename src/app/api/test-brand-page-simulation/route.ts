import { NextRequest, NextResponse } from "next/server"
import { getBrandBySlug } from "@lib/data/brands"
import { getRegion } from "@lib/data/regions"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const brandSlug = searchParams.get('brandSlug') || 'chrome-hearts'
    const countryCode = searchParams.get('countryCode') || 'us'
    
    console.log(`Simulating brand page data fetching for: ${brandSlug}`)
    
    // Simulate the exact same calls that the brand page makes
    const results: any = {}
    
    // Step 1: Get region (this is called first in the brand page)
    try {
      console.log("Step 1: Getting region...")
      const region = await getRegion(countryCode)
      results.region = region ? { id: region.id, name: region.name } : null
      console.log("Step 1: Region fetched successfully")
    } catch (error) {
      console.error("Step 1: Region fetch failed:", error)
      results.regionError = error instanceof Error ? error.message : "Unknown error"
    }
    
    // Step 2: Get brand (this is called second in the brand page)
    try {
      console.log("Step 2: Getting brand...")
      const brand = await getBrandBySlug(brandSlug)
      results.brand = brand
      console.log("Step 2: Brand fetched successfully")
    } catch (error) {
      console.error("Step 2: Brand fetch failed:", error)
      results.brandError = error instanceof Error ? error.message : "Unknown error"
    }
    
    return NextResponse.json({
      success: true,
      brandSlug,
      countryCode,
      results
    })
    
  } catch (error) {
    console.error("Brand page simulation error:", error)
    return NextResponse.json({ 
      success: false,
      error: "Brand page simulation failed",
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
