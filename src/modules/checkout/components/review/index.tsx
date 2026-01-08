"use client"

import { ExpressCheckoutElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { placeOrder, updateCart } from "@lib/data/cart"
import { useState, useContext } from "react"
import { validateCheckout, triggerFieldErrors, scrollToTop } from "../../utils/validate-checkout"
import { US_STATES } from "../../utils/us-states"

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
    console.log('Express Checkout billingDetails:', event.billingDetails)
    console.log('Express Checkout shippingAddress:', event.shippingAddress)

    if (!stripe || !elements) {
      setErrorMessage('Stripe is not initialized')
      return
    }

    // CRITICAL: Sync billing/shipping details from Express Checkout to Medusa cart
    // The wallet (Google Pay, Apple Pay) collects its own address data which must be
    // synced to the cart BEFORE placing the order, otherwise the order will be missing
    // the customer's name and shipping address.
    try {
      const billingDetails = event.billingDetails
      const shippingAddress = event.shippingAddress

      // Parse the name into first_name and last_name
      const parseName = (name: string | undefined) => {
        if (!name) return { first_name: '', last_name: '' }
        const parts = name.trim().split(/\s+/)
        if (parts.length === 1) {
          return { first_name: parts[0], last_name: '' }
        }
        return {
          first_name: parts[0],
          last_name: parts.slice(1).join(' ')
        }
      }

      const normalizeUSStateCode = (state: string | undefined) => {
        if (!state) return ""
        const trimmed = state.trim()
        if (!trimmed) return ""

        const lower = trimmed.toLowerCase()
        if (lower.startsWith("us-") && lower.length >= 5) {
          const code = lower.slice(3, 5)
          if (/^[a-z]{2}$/.test(code)) return code.toUpperCase()
        }

        if (/^[a-z]{2}$/i.test(trimmed)) return trimmed.toUpperCase()

        const normalizedName = lower.replace(/[^a-z]/g, "")
        const match = US_STATES.find(
          (s) => s.name.toLowerCase().replace(/[^a-z]/g, "") === normalizedName
        )
        return match?.code || ""
      }

      // Map Stripe address format to Medusa format
      const mapStripeAddress = (address: any, name?: string) => {
        if (!address) return null
        const { first_name, last_name } = parseName(name)

        const countryCode = ((address.country || "US") as string).toLowerCase().trim()
        const stateRaw = (address.state as string | undefined) ?? ""
        const stateCode = countryCode === "us"
          ? normalizeUSStateCode(stateRaw).toLowerCase()
          : stateRaw.trim().toLowerCase()

        const province = stateCode ? `${countryCode}-${stateCode}` : ""

        return {
          first_name,
          last_name,
          address_1: address.line1 || '',
          address_2: address.line2 || '',
          city: address.city || '',
          province,
          postal_code: address.postal_code || '',
          country_code: countryCode,
          phone: billingDetails?.phone || '',
        }
      }

      const cartUpdateData: any = {}

      // Sync shipping address from Express Checkout
      if (shippingAddress) {
        cartUpdateData.shipping_address = mapStripeAddress(
          shippingAddress.address,
          shippingAddress.name
        )
      }

      // Sync billing address from Express Checkout
      if (billingDetails?.address) {
        cartUpdateData.billing_address = mapStripeAddress(
          billingDetails.address,
          billingDetails.name
        )
      } else if (shippingAddress) {
        // Fallback: use shipping address as billing if no billing provided
        cartUpdateData.billing_address = mapStripeAddress(
          shippingAddress.address,
          shippingAddress.name
        )
      }

      // Sync email if provided
      if (billingDetails?.email) {
        cartUpdateData.email = billingDetails.email
      }

      // Update the cart with the Express Checkout data
      if (Object.keys(cartUpdateData).length > 0) {
        console.log('Syncing Express Checkout data to cart:', cartUpdateData)
        await updateCart(cartUpdateData)
      }
    } catch (syncError: any) {
      console.error('Failed to sync Express Checkout data to cart:', syncError)
      setErrorMessage('Failed to save shipping information. Please try again.')
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
