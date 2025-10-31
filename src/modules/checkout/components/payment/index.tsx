"use client"

import { initiatePaymentSession } from "@lib/data/cart"
import { Heading } from "@medusajs/ui"
import ErrorMessage from "@modules/checkout/components/error-message"
import Divider from "@modules/common/components/divider"
import { useContext, useEffect, useState } from "react"
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js"
import { StripeContext } from "../payment-wrapper/stripe-wrapper"
import CustomPaymentSelector from "./custom-payment-selector"
import { useAvailablePaymentMethods } from "./use-available-payment-methods"
import { PaymentMethodType } from "./payment-methods-config"

const Payment = ({
  cart,
  availablePaymentMethods,
}: {
  cart: any
  availablePaymentMethods: any[]
}) => {
  const activeSession = cart.payment_collection?.payment_sessions?.find(
    (paymentSession: any) => paymentSession.status === "pending"
  )
  const stripeReady = useContext(StripeContext)

  const [error, setError] = useState<string | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType | null>(null)

  const stripe = stripeReady ? useStripe() : null
  const elements = stripeReady ? useElements() : null

  const cartTotal = cart?.total || 0
  const currency = cart?.currency_code || 'usd'

  // Detect available payment methods (filters Apple Pay/Google Pay based on device)
  const { availableMethods, isChecking } = useAvailablePaymentMethods(cartTotal, currency)

  const paidByGiftcard =
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  const initStripe = async () => {
    try {
      await initiatePaymentSession(cart, {
        provider_id: "pp_stripe_stripe",
      })
    } catch (err) {
      console.error("Failed to initialize Stripe session:", err)
      setError("Failed to initialize payment. Please try again.")
    }
  }

  useEffect(() => {
    if (!activeSession && stripeReady) {
      initStripe()
    }
  }, [cart, activeSession, stripeReady])

  // Auto-select first available method
  useEffect(() => {
    if (!selectedMethod && availableMethods.length > 0 && !isChecking) {
      setSelectedMethod(availableMethods[0].id)
    }
  }, [availableMethods, isChecking, selectedMethod])

  const handleMethodSelect = (method: PaymentMethodType) => {
    setSelectedMethod(method)
    setError(null)
  }

  const handleCardChange = (event: any) => {
    if (event.error) {
      setError(event.error.message)
    } else if (event.complete) {
      setError(null)
    }
  }

  const renderPaymentDetails = (method: PaymentMethodType) => {
    switch (method) {
      case 'card':
        return (
          <div className="max-w-md">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    fontFamily: 'Satoshi, Segoe UI, Roboto, Helvetica Neue, Ubuntu, sans-serif',
                    color: '#000000',
                    '::placeholder': {
                      color: '#9CA3AF',
                    },
                  },
                },
                hidePostalCode: false,
              }}
              onChange={handleCardChange}
            />
          </div>
        )

      case 'affirm':
      case 'afterpay_clearpay':
      case 'klarna':
        return (
          <div className="text-sm text-gray-600">
            You will be redirected to complete your payment.
          </div>
        )

      case 'apple_pay':
      case 'google_pay':
        return (
          <div className="text-sm text-gray-600">
            Click "Place Order" to complete payment.
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className="flex flex-row text-xl gap-x-2 items-baseline uppercase"
        >
          Secure Payment
        </Heading>
      </div>
      <div>
        {!paidByGiftcard &&
          availablePaymentMethods?.length &&
          stripeReady &&
          !isChecking && (
            <div className="transition-all duration-150 ease-in-out">
              <CustomPaymentSelector
                availableMethods={availableMethods}
                selectedMethod={selectedMethod}
                onMethodSelect={handleMethodSelect}
                renderPaymentDetails={renderPaymentDetails}
              />
            </div>
          )}

        {isChecking && (
          <div className="py-4 text-sm text-gray-500">
            Loading payment methods...
          </div>
        )}

        <ErrorMessage
          error={error}
          data-testid="payment-method-error-message"
        />
      </div>
      <Divider className="mt-8" />
    </div>
  )
}

export default Payment