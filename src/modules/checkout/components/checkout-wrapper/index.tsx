"use client"

import { CheckoutProvider } from "../checkout-context"

export default function CheckoutWrapper({ children }: { children: React.ReactNode }) {
  return <CheckoutProvider>{children}</CheckoutProvider>
}
