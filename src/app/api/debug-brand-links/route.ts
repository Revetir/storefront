import { NextRequest, NextResponse } from "next/server"
import { sdk } from "@lib/config"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const brandSlug = searchParams.get('brandSlug') || 'chrome-hearts'
    
    console.log(`=== DEBUG: Testing brand links for ${brandSlug} ===`)
    
    // Test the brand products API
    const response = await sdk.client.fetch(`/store/brands/${brandSlug}/products`, {
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
        sampleProduct: response.products?.[0]?.id
      }
    })
    
  } catch (error) {
    console.error("Brand links debug error:", error)
    return NextResponse.json({ 
      success: false,
      error: "Brand links debug failed",
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
