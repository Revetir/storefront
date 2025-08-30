import { NextResponse } from 'next/server'
import { sdk } from '@lib/config'

export async function GET() {
  try {
    console.log('🧪 Testing backend connection...')
    
    // Test environment variables
    const envCheck = {
      MEDUSA_BACKEND_URL: process.env.MEDUSA_BACKEND_URL ? 'SET' : 'MISSING',
      NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ? 'SET' : 'MISSING',
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'using default'
    }
    
    console.log('🔧 Environment check:', envCheck)
    
    // Test regions endpoint
    let regionsResponse = null
    try {
      regionsResponse = await sdk.client.fetch('/store/regions')
      console.log('✅ Regions endpoint working')
    } catch (error) {
      console.error('❌ Regions endpoint failed:', error)
    }
    
    // Test products endpoint
    let productsResponse = null
    try {
      productsResponse = await sdk.client.fetch('/store/products', {
        query: { limit: 5, status: 'published' }
      })
      console.log('✅ Products endpoint working, found:', productsResponse.count)
    } catch (error) {
      console.error('❌ Products endpoint failed:', error)
    }
    
    return NextResponse.json({
      success: true,
      environment: envCheck,
      regions: regionsResponse ? 'working' : 'failed',
      products: productsResponse ? `working (${productsResponse.count} total)` : 'failed',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
