import { NextRequest, NextResponse } from "next/server"
import { getRegion } from "@lib/data/regions"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const countryCode = searchParams.get('countryCode') || 'us'

    const region = await getRegion(countryCode)
    
    return NextResponse.json({
      success: true,
      region: region ? { id: region.id, name: region.name } : null,
      countryCode,
      hasRegion: !!region
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "getRegion function failed",
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
