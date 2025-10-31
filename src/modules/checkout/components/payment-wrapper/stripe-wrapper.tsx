"use client"

import { Stripe, StripeElementsOptions } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import { HttpTypes } from "@medusajs/types"
import { createContext } from "react"

type StripeWrapperProps = {
  paymentSession: HttpTypes.StorePaymentSession
  stripeKey?: string
  stripePromise: Promise<Stripe | null> | null
  children: React.ReactNode
}

export const StripeContext = createContext(false)

const StripeWrapper: React.FC<StripeWrapperProps> = ({
  paymentSession,
  stripeKey,
  stripePromise,
  children,
}) => {
  const options: StripeElementsOptions = {
    clientSecret: paymentSession!.data?.client_secret as string | undefined,
    appearance: {
      theme: 'stripe',
      variables: {
        fontFamily: 'Satoshi, Segoe UI, Roboto, Helvetica Neue, Ubuntu, sans-serif',
        fontSizeBase: '16px',
        colorPrimary: '#000000',
        colorBackground: '#ffffff',
        colorText: '#000000',
        colorDanger: '#dc2626',
        borderRadius: '8px',
        spacingUnit: '4px',
      },
      rules: {
        '.Tab': {
          border: 'none',
          borderRadius: '0',
          padding: '6px 0',
          marginBottom: '0',
          backgroundColor: 'transparent',
          boxShadow: 'none',
          transition: 'none',
        },
        '.Tab:hover': {
          backgroundColor: 'transparent',
          boxShadow: 'none',
        },
        '.Tab--selected': {
          backgroundColor: 'transparent',
          border: 'none',
        },
        '.Tab--selected:hover': {
          backgroundColor: 'transparent',
        },
        '.TabIcon': {
          filter: 'grayscale(100%)',
          opacity: '0.5',
        },
        '.TabIcon--selected': {
          filter: 'grayscale(0%)',
          opacity: '1',
        },
        '.TabLabel': {
          fontWeight: '400',
          fontSize: '16px',
          lineHeight: '24px',
        },
        '.RadioIcon': {
          border: '2px solid #000000',
          borderRadius: '50%',
        },
        '.RadioIconInner': {
          backgroundColor: '#000000',
          borderRadius: '50%',
        },
        '.Input': {
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '16px',
          backgroundColor: '#ffffff',
        },
        '.Input:focus': {
          border: '1px solid #000000',
          boxShadow: '0 0 0 1px #000000',
        },
        '.Label': {
          fontSize: '14px',
          fontWeight: '500',
          marginBottom: '8px',
        },
      },
    },
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
