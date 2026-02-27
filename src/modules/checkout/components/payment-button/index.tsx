"use client"

import { isManual, isStripe } from "@lib/constants"
import { placeOrder } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import { useElements, useStripe } from "@stripe/react-stripe-js"
import React, { useState, useEffect, useContext } from "react"
import ErrorMessage from "../error-message"
import { useParams } from "next/navigation"
import { validateCheckout, triggerFieldErrors, scrollToTop } from "../../utils/validate-checkout"
import { usePaymentContext } from "../payment/payment-context"
import { PaymentMethodType } from "../payment/payment-methods-config"
import AfterpayButton from "../afterpay-button"
import { StripeContext } from "../payment-wrapper/stripe-wrapper"


type PaymentButtonProps = {
  cart: HttpTypes.StoreCart
  "data-testid": string
}

const isNextRedirectError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") {
    return false
  }

  const redirectError = error as { message?: string; digest?: string }
  return (
    redirectError.message === "NEXT_REDIRECT" ||
    redirectError.digest?.includes("NEXT_REDIRECT") === true
  )
}

/**
 * Get the button text based on the selected payment method
 *
 * Note: This component only handles Card and Afterpay payments.
 * Klarna, Apple Pay, and Google Pay are handled by ExpressCheckoutElement in Review component.
 */
const getButtonText = (paymentMethod: PaymentMethodType | null): string => {
  return paymentMethod === 'afterpay_clearpay' ? 'Pay with Afterpay' : 'Place order'
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  cart,
  "data-testid": dataTestId,
}) => {
  const notReady =
    !cart ||
    !cart.shipping_address ||
    !cart.billing_address ||
    !cart.email ||
    (cart.shipping_methods?.length ?? 0) < 1

  const paymentSessions = cart.payment_collection?.payment_sessions || []
  const paymentSession =
    paymentSessions.find((session) => session.status === "pending") ||
    paymentSessions.find((session) => session.status !== "canceled") ||
    paymentSessions[0]
  const stripeReady = useContext(StripeContext)

  // Avoid rendering any fallback button while the payment session is still loading.
  if (!paymentSession) {
    return null
  }

  switch (true) {
    case isStripe(paymentSession?.provider_id):
      // Only render StripePaymentButton if we're inside Elements context
      if (stripeReady && paymentSession) {
        return (
          <StripePaymentButton
            notReady={notReady}
            cart={cart}
            data-testid={dataTestId}
          />
        )
      }
      // Show loading state while waiting for Stripe to initialize
      return (
        <Button disabled className="uppercase !rounded-none !bg-black !text-white hover:!bg-neutral-900 transition-colors duration-200" data-testid={dataTestId}>
          Loading payment...
        </Button>
      )
    case isManual(paymentSession?.provider_id):
      return (
        <ManualTestPaymentButton notReady={notReady} cart={cart} data-testid={dataTestId} />
      )
    default:
      // Unknown payment providers should simply not render a button instead of flashing the generic CTA.
      return null
  }
}

const StripePaymentButton = ({
  cart,
  notReady,
  "data-testid": dataTestId,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { selectedPaymentMethod } = usePaymentContext()

  const { countryCode } = useParams()
  const paymentSession = cart.payment_collection?.payment_sessions?.find(
    (session) => session.provider_id === "pp_stripe_stripe" && session.status === "pending"
  ) || cart.payment_collection?.payment_sessions?.find(
    (session) =>
      session.provider_id === "pp_stripe_stripe" && session.status !== "canceled"
  )

  const buttonText = getButtonText(selectedPaymentMethod)

  const onPaymentCompleted = async () => {
    try {
      await placeOrder()
      setSubmitting(false)
    } catch (err) {
      if (isNextRedirectError(err)) {
        throw err
      }

      const errorText =
        err instanceof Error ? err.message : "Failed to place order"
      setErrorMessage(errorText)
      setSubmitting(false)
    }
  }

  const stripe = useStripe()
  const elements = useElements()

  const disabled = !stripe || !elements ? true : false

  const handlePayment = async () => {
    if (submitting) {
      return
    }

    // Validate all required checkout fields first
    const validationErrors = validateCheckout(cart)

    if (validationErrors.length > 0) {
      // Scroll to top to show errors
      scrollToTop()

      // Trigger field errors
      triggerFieldErrors(validationErrors)

      return
    }

    if (!stripe || !elements || !cart) {
      return
    }

    setSubmitting(true)

    const clientSecret = paymentSession?.data?.client_secret as string
    if (!clientSecret) {
      setErrorMessage("Payment session not ready. Please refresh and try again.")
      setSubmitting(false)
      return
    }

    /**
     * Payment Method Handling Strategy (Card and Afterpay only):
     *
     * CARD PAYMENTS:
     * - Uses CardElement with stripe.confirmCardPayment()
     * - Collects card details inline on checkout page
     *
     * AFTERPAY/CLEARPAY (BNPL - Redirect-based):
     * - Uses stripe.confirmAfterpayClearpayPayment() with return_url
     * - User is redirected to Afterpay's site to complete payment
     * - After completion, user returns to our return_url
     *
     * Note: Klarna, Apple Pay, and Google Pay are handled by ExpressCheckoutElement
     * in the Review component and never reach this code path.
     */

    // Handle Afterpay payment flow
    if (selectedPaymentMethod === 'afterpay_clearpay') {
      const billingDetails = {
        name: `${cart.billing_address?.first_name} ${cart.billing_address?.last_name}`,
        email: cart.email,
        phone: cart.billing_address?.phone ?? undefined,
        address: {
          line1: cart.billing_address?.address_1 ?? undefined,
          line2: cart.billing_address?.address_2 ?? undefined,
          city: cart.billing_address?.city ?? undefined,
          state: cart.billing_address?.province ?? undefined,
          postal_code: cart.billing_address?.postal_code ?? undefined,
          country: cart.billing_address?.country_code ?? undefined,
        },
      }

      const shippingDetails = {
        name: `${cart.shipping_address?.first_name} ${cart.shipping_address?.last_name}`,
        phone: cart.shipping_address?.phone ?? '',
        address: {
          line1: cart.shipping_address?.address_1 ?? '',
          line2: cart.shipping_address?.address_2 ?? '',
          city: cart.shipping_address?.city ?? '',
          state: cart.shipping_address?.province ?? '',
          postal_code: cart.shipping_address?.postal_code ?? '',
          country: cart.shipping_address?.country_code ?? '',
        },
      }

      const { error } = await stripe.confirmAfterpayClearpayPayment(clientSecret, {
        payment_method: {
          billing_details: billingDetails,
        },
        shipping: shippingDetails,
        return_url: `${window.location.origin}/${countryCode}/checkout`,
      })

      if (error) {
        setErrorMessage(error.message || null)
        setSubmitting(false)
      }
      // If successful, Stripe will redirect to return_url

      return
    }

    // Handle card payment flow
    const cardElement = elements.getElement('card')

    if (!cardElement) {
      setErrorMessage("Payment method not properly initialized")
      setSubmitting(false)
      return
    }

    // Use confirmCardPayment for CardElement
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name:
            cart.billing_address?.first_name +
            " " +
            cart.billing_address?.last_name,
          address: {
            city: cart.billing_address?.city ?? undefined,
            country: cart.billing_address?.country_code ?? undefined,
            line1: cart.billing_address?.address_1 ?? undefined,
            line2: cart.billing_address?.address_2 ?? undefined,
            postal_code: cart.billing_address?.postal_code ?? undefined,
            state: cart.billing_address?.province ?? undefined,
          },
          email: cart.email,
          phone: cart.billing_address?.phone ?? undefined,
        },
      },
    })

    if (error) {
      const pi = error.payment_intent

      if (
        (pi && pi.status === "requires_capture") ||
        (pi && pi.status === "succeeded")
      ) {
        await onPaymentCompleted()
        return
      }

      setErrorMessage(error.message || null)
      setSubmitting(false)
      return
    }

    if (
      paymentIntent?.status === "requires_capture" ||
      paymentIntent?.status === "succeeded"
    ) {
      await onPaymentCompleted()
    } else {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    if (cart.payment_collection?.status === "authorized") {
      void onPaymentCompleted()
    }
  }, [cart.payment_collection?.status])

  return (
    <>
      {selectedPaymentMethod === 'afterpay_clearpay' ? (
        <AfterpayButton
          onClick={handlePayment}
          disabled={disabled || notReady || submitting}
          isLoading={submitting}
        />
      ) : (
        <Button
          disabled={disabled || notReady || submitting}
          onClick={handlePayment}
          isLoading={submitting}
          data-testid={dataTestId}
          className="w-full h-10 uppercase !rounded-none !bg-black !text-white hover:!bg-neutral-900 transition-colors duration-200 cursor-pointer"
        >
          {buttonText}
        </Button>
      )}
      <ErrorMessage
        error={errorMessage}
        data-testid="stripe-payment-error-message"
      />
    </>
  )
}

const ManualTestPaymentButton = ({ notReady, cart }: { notReady: boolean, cart: HttpTypes.StoreCart }) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    try {
      await placeOrder()
      setSubmitting(false)
    } catch (err) {
      if (isNextRedirectError(err)) {
        throw err
      }

      const errorText =
        err instanceof Error ? err.message : "Failed to place order"
      setErrorMessage(errorText)
      setSubmitting(false)
    }
  }

  const handlePayment = () => {
    if (submitting) {
      return
    }

    // Validate all required checkout fields first
    const validationErrors = validateCheckout(cart)

    if (validationErrors.length > 0) {
      // Scroll to top to show errors
      scrollToTop()

      // Trigger field errors
      triggerFieldErrors(validationErrors)

      return
    }

    setSubmitting(true)

    onPaymentCompleted()
  }

  return (
    <>
      <Button
        disabled={notReady}
        isLoading={submitting}
        onClick={handlePayment}
        data-testid="submit-order-button"
        className="w-full h-10 uppercase !rounded-none !bg-black !text-white hover:!bg-neutral-900 transition-colors duration-200 cursor-pointer"
      >
        Place order
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="manual-payment-error-message"
      />
    </>
  )
}

export default PaymentButton
