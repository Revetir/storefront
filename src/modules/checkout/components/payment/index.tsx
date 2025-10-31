"use client"

import { initiatePaymentSession } from "@lib/data/cart"
import { Heading } from "@medusajs/ui"
import ErrorMessage from "@modules/checkout/components/error-message"
import Divider from "@modules/common/components/divider"
import { useContext, useEffect, useState } from "react"
import { CardElement, ExpressCheckoutElement, useElements, useStripe } from "@stripe/react-stripe-js"
import { StripeContext } from "../payment-wrapper/stripe-wrapper"
import CustomPaymentSelector from "./custom-payment-selector"
import { useAvailablePaymentMethods } from "./use-available-payment-methods"
import { PaymentMethodType } from "./payment-methods-config"
import { usePaymentContext } from "./payment-context"

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
  const { setSelectedPaymentMethod } = usePaymentContext()

  const [error, setError] = useState<string | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType | null>(null)

  const stripe = stripeReady ? useStripe() : null
  const elements = stripeReady ? useElements() : null

  const cartTotal = cart?.total || 0
  const currency = cart?.currency_code || 'usd'
  const countryCode = cart?.shipping_address?.country_code || cart?.region?.countries?.[0]?.iso_2

  // Detect available payment methods (filters Apple Pay/Google Pay based on device)
  const { availableMethods, isChecking } = useAvailablePaymentMethods(
    cartTotal,
    currency,
    countryCode
  )

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
      setSelectedPaymentMethod(availableMethods[0].id)
    }
  }, [availableMethods, isChecking, selectedMethod, setSelectedPaymentMethod])

  const handleMethodSelect = (method: PaymentMethodType) => {
    setSelectedMethod(method)
    setSelectedPaymentMethod(method)
    setError(null)
  }

  const handleCardChange = (event: any) => {
    if (event.error) {
      setError(event.error.message)
    } else if (event.complete) {
      setError(null)
    }
  }

  // Calculate installment amount for BNPL services (4 equal payments)
  const calculateInstallment = () => {
    const totalInDollars = cartTotal / 100
    const installmentAmount = (totalInDollars / 4).toFixed(2)
    return installmentAmount
  }

  // Express Checkout Element handles payment confirmation automatically
  // This handler is called when the Express Checkout payment flow completes
  const handleExpressCheckoutConfirm = async (event: any) => {
    // Express Checkout Element manages the entire payment flow internally
    // For wallets (Apple Pay/Google Pay): Shows branded button, collects payment, completes transaction
    // For Klarna: Shows "Continue with Klarna" button, handles redirect, returns user after completion
    // No additional confirmation needed here - Stripe handles everything
    console.log('Express Checkout payment initiated:', event)
  }

  const handleExpressCheckoutReady = (event: any) => {
    // Called when Express Checkout Element is ready
    // Can be used to check which payment methods are available
    console.log('Express Checkout ready:', event)
  }

  const handleExpressCheckoutClick = (event: any) => {
    // Called when user clicks the Express Checkout button
    console.log('Express Checkout clicked:', event)
  }

  const renderPaymentDetails = (method: PaymentMethodType) => {
    const installmentAmount = calculateInstallment()

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

      case 'apple_pay':
        return (
          <div className="mt-4">
            <ExpressCheckoutElement
              options={{
                paymentMethods: {
                  applePay: 'always',
                  googlePay: 'never',
                  link: 'never',
                  paypal: 'never',
                  amazonPay: 'never',
                },
              }}
              onConfirm={handleExpressCheckoutConfirm}
              onReady={handleExpressCheckoutReady}
              onClick={handleExpressCheckoutClick}
            />
          </div>
        )

      case 'google_pay':
        return (
          <div className="mt-4">
            <ExpressCheckoutElement
              options={{
                paymentMethods: {
                  applePay: 'never',
                  googlePay: 'always',
                  link: 'never',
                  paypal: 'never',
                  amazonPay: 'never',
                },
              }}
              onConfirm={handleExpressCheckoutConfirm}
              onReady={handleExpressCheckoutReady}
              onClick={handleExpressCheckoutClick}
            />
          </div>
        )

      case 'afterpay_clearpay':
        return (
          <div className="space-y-2">
            <p className="text-sm text-gray-700">
              Pay in <span className="font-semibold">4 interest-free payments of ${installmentAmount}</span>.{' '}
              <a
                href="https://www.afterpay.com/how-it-works"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Learn more
              </a>
            </p>
            <p className="text-xs text-gray-500">
              You will be redirected to complete your payment.
            </p>
            <p className="text-xs text-gray-500 italic mt-2">
              Note: Afterpay integration coming soon. Use card payment for now.
            </p>
          </div>
        )

      case 'klarna':
        return (
          <div className="space-y-3">
            <p className="text-sm text-gray-700">
              Pay now, in <span className="font-semibold">4 interest-free payments of ${installmentAmount}</span>, or over 3–12 months.{' '}
              <a
                href="https://www.klarna.com/us/customer-service/what-is-klarna/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Learn more
              </a>
            </p>
            <ExpressCheckoutElement
              options={{
                paymentMethods: {
                  applePay: 'never',
                  googlePay: 'never',
                  link: 'never',
                  paypal: 'never',
                  amazonPay: 'never',
                  // Klarna will show if available in Express Checkout
                },
              }}
              onConfirm={handleExpressCheckoutConfirm}
              onReady={handleExpressCheckoutReady}
              onClick={handleExpressCheckoutClick}
            />
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