"use client"

import React, { createContext, useContext, useState, useCallback } from "react"

interface CheckoutContextType {
  localAddressComplete: boolean
  setLocalAddressComplete: (isComplete: boolean) => void
  isCalculatingTax: boolean
  setIsCalculatingTax: (isCalculating: boolean) => void
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined)

export const CheckoutProvider = ({ children }: { children: React.ReactNode }) => {
  const [localAddressComplete, setLocalAddressComplete] = useState(false)
  const [isCalculatingTax, setIsCalculatingTax] = useState(false)

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
