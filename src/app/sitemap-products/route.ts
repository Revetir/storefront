import { NextResponse } from 'next/server'

export async function GET() {
  return new NextResponse('Root sitemap-products route working!', {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
