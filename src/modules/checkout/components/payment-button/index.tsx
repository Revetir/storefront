"use client"

import { isManual, isStripe } from "@lib/constants"
import { placeOrder } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import { useElements, useStripe } from "@stripe/react-stripe-js"
import React, { useState, useEffect } from "react"
import ErrorMessage from "../error-message"
import { useParams } from "next/navigation"
import { validateCheckout, triggerFieldErrors, scrollToTop } from "../../utils/validate-checkout"
import { usePaymentContext } from "../payment/payment-context"
import { PaymentMethodType } from "../payment/payment-methods-config"
import AfterpayButton from "../afterpay-button"


type PaymentButtonProps = {
  cart: HttpTypes.StoreCart
  "data-testid": string
}

/**
 * Get the button text based on the selected payment method
 *
 * Future Enhancement:
 * - For Apple Pay, Google Pay, and Klarna: Replace text buttons with branded button images
 *   from /images folder (e.g., "Continue with Klarna" branded button)
 * - Current implementation uses text for all payment methods
 */
const getButtonText = (paymentMethod: PaymentMethodType | null): string => {
  switch (paymentMethod) {
    case 'afterpay_clearpay':
      return 'Pay with Afterpay'
    case 'klarna':
      // TODO: Replace with branded Klarna button image in future
      return 'Continue with Klarna'
    case 'apple_pay':
      // TODO: Replace with Apple Pay button image in future
      return 'Pay with Apple Pay'
    case 'google_pay':
      // TODO: Replace with Google Pay button image in future
      return 'Pay with Google Pay'
    case 'card':
    default:
      return 'Place order'
  }
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

  const paymentSession = cart.payment_collection?.payment_sessions?.[0]

  switch (true) {
    case isStripe(paymentSession?.provider_id):
      return (
        <StripePaymentButton
          notReady={notReady}
          cart={cart}
          data-testid={dataTestId}
        />
      )
    case isManual(paymentSession?.provider_id):
      return (
        <ManualTestPaymentButton notReady={notReady} cart={cart} data-testid={dataTestId} />
      )
    default:
      return <Button disabled className="uppercase">Select a payment method</Button>
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
    (session) => session.provider_id === "pp_stripe_stripe"
  )

  const buttonText = getButtonText(selectedPaymentMethod)

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const stripe = useStripe()
  const elements = useElements()

  const disabled = !stripe || !elements ? true : false

  const handlePayment = async () => {
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

    /**
     * Payment Method Handling Strategy:
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
     * APPLE PAY / GOOGLE PAY / KLARNA:
     * - Handled via ExpressCheckoutElement in review component
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
        phone: cart.shipping_address?.phone ?? undefined,
        address: {
          line1: cart.shipping_address?.address_1 ?? undefined,
          line2: cart.shipping_address?.address_2 ?? undefined,
          city: cart.shipping_address?.city ?? undefined,
          state: cart.shipping_address?.province ?? undefined,
          postal_code: cart.shipping_address?.postal_code ?? undefined,
          country: cart.shipping_address?.country_code ?? undefined,
        },
      }

      await stripe
        .confirmAfterpayClearpayPayment(clientSecret, {
          payment_method: {
            billing_details: billingDetails,
          },
          shipping: shippingDetails,
          return_url: `${window.location.origin}/${countryCode}/checkout`,
        })
        .then(({ error }) => {
          if (error) {
            setErrorMessage(error.message || null)
            setSubmitting(false)
          }
          // If successful, Stripe will redirect to return_url
        })

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
    await stripe
    .confirmCardPayment(clientSecret, {
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
    .then(({ error, paymentIntent }) => {
      if (error) {
        const pi = error.payment_intent

        if (
          (pi && pi.status === "requires_capture") ||
          (pi && pi.status === "succeeded")
        ) {
          onPaymentCompleted()
          return
        }

        setErrorMessage(error.message || null)
        setSubmitting(false)
        return
      }

      if (
        paymentIntent.status === "requires_capture" ||
        paymentIntent.status === "succeeded"
      ) {
        onPaymentCompleted()
      }
    })
  }

  useEffect(() => {
    if (cart.payment_collection?.status === "authorized") {
      onPaymentCompleted()
    }
  }, [cart.payment_collection?.status])

  return (
    <>
      {selectedPaymentMethod === 'afterpay_clearpay' ? (
        <AfterpayButton
          onClick={handlePayment}
          disabled={disabled || notReady}
          isLoading={submitting}
        />
      ) : (
        <Button
          disabled={disabled || notReady}
          onClick={handlePayment}
          size="large"
          isLoading={submitting}
          data-testid={dataTestId}
          className="uppercase"
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
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const handlePayment = () => {
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
        size="large"
        data-testid="submit-order-button"
        className="uppercase"
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