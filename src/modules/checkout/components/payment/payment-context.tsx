"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { PaymentMethodType } from "./payment-methods-config"

interface PaymentContextType {
  selectedPaymentMethod: PaymentMethodType | null
  setSelectedPaymentMethod: (method: PaymentMethodType | null) => void
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined)

export const PaymentProvider = ({ children }: { children: ReactNode }) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType | null>(null)

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
