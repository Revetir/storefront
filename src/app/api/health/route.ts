import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    deployment: 'latest',
    domain: process.env.VERCEL_URL || 'local',
    customDomain: process.env.NEXT_PUBLIC_SITE_URL || 'https://revetir.com'
  })
}
