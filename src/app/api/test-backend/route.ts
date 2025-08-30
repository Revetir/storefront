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
    
    // Test products endpoint with different approaches
    let productsResponse: any = null
    let productsError: any = null
    
    try {
      // Try without any query parameters first
      productsResponse = await sdk.client.fetch('/store/products')
      console.log('✅ Products endpoint working (no params), found:', productsResponse.count)
    } catch (error) {
      productsError = error
      console.error('❌ Products endpoint failed (no params):', error)
      
      // Try with different query structure
      try {
        productsResponse = await sdk.client.fetch('/store/products', {
          method: 'GET',
          query: {
            limit: 5
          }
        })
        console.log('✅ Products endpoint working (with limit), found:', productsResponse.count)
      } catch (error2) {
        console.error('❌ Products endpoint failed (with limit):', error2)
        
        // Try with explicit method
        try {
          productsResponse = await sdk.client.fetch('/store/products', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          })
          console.log('✅ Products endpoint working (explicit method), found:', productsResponse.count)
        } catch (error3) {
          console.error('❌ Products endpoint failed (explicit method):', error3)
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      environment: envCheck,
      regions: regionsResponse ? 'working' : 'failed',
      products: productsResponse ? `working (${productsResponse.count} total)` : 'failed',
      productsError: productsError ? productsError.message : null,
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
