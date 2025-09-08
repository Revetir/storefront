import { NextRequest, NextResponse } from "next/server"
import { sdk } from "@lib/config"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const brandSlug = searchParams.get('brandSlug') || 'chrome-hearts'
    
    console.log(`=== Testing Link Service for ${brandSlug} ===`)
    
    // Test the brand products API with the new link service approach
    const response = await sdk.client.fetch<{
      products: any[]
      count: number
      limit: number
      offset: number
      brand: {
        id: string
        name: string
        slug: string
        blurb?: string
      }
      message?: string
    }>(`/store/brands/${brandSlug}/products`, {
      query: {
        limit: 5,
        offset: 0,
        sort: "created_at"
      }
    })
    
    return NextResponse.json({
      success: true,
      brandSlug,
      response,
      productsCount: response.products?.length || 0,
      totalCount: response.count || 0,
      debugInfo: {
        brandFound: !!response.brand,
        brandId: response.brand?.id,
        brandName: response.brand?.name,
        hasProducts: (response.products?.length || 0) > 0,
        sampleProduct: response.products?.[0]?.id,
        message: response.message || "No message"
      }
    })
    
  } catch (error) {
    console.error("Link service test error:", error)
    return NextResponse.json({ 
      success: false,
      error: "Link service test failed",
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
