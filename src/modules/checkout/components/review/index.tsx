"use client"

import { ExpressCheckoutElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { placeOrder } from "@lib/data/cart"
import { useState, useContext } from "react"

import PaymentButton from "../payment-button"
import { usePaymentContext } from "../payment/payment-context"
import ErrorMessage from "../error-message"
import { StripeContext } from "../payment-wrapper/stripe-wrapper"

// Inner component that safely uses Stripe hooks - only rendered when inside Elements context
const StripeReviewContent = ({ cart }: { cart: any }) => {
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

    if (!stripe || !elements) {
      setErrorMessage('Stripe is not initialized')
      return
    }

    // CRITICAL: Submit elements for validation before confirming payment
    // This ensures all payment data is validated client-side first
    const submitResult = await elements.submit()
    if (submitResult?.error) {
      setErrorMessage(submitResult.error.message || 'Failed to submit payment')
      console.error('Elements submit error:', submitResult.error)
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

    // Confirm the payment with proper return URL
    // The clientSecret links this to the PaymentIntent already created on our backend
    // Elements was initialized with the clientSecret, so it knows the payment details
    const { error } = await stripe.confirmPayment({
      elements: elements,
      clientSecret: clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}${window.location.pathname}`,
      },
      redirect: 'if_required', // Only redirect if 3DS or similar authentication is needed
    })

    if (error) {
      setErrorMessage(error.message || 'Payment failed')
      console.error('Express Checkout payment error:', error)
      return
    }

    // If payment succeeded without redirect, place the order
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

    // CRITICAL: Must call event.resolve() for payment sheet to open
    // This configures what data the Express Checkout element will collect
    const options = {
      emailRequired: true, // Collect email (cart already has it, but wallets need confirmation)
      phoneNumberRequired: false, // Optional - set to true if you want to collect phone
      shippingAddressRequired: true, // Required since we have physical products
      allowedShippingCountries: ['US'], // Limit to US for now
      shippingRates: cart.shipping_methods?.map((method: any) => ({
        id: method.shipping_option_id || method.id,
        displayName: method.name || 'Standard Shipping',
        amount: Math.round((method.amount || 0) * 100), // Convert to cents
        deliveryEstimate: {
          minimum: { unit: 'day', value: 3 },
          maximum: { unit: 'day', value: 7 }
        }
      })) || [
        {
          id: 'standard',
          displayName: 'Standard Shipping',
          amount: 0,
          deliveryEstimate: {
            minimum: { unit: 'day', value: 3 },
            maximum: { unit: 'day', value: 7 }
          }
        }
      ]
    }

    // Resolve the click event with our options - this opens the payment sheet
    event.resolve(options)
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

// Outer component that checks if we're in Stripe context
const Review = ({ cart }: { cart: any }) => {
  const stripeReady = useContext(StripeContext)
  const { selectedPaymentMethod } = usePaymentContext()

  // Express Checkout methods require Stripe context
  const isExpressCheckoutMethod =
    selectedPaymentMethod === 'apple_pay' ||
    selectedPaymentMethod === 'google_pay' ||
    selectedPaymentMethod === 'klarna'

  // Only render Stripe-specific content if we're inside Stripe Elements context
  if (stripeReady && isExpressCheckoutMethod) {
    return <StripeReviewContent cart={cart} />
  }

  // For non-express checkout methods (card, afterpay), use PaymentButton
  return <PaymentButton cart={cart} data-testid="submit-order-button" />
}

export default Review
