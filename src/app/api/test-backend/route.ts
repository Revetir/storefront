import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🔍 Comprehensive backend diagnostic...')
    
    const backendUrl = process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    
    console.log('🔧 Environment check:', {
      MEDUSA_BACKEND_URL: process.env.MEDUSA_BACKEND_URL ? 'SET' : 'MISSING',
      NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ? 'SET' : 'MISSING',
      backendUrl,
      publishableKeyLength: publishableKey ? publishableKey.length : 0
    })
    
    // Test 1: Basic connectivity to backend
    let connectivityTest = null
    try {
      const healthResponse = await fetch(`${backendUrl}/health`, { method: 'GET' })
      connectivityTest = {
        status: healthResponse.status,
        ok: healthResponse.ok,
        url: `${backendUrl}/health`
      }
      console.log('✅ Backend connectivity:', connectivityTest)
    } catch (error) {
      connectivityTest = { error: error instanceof Error ? error.message : 'Unknown error', url: `${backendUrl}/health` }
      console.error('❌ Backend connectivity failed:', error)
    }
    
    // Test 2: Regions endpoint without auth (should work)
    let regionsNoAuth = null
    try {
      const regionsResponse = await fetch(`${backendUrl}/store/regions`, { method: 'GET' })
      regionsNoAuth = {
        status: regionsResponse.status,
        ok: regionsResponse.ok,
        data: regionsResponse.ok ? await regionsResponse.json() : null
      }
      console.log('✅ Regions (no auth):', regionsNoAuth.status)
    } catch (error) {
      regionsNoAuth = { error: error instanceof Error ? error.message : 'Unknown error' }
      console.error('❌ Regions (no auth) failed:', error)
    }
    
    // Test 3: Products endpoint without auth (should fail with 401)
    let productsNoAuth = null
    try {
      const productsResponse = await fetch(`${backendUrl}/store/products`, { method: 'GET' })
      productsNoAuth = {
        status: productsResponse.status,
        ok: productsResponse.ok,
        data: productsResponse.ok ? await productsResponse.json() : null
      }
      console.log('📊 Products (no auth):', productsNoAuth.status)
    } catch (error) {
      productsNoAuth = { error: error instanceof Error ? error.message : 'Unknown error' }
      console.error('❌ Products (no auth) failed:', error)
    }
    
    // Test 4: Products endpoint with auth
    let productsWithAuth = null
    try {
      const productsAuthResponse = await fetch(`${backendUrl}/store/products`, {
        method: 'GET',
        headers: {
          'x-publishable-api-key': publishableKey!,
          'Content-Type': 'application/json'
        }
      })
      
      productsWithAuth = {
        status: productsAuthResponse.status,
        ok: productsAuthResponse.ok,
        data: productsAuthResponse.ok ? await productsAuthResponse.json() : null,
        error: !productsAuthResponse.ok ? await productsAuthResponse.text() : null
      }
      console.log('📊 Products (with auth):', productsWithAuth.status)
    } catch (error) {
      productsWithAuth = { error: error instanceof Error ? error.message : 'Unknown error' }
      console.error('❌ Products (with auth) failed:', error)
    }
    
    // Test 5: Admin products endpoint (if accessible)
    let adminProducts = null
    try {
      const adminResponse = await fetch(`${backendUrl}/admin/products`, { method: 'GET' })
      adminProducts = {
        status: adminResponse.status,
        ok: adminResponse.ok,
        data: adminResponse.ok ? await adminResponse.json() : null
      }
      console.log('📊 Admin products:', adminProducts.status)
    } catch (error) {
      adminProducts = { error: error instanceof Error ? error.message : 'Unknown error' }
      console.error('❌ Admin products failed:', error)
    }
    
    // Analysis
    let diagnosis = 'unknown'
    let recommendation = 'unknown'
    
    if (productsWithAuth.ok && productsWithAuth.data) {
      diagnosis = 'working'
      recommendation = 'use publishable key authentication'
    } else if (productsWithAuth.status === 401) {
      diagnosis = 'authentication_required'
      recommendation = 'check publishable key validity'
    } else if (productsWithAuth.status === 403) {
      diagnosis = 'forbidden'
      recommendation = 'check publishable key permissions'
    } else if (productsWithAuth.status === 404) {
      diagnosis = 'endpoint_not_found'
      recommendation = 'check backend configuration'
    } else if (productsWithAuth.status === 200 && productsWithAuth.data && productsWithAuth.data.count === 0) {
      diagnosis = 'no_products'
      recommendation = 'create products in your backend'
    } else {
      diagnosis = 'other_error'
      recommendation = `check backend logs (status: ${productsWithAuth.status})`
    }
    
    return NextResponse.json({
      success: true,
      diagnosis,
      recommendation,
      tests: {
        connectivity: connectivityTest,
        regionsNoAuth,
        productsNoAuth,
        productsWithAuth,
        adminProducts
      },
      environment: {
        backendUrl,
        publishableKeySet: !!publishableKey,
        publishableKeyLength: publishableKey ? publishableKey.length : 0
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Diagnostic failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
