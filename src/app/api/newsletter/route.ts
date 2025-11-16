import { NextRequest, NextResponse } from "next/server"
import { sdk } from "@/lib/config"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, gender_preference } = body

    // Validate required fields
    if (!email || !gender_preference) {
      return NextResponse.json(
        { error: "Email and gender preference are required" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Validate gender preference
    if (!["menswear", "womenswear"].includes(gender_preference)) {
      return NextResponse.json(
        { error: "Invalid gender preference" },
        { status: 400 }
      )
    }

    // Proxy to Medusa backend
    try {
      const data = await sdk.client.fetch(`/store/newsletter`, {
        method: "POST",
        body: {
          email,
          gender_preference,
        },
      })

      return NextResponse.json(data, { status: 200 })
    } catch (err: any) {
      console.error("Failed to proxy newsletter subscription:", err)
      // SDK throws FetchError with status property for HTTP errors
      const status = err?.status || 500
      return NextResponse.json(
        { error: err?.message || "Failed to subscribe. Please try again." },
        { status }
      )
    }
  } catch (error) {
    console.error("Newsletter subscription error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
