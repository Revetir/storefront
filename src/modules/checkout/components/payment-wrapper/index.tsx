"use client"

import { loadStripe } from "@stripe/stripe-js"
import React from "react"
import StripeWrapper from "./stripe-wrapper"
import { HttpTypes } from "@medusajs/types"
import { isStripe } from "@lib/constants"

type PaymentWrapperProps = {
  cart: HttpTypes.StoreCart
  children: React.ReactNode
}

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_KEY
const stripePromise = stripeKey ? loadStripe(stripeKey) : null

// Add error handling for Stripe loading
if (stripeKey && !stripePromise) {
  console.error("Failed to load Stripe. Check your NEXT_PUBLIC_STRIPE_KEY.")
}

const PaymentWrapper: React.FC<PaymentWrapperProps> = ({ cart, children }) => {
  const paymentSessions = cart.payment_collection?.payment_sessions || []
  const paymentSession =
    paymentSessions.find(
      (s) =>
        isStripe(s.provider_id) &&
        s.status === "pending" &&
        !!s.data?.client_secret
    ) ||
    paymentSessions.find(
      (s) =>
        isStripe(s.provider_id) &&
        s.status !== "canceled" &&
        !!s.data?.client_secret
    )

  if (
    isStripe(paymentSession?.provider_id) &&
    paymentSession &&
    stripePromise
  ) {
    return (
      <StripeWrapper
        paymentSession={paymentSession}
        stripeKey={stripeKey}
        stripePromise={stripePromise}
      >
        {children}
      </StripeWrapper>
    )
  }

  return <div>{children}</div>
}

export default PaymentWrapper
