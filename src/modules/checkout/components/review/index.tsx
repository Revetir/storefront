"use client"

import { Heading, Text } from "@medusajs/ui"
import { ExpressCheckoutElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { placeOrder } from "@lib/data/cart"
import { useState } from "react"

import PaymentButton from "../payment-button"
import { usePaymentContext } from "../payment/payment-context"
import ErrorMessage from "../error-message"

const Review = ({ cart }: { cart: any }) => {
  const { selectedPaymentMethod } = usePaymentContext()
  const stripe = useStripe()
  const elements = useElements()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Express Checkout methods handle payment with their own buttons
  // No need to show the traditional "Place Order" button for these
  const isExpressCheckoutMethod =
    selectedPaymentMethod === 'apple_pay' ||
    selectedPaymentMethod === 'google_pay' ||
    selectedPaymentMethod === 'klarna'

  // Express Checkout Element handlers
  const handleExpressCheckoutConfirm = async (event: any) => {
    // Express Checkout Element manages the entire payment flow internally
    // For wallets (Apple Pay/Google Pay): Shows branded button, collects payment, completes transaction
    // For Klarna: Shows "Continue with Klarna" button, handles redirect, returns user after completion
    console.log('Express Checkout payment initiated:', event)

    // After successful payment, place the order
    try {
      await placeOrder()
    } catch (err: any) {
      setErrorMessage(err.message)
      console.error('Failed to place order:', err)
    }
  }

  const handleExpressCheckoutReady = (event: any) => {
    console.log('Express Checkout ready:', event)
    setErrorMessage(null)
  }

  const handleExpressCheckoutClick = (event: any) => {
    console.log('Express Checkout clicked:', event)
  }

  // Determine which payment method to show in ExpressCheckoutElement
  const getExpressCheckoutOptions = () => {
    switch (selectedPaymentMethod) {
      case 'apple_pay':
        return {
          paymentMethods: {
            applePay: 'always' as const,
            googlePay: 'never' as const,
            link: 'never' as const,
            paypal: 'never' as const,
            amazonPay: 'never' as const,
          },
        }
      case 'google_pay':
        return {
          paymentMethods: {
            applePay: 'never' as const,
            googlePay: 'always' as const,
            link: 'never' as const,
            paypal: 'never' as const,
            amazonPay: 'never' as const,
          },
        }
      case 'klarna':
        return {
          paymentMethods: {
            applePay: 'never' as const,
            googlePay: 'never' as const,
            link: 'never' as const,
            paypal: 'never' as const,
            amazonPay: 'never' as const,
            // Klarna will show if available in Express Checkout
          },
        }
      default:
        return {
          paymentMethods: {
            applePay: 'never' as const,
            googlePay: 'never' as const,
            link: 'never' as const,
            paypal: 'never' as const,
            amazonPay: 'never' as const,
          },
        }
    }
  }

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className="flex flex-row text-xl gap-x-2 items-baseline uppercase"
        >
          Review
        </Heading>
      </div>
      <div className="flex items-start gap-x-1 w-full mb-6">
        <div className="w-full">
          <Text className="txt-medium-plus text-ui-fg-base mb-1">
            {isExpressCheckoutMethod
              ? "By clicking the payment button below, you acknowledge that you have understood and accepted our Terms of Sale."
              : "By clicking Place Order, you acknowledge that you have understood and accepted our Terms of Sale."
            }
          </Text>
        </div>
      </div>
      {isExpressCheckoutMethod ? (
        <div className="w-full">
          {stripe && elements && (
            <ExpressCheckoutElement
              options={getExpressCheckoutOptions()}
              onConfirm={handleExpressCheckoutConfirm}
              onReady={handleExpressCheckoutReady}
              onClick={handleExpressCheckoutClick}
            />
          )}
          <ErrorMessage
            error={errorMessage}
            data-testid="express-checkout-error-message"
          />
        </div>
      ) : (
        <PaymentButton cart={cart} data-testid="submit-order-button" />
      )}
    </div>
  )
}

export default Review
