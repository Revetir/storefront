import { NextRequest, NextResponse } from "next/server"
import { sdk } from "@/lib/config"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { request: requestType, name, email, orderNumber, subject, message } = body

    // Validate required fields
    if (!requestType || !name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All required fields must be filled" },
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

    // Proxy to Medusa backend to send via Resend provider
    try {
      const resp = await sdk.client.fetch(`/store/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: {
          request: requestType,
          name,
          email,
          orderNumber,
          subject,
          message,
        },
      }) as Response

      // If backend returns an error, bubble it up
      if (!resp.ok) {
        let errText: string | undefined
        try {
          const data = await resp.json()
          errText = (data as any)?.error
        } catch {}
        return NextResponse.json(
          { error: errText || "Failed to send message. Please try again." },
          { status: resp.status }
        )
      }
    } catch (err: any) {
      console.error("Failed to proxy contact message:", err)
      return NextResponse.json(
        { error: err?.message || "Failed to send message. Please try again." },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: "Message sent successfully!" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 