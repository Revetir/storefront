import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const backendUrl = process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

    if (!backendUrl || !publishableKey) {
      return NextResponse.json({ 
        error: "Missing backend URL or publishable key",
        backendUrl: !!backendUrl,
        publishableKey: !!publishableKey
      }, { status: 500 })
    }

    // Test the specific brand API
    const response = await fetch(`${backendUrl}/store/brands/${slug}`, {
      method: 'GET',
      headers: {
        'x-publishable-api-key': publishableKey,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ 
        error: "Brand API failed",
        status: response.status,
        statusText: response.statusText,
        errorText: errorText
      }, { status: response.status })
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      brand: data.brand,
      fullResponse: data
    })

  } catch (error) {
    return NextResponse.json({ 
      error: "Failed to fetch brand",
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
