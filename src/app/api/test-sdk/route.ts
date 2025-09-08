import { NextRequest, NextResponse } from "next/server"
import { sdk } from "@lib/config"

export async function GET(request: NextRequest) {
  try {
    console.log("Testing SDK configuration...")
    
    // Test basic SDK connectivity
    const { searchParams } = new URL(request.url)
    const testSlug = searchParams.get('slug') || 'chrome-hearts'
    
    console.log(`Testing brand fetch for slug: ${testSlug}`)
    
    // Test the exact same call that the frontend makes
    const { brand } = await sdk.client.fetch<{
      brand: any
    }>(`/store/brands/${testSlug}`, {
      cache: "force-cache",
    })
    
    return NextResponse.json({
      success: true,
      brand: brand,
      sdkConfig: {
        baseUrl: sdk.client.baseUrl,
        hasPublishableKey: !!sdk.client.publishableKey
      }
    })
    
  } catch (error) {
    console.error("SDK test error:", error)
    return NextResponse.json({ 
      success: false,
      error: "SDK test failed",
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      sdkConfig: {
        baseUrl: sdk.client.baseUrl,
        hasPublishableKey: !!sdk.client.publishableKey
      }
    }, { status: 500 })
  }
}
