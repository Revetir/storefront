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
    
    const backendUrl = process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    
    // Test regions endpoint with publishable key
    let regionsResponse = null
    try {
      const regionsRawResponse = await fetch(`${backendUrl}/store/regions`, {
        method: 'GET',
        headers: {
          'x-publishable-api-key': publishableKey!,
          'Content-Type': 'application/json'
        }
      })
      
      if (regionsRawResponse.ok) {
        regionsResponse = await regionsRawResponse.json()
        console.log('✅ Regions endpoint working')
      } else {
        console.error('❌ Regions endpoint failed:', regionsRawResponse.status, regionsRawResponse.statusText)
      }
    } catch (error) {
      console.error('❌ Regions endpoint failed:', error)
    }
    
    // Test products endpoint with publishable key (correct Medusa Store API approach)
    let productsResponse: any = null
    let productsError: any = null
    
    try {
      const productsRawResponse = await fetch(`${backendUrl}/store/products`, {
        method: 'GET',
        headers: {
          'x-publishable-api-key': publishableKey!,
          'Content-Type': 'application/json'
        }
      })
      
      if (productsRawResponse.ok) {
        productsResponse = await productsRawResponse.json()
        console.log('✅ Products endpoint working, found:', productsResponse.count)
      } else {
        console.error('❌ Products endpoint failed:', productsRawResponse.status, productsRawResponse.statusText)
        productsError = `${productsRawResponse.status}: ${productsRawResponse.statusText}`
      }
    } catch (error) {
      console.error('❌ Products endpoint failed:', error)
      productsError = error
    }
    
    return NextResponse.json({
      success: true,
      environment: envCheck,
      regions: regionsResponse ? 'working' : 'failed',
      products: productsResponse ? `working (${productsResponse.count} total)` : 'failed',
      productsError: productsError ? productsError.toString() : null,
      backendUrl: backendUrl,
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
