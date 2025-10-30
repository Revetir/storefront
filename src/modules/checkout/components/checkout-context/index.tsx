"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"

interface CheckoutContextType {
  localAddressComplete: boolean
  setLocalAddressComplete: (isComplete: boolean) => void
  isCalculatingTax: boolean
  setIsCalculatingTax: (isCalculating: boolean) => void
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined)

const STORAGE_KEY = "checkout_calculating_tax"
const TAX_SNAPSHOT_KEY = "checkout_tax_snapshot"

export const CheckoutProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize isCalculatingTax from sessionStorage to persist across redirects
  const [isCalculatingTax, setIsCalculatingTax] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem(STORAGE_KEY)
      if (stored) {
        const { isCalculating, timestamp } = JSON.parse(stored)
        // Clear if older than 10 seconds (tax calculation should complete by then)
        if (Date.now() - timestamp < 10000) {
          console.log("CheckoutProvider - restoring calculating state from storage")
          return isCalculating
        }
        sessionStorage.removeItem(STORAGE_KEY)
        sessionStorage.removeItem(TAX_SNAPSHOT_KEY)
      }
    }
    return false
  })

  const [localAddressComplete, setLocalAddressComplete] = useState(false)

  // Persist isCalculatingTax to sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (isCalculatingTax) {
        sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ isCalculating: true, timestamp: Date.now() })
        )
      } else {
        // When calculation completes, we can clear the form data snapshot too
        // This allows fresh cart data to sync on the next page load
        sessionStorage.removeItem(STORAGE_KEY)
        sessionStorage.removeItem(TAX_SNAPSHOT_KEY)
        // Note: We keep checkout_address_form_data and checkout_user_edited_address
        // because user might change address again, and we want to preserve their edits
      }
    }
  }, [isCalculatingTax])

  const value = {
    localAddressComplete,
    setLocalAddressComplete: useCallback((isComplete: boolean) => {
      setLocalAddressComplete(isComplete)
    }, []),
    isCalculatingTax,
    setIsCalculatingTax: useCallback((isCalculating: boolean) => {
      setIsCalculatingTax(isCalculating)
    }, []),
  }

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  )
}

export const useCheckoutContext = () => {
  const context = useContext(CheckoutContext)
  if (!context) {
    throw new Error("useCheckoutContext must be used within CheckoutProvider")
  }
  return context
}
