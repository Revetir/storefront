"use client"

import { useState, useEffect } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function PromotionsPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check authentication status using our API endpoint
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          credentials: 'include'
        })
        const data = await response.json()
        setIsLoggedIn(data.isAuthenticated)
      } catch (error) {
        setIsLoggedIn(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthStatus()
  }, [])
  return (
    <div className="content-container py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Promotions</h1>
        
        <p className="text-gray-600 mb-8">
          REVETIR occasionally offers promotional codes to loyal customers, with account holders gaining access to exclusive member-only promotions.
        </p>

        <p className="text-gray-600 mb-8">
          Sign up for our newsletter or check back here often to find out about the latest promotions and sales.
        </p>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Active Promotions</h2>
          <div className="flex">
            <div className="border border-gray-200 p-6 max-w-md">
              <h3 className="font-semibold text-lg mb-2">GRAND OPENING SALE</h3>
              <p className="text-gray-600 mb-3">Up to 80% off</p>
              <p className="text-sm text-gray-500">No code required</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Member-Only Promotions</h2>
          {isLoading ? (
            <div className="flex justify-center">
              <div className="border border-gray-200 p-6 max-w-md">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 mb-2"></div>
                  <div className="h-3 bg-gray-200 mb-1"></div>
                  <div className="h-3 bg-gray-200 w-2/3"></div>
                </div>
              </div>
            </div>
          ) : isLoggedIn ? (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="border border-gray-200 p-6">
                <h3 className="font-semibold text-lg mb-2">LOUISXIV</h3>
                <p className="text-gray-600 mb-3">14% off all Louis Vuitton products</p>
                <p className="text-sm text-gray-500">Valid for account holders</p>
              </div>
              <div className="border border-gray-200 p-6">
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="grid gap-6 md:grid-cols-2 blur-sm pointer-events-none">
                <div className="border border-gray-200 p-6">
                  <h3 className="font-semibold text-lg mb-2">MEMBER10</h3>
                  <p className="text-gray-600 mb-3">10% off for members</p>
                  <p className="text-sm text-gray-500">Valid for account holders</p>
                </div>
                <div className="border border-gray-200 p-6">
                  <h3 className="font-semibold text-lg mb-2">VIPSHIP</h3>
                  <p className="text-gray-600 mb-3">Free expedited shipping</p>
                  <p className="text-sm text-gray-500">Members only</p>
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/90 border border-black backdrop-blur-sm p-8 text-center max-w-md">
                  <h3 className="text-lg font-semibold mb-4">Member-Only Access</h3>
                  <p className="text-gray-600 mb-6">
                    Log in or create an account to view exclusive member promotions
                  </p>
                  <LocalizedClientLink
                    href="/account"
                    className="inline-block bg-black text-white px-6 py-3 btn-black"
                  >
                    Unlock
                  </LocalizedClientLink>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="mb-8 mt-16">
          <h2 className="text-lg font-semibold mb-4">How to Use Promotional Codes</h2>
          <ol className="list-decimal list-inside text-gray-600">
            <li>Add items to your cart</li>
            <li>Proceed to checkout</li>
            <li>Enter your promotional code in the "Promo Code" field</li>
            <li>Click "Apply" to see your discount</li>
            <li>Complete your purchase</li>
          </ol>
        </div>
        
        <div className="mb-8">
          <h2 className="text-base font-semibold mb-4">General Terms and Conditions applicable to promotional codes offered by REVETIR</h2>
          <p className="text-gray-600 italic">
            Promotional codes are applicable on full price items only and cannot be applied to items which are already discounted. Discounts are applied before tax and shipping. Discounted items returned to REVETIR will be refunded in the amount paid and not the original value of the item(s). REVETIR reserves the right to modify or discontinue promotions at any time. Orders placed using inapplicable, invalid, or expired coupons due to technical or telecommunications problems will be canceled at REVETIR's sole discretion.
          </p>
        </div>
        
      </div>
    </div>
  )
} 
