"use client"

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
  // Note: Afterpay is handled via redirect in PaymentButton, not ExpressCheckoutElement
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

    // For Klarna and other redirect-based payments, we need to confirm the payment
    // which will trigger the redirect to Klarna's authentication page
    if (event.expressPaymentType === 'klarna') {
      console.log('Klarna payment flow - confirming payment intent')

      if (!stripe || !elements) {
        setErrorMessage('Stripe is not initialized')
        return
      }

      const submitResult = await elements.submit()
      if (submitResult?.error) {
        setErrorMessage(submitResult.error.message || 'Failed to submit payment')
        return
      }

      // Get the client secret from the cart's payment session
      const paymentSession = cart.payment_collection?.payment_sessions?.find(
        (session: any) => session.provider_id === "pp_stripe_stripe"
      )
      const clientSecret = paymentSession?.data?.client_secret as string

      if (!clientSecret) {
        setErrorMessage('Payment session not found')
        return
      }

      // Confirm the Klarna payment - this will redirect to Klarna
      const { error } = await stripe.confirmPayment({
        elements: elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}${window.location.pathname}`,
        },
      })

      if (error) {
        setErrorMessage(error.message || 'Payment failed')
        console.error('Klarna payment error:', error)
      }
      // If successful, user will be redirected to Klarna and back
      return
    }

    // For wallets (Apple Pay/Google Pay), payment is already confirmed
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
            klarna: 'never' as const,
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
            klarna: 'never' as const,
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
            klarna: 'auto' as const,
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
            klarna: 'never' as const,
          },
        }
    }
  }

  return (
    <>
      {isExpressCheckoutMethod ? (
        <div className="w-full">
          {stripe && elements ? (
            <ExpressCheckoutElement
              key={selectedPaymentMethod}
              options={getExpressCheckoutOptions()}
              onConfirm={handleExpressCheckoutConfirm}
              onReady={handleExpressCheckoutReady}
              onClick={handleExpressCheckoutClick}
            />
          ) : (
            <div className="py-4 text-sm text-gray-500">
              Initializing payment method...
            </div>
          )}
          <ErrorMessage
            error={errorMessage}
            data-testid="express-checkout-error-message"
          />
        </div>
      ) : (
        <PaymentButton cart={cart} data-testid="submit-order-button" />
      )}
    </>
  )
}

export default Review
