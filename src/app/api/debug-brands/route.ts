import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

    if (!backendUrl || !publishableKey) {
      return NextResponse.json({ 
        error: "Missing backend URL or publishable key",
        backendUrl: !!backendUrl,
        publishableKey: !!publishableKey
      }, { status: 500 })
    }

    // Test the brands API
    const response = await fetch(`${backendUrl}/store/brands`, {
      method: 'GET',
      headers: {
        'x-publishable-api-key': publishableKey,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      return NextResponse.json({ 
        error: "Brands API failed",
        status: response.status,
        statusText: response.statusText
      }, { status: response.status })
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      brandsCount: data.brands?.length || 0,
      brands: data.brands?.slice(0, 3) || [], // Show first 3 brands
      fullResponse: data
    })

  } catch (error) {
    return NextResponse.json({ 
      error: "Failed to fetch brands",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
