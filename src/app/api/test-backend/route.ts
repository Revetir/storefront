import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const backendUrl = process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

    // Test 1: Basic connectivity to backend
    let connectivityTest = null
    try {
      const healthResponse = await fetch(`${backendUrl}/health`, { method: 'GET' })
      connectivityTest = {
        status: healthResponse.status,
        ok: healthResponse.ok,
        url: `${backendUrl}/health`
      }
    } catch (error) {
      connectivityTest = { error: error instanceof Error ? error.message : 'Unknown error', url: `${backendUrl}/health` }
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
    } catch (error) {
      regionsNoAuth = { error: error instanceof Error ? error.message : 'Unknown error' }
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
    } catch (error) {
      productsNoAuth = { error: error instanceof Error ? error.message : 'Unknown error' }
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
    } catch (error) {
      productsWithAuth = { error: error instanceof Error ? error.message : 'Unknown error' }
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
    } catch (error) {
      adminProducts = { error: error instanceof Error ? error.message : 'Unknown error' }
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
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
