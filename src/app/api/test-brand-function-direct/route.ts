import { NextRequest, NextResponse } from "next/server"
import { getBrandBySlug } from "@lib/data/brands"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug') || 'chrome-hearts'
    
    console.log(`Testing getBrandBySlug function directly for slug: ${slug}`)
    
    const brand = await getBrandBySlug(slug)
    
    return NextResponse.json({
      success: true,
      brand: brand,
      slug: slug,
      hasBrand: !!brand
    })
    
  } catch (error) {
    console.error("getBrandBySlug direct test error:", error)
    return NextResponse.json({ 
      success: false,
      error: "getBrandBySlug function failed",
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
