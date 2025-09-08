import { NextRequest, NextResponse } from "next/server"
import { sdk } from "@lib/config"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const brandSlug = searchParams.get('brandSlug') || 'chrome-hearts'
    
    console.log(`Testing brand links for: ${brandSlug}`)
    
    // Test the brand API first
    const brandResponse = await sdk.client.fetch(`/store/brands/${brandSlug}`)
    console.log("Brand response:", brandResponse)
    
    if (!brandResponse.brand) {
      return NextResponse.json({
        success: false,
        error: "Brand not found",
        brandSlug
      })
    }
    
    // Test the brand products API
    const productsResponse = await sdk.client.fetch(`/store/brands/${brandSlug}/products`, {
      query: { limit: 5, offset: 0 }
    })
    
    return NextResponse.json({
      success: true,
      brandSlug,
      brand: brandResponse.brand,
      productsCount: productsResponse.products?.length || 0,
      totalCount: productsResponse.count || 0,
      sampleProducts: productsResponse.products?.slice(0, 2).map(p => ({
        id: p.id,
        title: p.title,
        handle: p.handle
      })) || []
    })
    
  } catch (error) {
    console.error("Brand links test error:", error)
    return NextResponse.json({ 
      success: false,
      error: "Brand links test failed",
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
