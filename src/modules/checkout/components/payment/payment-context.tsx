"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { PaymentMethodType } from "./payment-methods-config"

export type CheckoutPaymentMethod =
  | PaymentMethodType
  | "paypal_wallet"
  | "paypal_apple_pay"
  | "paypal_card"
  | "square_card"
  | "square_apple_pay"
  | "square_google_pay"

interface PaymentContextType {
  selectedPaymentMethod: CheckoutPaymentMethod | null
  setSelectedPaymentMethod: (method: CheckoutPaymentMethod | null) => void
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined)

export const PaymentProvider = ({ children }: { children: ReactNode }) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<CheckoutPaymentMethod | null>(null)

  return (
    <PaymentContext.Provider value={{ selectedPaymentMethod, setSelectedPaymentMethod }}>
      {children}
    </PaymentContext.Provider>
  )
}

export const usePaymentContext = () => {
  const context = useContext(PaymentContext)
  if (context === undefined) {
    throw new Error("usePaymentContext must be used within a PaymentProvider")
  }
  return context
}
