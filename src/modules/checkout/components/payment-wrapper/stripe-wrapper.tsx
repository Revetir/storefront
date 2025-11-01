"use client"

import { Stripe, StripeElementsOptions } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import { HttpTypes } from "@medusajs/types"
import { createContext } from "react"

type StripeWrapperProps = {
  paymentSession: HttpTypes.StorePaymentSession
  stripeKey?: string
  stripePromise: Promise<Stripe | null> | null
  cart: HttpTypes.StoreCart
  children: React.ReactNode
}

export const StripeContext = createContext(false)

const StripeWrapper: React.FC<StripeWrapperProps> = ({
  paymentSession,
  stripeKey,
  stripePromise,
  cart,
  children,
}) => {
  // Convert cart total to cents (smallest currency unit) for Stripe
  // Medusa v2 returns amounts as decimal dollars (e.g., 813.75), but Stripe expects cents (e.g., 81375)
  const cartTotal = Math.round((cart?.total || 0) * 100)

  const options: StripeElementsOptions = {
    mode: 'payment',
    amount: cartTotal,
    currency: 'usd',
    // Note: When using ExpressCheckoutElement, mode/amount/currency are required
    // When using clientSecret with regular payments, these are optional
    // We include both to support all payment methods
  }

  if (!stripeKey) {
    throw new Error(
      "Stripe key is missing. Set NEXT_PUBLIC_STRIPE_KEY environment variable."
    )
  }

  if (!stripePromise) {
    throw new Error(
      "Stripe promise is missing. Make sure you have provided a valid Stripe key."
    )
  }

  if (!paymentSession?.data?.client_secret) {
    throw new Error(
      "Stripe client secret is missing. Cannot initialize Stripe."
    )
  }

  return (
    <StripeContext.Provider value={true}>
      <Elements options={options} stripe={stripePromise}>
        {children}
      </Elements>
    </StripeContext.Provider>
  )
}

export default StripeWrapper
