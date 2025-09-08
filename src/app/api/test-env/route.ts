import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const envCheck = {
      MEDUSA_BACKEND_URL: process.env.MEDUSA_BACKEND_URL ? "SET" : "MISSING",
      NEXT_PUBLIC_MEDUSA_BACKEND_URL: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ? "SET" : "MISSING",
      NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ? "SET" : "MISSING",
      NODE_ENV: process.env.NODE_ENV,
    }
    
    // Get the actual values (but mask sensitive data)
    const actualValues = {
      MEDUSA_BACKEND_URL: process.env.MEDUSA_BACKEND_URL || "NOT_SET",
      NEXT_PUBLIC_MEDUSA_BACKEND_URL: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "NOT_SET",
      NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ? 
        `${process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY.substring(0, 10)}...` : "NOT_SET",
      NODE_ENV: process.env.NODE_ENV,
    }
    
    return NextResponse.json({
      success: true,
      envCheck,
      actualValues
    })
    
  } catch (error) {
    console.error("Environment test error:", error)
    return NextResponse.json({ 
      success: false,
      error: "Environment test failed",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
