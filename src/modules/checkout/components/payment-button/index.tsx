"use client"

import { isManual, isStripe } from "@lib/constants"
import { placeOrder, updateCheckoutCart } from "@lib/data/cart"
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

const resolveCountryCode = (
  routeCountryCode: string | string[] | undefined,
  fallbackCountryCode?: string | null
): string => {
  const fromRoute = Array.isArray(routeCountryCode)
    ? routeCountryCode[0]
    : routeCountryCode

  return (
    fromRoute?.toLowerCase() ||
    fallbackCountryCode?.toLowerCase() ||
    "us"
  )
}

const toStripeState = (
  province: string | undefined | null,
  countryCode: string | undefined | null
): string | undefined => {
  if (!province) {
    return undefined
  }

  const trimmed = province.trim()
  if (!trimmed) {
    return undefined
  }

  if ((countryCode || "").toLowerCase() !== "us") {
    return trimmed
  }

  const usPrefixed = /^us-([a-z]{2})$/i.exec(trimmed)
  if (usPrefixed?.[1]) {
    return usPrefixed[1].toUpperCase()
  }

  if (/^[a-z]{2}$/i.test(trimmed)) {
    return trimmed.toUpperCase()
  }

  return trimmed
}

const redirectToOrderConfirmation = ({
  countryCode,
  orderId,
}: {
  countryCode: string
  orderId: string
}) => {
  if (typeof window === "undefined") {
    return
  }

  window.location.assign(`/${countryCode}/order/${orderId}/confirmed`)
}

const ADDRESS_FIELDS = [
  "first_name",
  "last_name",
  "address_1",
  "address_2",
  "company",
  "postal_code",
  "city",
  "country_code",
  "province",
  "phone",
] as const

const readAutocompleteFieldValue = (testId: string): string | undefined => {
  if (typeof window === "undefined") return undefined

  const container = document.querySelector(
    `[data-testid="${testId}"]`
  ) as HTMLElement | null
  const input = container?.querySelector(
    ".radar-autocomplete-input"
  ) as HTMLInputElement | null

  const value = input?.value?.trim()
  return value ? value : undefined
}

const readFieldValue = (name: string): string | undefined => {
  if (typeof window === "undefined") return undefined

  const field = document.querySelector(
    `[name="${name}"]`
  ) as HTMLInputElement | HTMLSelectElement | null

  if (field) {
    const value = field.value?.trim()
    return value ? value : undefined
  }

  if (name === "shipping_address.address_1") {
    return readAutocompleteFieldValue("shipping-address-input")
  }

  if (name === "billing_address.address_1") {
    return readAutocompleteFieldValue("billing-address-input")
  }

  return undefined
}

const readAddressFromForm = (
  prefix: "shipping_address" | "billing_address"
): Partial<HttpTypes.StoreCartAddress> | null => {
  const address: Partial<HttpTypes.StoreCartAddress> = {}
  let hasAnyValue = false

  ADDRESS_FIELDS.forEach((field) => {
    const value = readFieldValue(`${prefix}.${field}`)
    if (value !== undefined) {
      hasAnyValue = true
      address[field] = value
    }
  })

  return hasAnyValue ? address : null
}

const isSameAsBillingChecked = (): boolean => {
  if (typeof window === "undefined") return true

  const checkbox = document.querySelector(
    '[data-testid="billing-address-checkbox"]'
  ) as HTMLElement | null

  return checkbox?.getAttribute("aria-checked") !== "false"
}

const syncCartFromCheckoutForm = async (
  cart: HttpTypes.StoreCart
): Promise<HttpTypes.StoreCart> => {
  if (typeof window === "undefined") return cart

  const shippingAddress = readAddressFromForm("shipping_address")
  const billingAddress = readAddressFromForm("billing_address")
  const email = readFieldValue("email")
  const sameAsBilling = isSameAsBillingChecked()

  const updateData: HttpTypes.StoreUpdateCart = {}

  if (shippingAddress) {
    updateData.shipping_address = shippingAddress
  }

  if (email !== undefined) {
    updateData.email = email
  }

  if (sameAsBilling) {
    if (shippingAddress || cart.shipping_address) {
      updateData.billing_address = shippingAddress || cart.shipping_address || undefined
    }
  } else if (billingAddress) {
    updateData.billing_address = billingAddress
  }

  if (Object.keys(updateData).length === 0) {
    return cart
  }

  const updatedCart = await updateCheckoutCart(updateData)
  return updatedCart || cart
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

  const buttonText = getButtonText(selectedPaymentMethod)

  const onPaymentCompleted = async () => {
    try {
      const order = await placeOrder()
      redirectToOrderConfirmation(order)
      setSubmitting(false)
    } catch (err) {
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

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("checkout:submit-intent"))
    }

    let checkoutCart = cart

    try {
      checkoutCart = await syncCartFromCheckoutForm(cart)
    } catch (syncError) {
      setErrorMessage("Unable to save your checkout details. Please try again.")
      return
    }

    // Validate all required checkout fields first
    const validationErrors = validateCheckout(checkoutCart)

    if (validationErrors.length > 0) {
      // Scroll to top to show errors
      scrollToTop()

      // Trigger field errors
      triggerFieldErrors(validationErrors)

      return
    }

    if (!stripe || !elements || !checkoutCart) {
      return
    }

    setSubmitting(true)

    const paymentSession = checkoutCart.payment_collection?.payment_sessions?.find(
      (session) => session.provider_id === "pp_stripe_stripe" && session.status === "pending"
    ) || checkoutCart.payment_collection?.payment_sessions?.find(
      (session) =>
        session.provider_id === "pp_stripe_stripe" && session.status !== "canceled"
    )

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
        name: `${checkoutCart.billing_address?.first_name} ${checkoutCart.billing_address?.last_name}`,
        email: checkoutCart.email,
        phone: checkoutCart.billing_address?.phone ?? undefined,
        address: {
          line1: checkoutCart.billing_address?.address_1 ?? undefined,
          line2: checkoutCart.billing_address?.address_2 ?? undefined,
          city: checkoutCart.billing_address?.city ?? undefined,
          state: toStripeState(
            checkoutCart.billing_address?.province,
            checkoutCart.billing_address?.country_code
          ),
          postal_code: checkoutCart.billing_address?.postal_code ?? undefined,
          country: checkoutCart.billing_address?.country_code ?? undefined,
        },
      }

      const shippingDetails = {
        name: `${checkoutCart.shipping_address?.first_name} ${checkoutCart.shipping_address?.last_name}`,
        phone: checkoutCart.shipping_address?.phone ?? '',
        address: {
          line1: checkoutCart.shipping_address?.address_1 ?? '',
          line2: checkoutCart.shipping_address?.address_2 ?? '',
          city: checkoutCart.shipping_address?.city ?? '',
          state:
            toStripeState(
              checkoutCart.shipping_address?.province,
              checkoutCart.shipping_address?.country_code
            ) ?? "",
          postal_code: checkoutCart.shipping_address?.postal_code ?? '',
          country: checkoutCart.shipping_address?.country_code ?? '',
        },
      }

      const { error } = await stripe.confirmAfterpayClearpayPayment(clientSecret, {
        payment_method: {
          billing_details: billingDetails,
        },
        shipping: shippingDetails,
        return_url: (() => {
          const resolvedCountryCode = resolveCountryCode(
            countryCode as string | string[] | undefined,
            checkoutCart.shipping_address?.country_code
          )
          const captureUrl = new URL(
            `/api/capture-payments/${checkoutCart.id}`,
            window.location.origin
          )
          captureUrl.searchParams.set("country_code", resolvedCountryCode)
          return captureUrl.toString()
        })(),
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
            checkoutCart.billing_address?.first_name +
            " " +
            checkoutCart.billing_address?.last_name,
          address: {
            city: checkoutCart.billing_address?.city ?? undefined,
            country: checkoutCart.billing_address?.country_code ?? undefined,
            line1: checkoutCart.billing_address?.address_1 ?? undefined,
            line2: checkoutCart.billing_address?.address_2 ?? undefined,
            postal_code: checkoutCart.billing_address?.postal_code ?? undefined,
            state: toStripeState(
              checkoutCart.billing_address?.province,
              checkoutCart.billing_address?.country_code
            ),
          },
          email: checkoutCart.email,
          phone: checkoutCart.billing_address?.phone ?? undefined,
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
      const order = await placeOrder()
      redirectToOrderConfirmation(order)
      setSubmitting(false)
    } catch (err) {
      const errorText =
        err instanceof Error ? err.message : "Failed to place order"
      setErrorMessage(errorText)
      setSubmitting(false)
    }
  }

  const handlePayment = () => {
    void (async () => {
      if (submitting) {
        return
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("checkout:submit-intent"))
      }

      let checkoutCart = cart

      try {
        checkoutCart = await syncCartFromCheckoutForm(cart)
      } catch (syncError) {
        setErrorMessage("Unable to save your checkout details. Please try again.")
        return
      }

      // Validate all required checkout fields first
      const validationErrors = validateCheckout(checkoutCart)

      if (validationErrors.length > 0) {
        // Scroll to top to show errors
        scrollToTop()

        // Trigger field errors
        triggerFieldErrors(validationErrors)

        return
      }

      setSubmitting(true)

      await onPaymentCompleted()
    })()
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
