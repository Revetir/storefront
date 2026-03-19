"use client"

import { sdk } from "@lib/config"
import { Button, Heading } from "@medusajs/ui"
import ErrorMessage from "@modules/checkout/components/error-message"
import AfterpayButton from "@modules/checkout/components/afterpay-button"
import CustomPaymentSelector from "@modules/checkout/components/payment/custom-payment-selector"
import {
  PaymentMethodType,
  PAYMENT_METHODS,
} from "@modules/checkout/components/payment/payment-methods-config"
import Divider from "@modules/common/components/divider"
import {
  CardElement,
  Elements,
  PaymentMethodMessagingElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { useEffect, useMemo, useState } from "react"

type PaymentSession = {
  id: string
  provider_id: string
  status: string
  data?: Record<string, any> | null
}

type PaymentCollection = {
  id: string
  status: string
  amount: number
  currency_code: string
  payment_sessions?: PaymentSession[]
}

type PaymentFormProps = {
  paymentCollectionId: string
  paymentCollection: PaymentCollection
  order: any
  countryCode: string
  stripeEnabled: boolean
}

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_KEY
const stripePromise = stripeKey ? loadStripe(stripeKey) : null

const SUPPORTED_METHODS = PAYMENT_METHODS.filter(
  (method) => method.id === "card" || method.id === "afterpay_clearpay"
)

const isSuccessfulPaymentIntentStatus = (status: string | undefined | null) => {
  const normalized = String(status || "").toLowerCase()
  return normalized === "succeeded" || normalized === "requires_capture"
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

const redirectToCaptureValidation = ({
  paymentCollectionId,
  countryCode,
  orderId,
  paymentIntentId,
  clientSecret,
}: {
  paymentCollectionId: string
  countryCode: string
  orderId: string
  paymentIntentId: string
  clientSecret: string
}) => {
  const url = new URL(
    `/api/capture-payment-collection/${paymentCollectionId}`,
    window.location.origin
  )

  url.searchParams.set("country_code", countryCode)
  url.searchParams.set("order_id", orderId)
  url.searchParams.set("payment_intent", paymentIntentId)
  url.searchParams.set("payment_intent_client_secret", clientSecret)
  url.searchParams.set("redirect_status", "succeeded")

  window.location.assign(url.toString())
}

const getPaymentIntentId = (session: PaymentSession) =>
  session?.data?.id ||
  session?.data?.payment_intent_id ||
  session?.data?.payment_intent

const resolveStripeSession = (paymentCollection: PaymentCollection) => {
  const sessions = paymentCollection.payment_sessions || []
  return (
    sessions.find(
      (session) =>
        session.provider_id === "pp_stripe_stripe" &&
        session.status === "pending" &&
        Boolean(session.data?.client_secret)
    ) ||
    sessions.find(
      (session) =>
        session.provider_id === "pp_stripe_stripe" &&
        session.status !== "canceled" &&
        Boolean(session.data?.client_secret)
    ) ||
    null
  )
}

const PaymentCollectionStripeForm = ({
  paymentCollectionId,
  order,
  countryCode,
  clientSecret,
  selectedMethod,
}: {
  paymentCollectionId: string
  order: any
  countryCode: string
  clientSecret: string
  selectedMethod: PaymentMethodType
}) => {
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const billingAddress = order?.billing_address || order?.shipping_address || {}
  const shippingAddress = order?.shipping_address || order?.billing_address || {}

  const billingName = `${billingAddress.first_name || ""} ${billingAddress.last_name || ""}`.trim()
  const shippingName = `${shippingAddress.first_name || ""} ${shippingAddress.last_name || ""}`.trim()

  const handleCardPayment = async () => {
    if (!stripe || !elements) {
      setErrorMessage("Stripe is not initialized")
      return
    }

    const cardElement = elements.getElement(CardElement)

    if (!cardElement) {
      setErrorMessage("Card input is not ready")
      return
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: billingName || undefined,
          email: order?.email || undefined,
          phone: billingAddress.phone || undefined,
          address: {
            line1: billingAddress.address_1 || undefined,
            line2: billingAddress.address_2 || undefined,
            city: billingAddress.city || undefined,
            state: toStripeState(billingAddress.province, billingAddress.country_code),
            postal_code: billingAddress.postal_code || undefined,
            country: billingAddress.country_code || undefined,
          },
        },
      },
    })

    if (error) {
      const intentStatus = error.payment_intent?.status
      if (isSuccessfulPaymentIntentStatus(intentStatus)) {
        const paymentIntentId = error.payment_intent?.id
        if (paymentIntentId) {
          redirectToCaptureValidation({
            paymentCollectionId,
            countryCode,
            orderId: order.id,
            paymentIntentId,
            clientSecret,
          })
          return
        }

        setErrorMessage("Payment succeeded but confirmation redirect failed. Please refresh.")
        return
      }

      setErrorMessage(error.message || "Payment failed")
      return
    }

    if (isSuccessfulPaymentIntentStatus(paymentIntent?.status)) {
      if (paymentIntent?.id) {
        redirectToCaptureValidation({
          paymentCollectionId,
          countryCode,
          orderId: order.id,
          paymentIntentId: paymentIntent.id,
          clientSecret,
        })
        return
      }

      setErrorMessage("Payment succeeded but confirmation redirect failed. Please refresh.")
      return
    }

    setErrorMessage("Payment is still processing. Please wait and try again.")
  }

  const handleAfterpayPayment = async () => {
    if (!stripe) {
      setErrorMessage("Stripe is not initialized")
      return
    }

    const returnUrl = new URL(
      `/api/capture-payment-collection/${paymentCollectionId}`,
      window.location.origin
    )
    returnUrl.searchParams.set("country_code", countryCode)
    returnUrl.searchParams.set("order_id", order.id)

    const { error } = await stripe.confirmAfterpayClearpayPayment(clientSecret, {
      payment_method: {
        billing_details: {
          name: billingName || undefined,
          email: order?.email || undefined,
          phone: billingAddress.phone || undefined,
          address: {
            line1: billingAddress.address_1 || undefined,
            line2: billingAddress.address_2 || undefined,
            city: billingAddress.city || undefined,
            state: toStripeState(billingAddress.province, billingAddress.country_code),
            postal_code: billingAddress.postal_code || undefined,
            country: billingAddress.country_code || undefined,
          },
        },
      },
      shipping: {
        name: shippingName || "Customer",
        phone: shippingAddress.phone || undefined,
        address: {
          line1: shippingAddress.address_1 || undefined,
          line2: shippingAddress.address_2 || undefined,
          city: shippingAddress.city || undefined,
          state: toStripeState(shippingAddress.province, shippingAddress.country_code),
          postal_code: shippingAddress.postal_code || undefined,
          country: shippingAddress.country_code || undefined,
        },
      },
      return_url: returnUrl.toString(),
    })

    if (error) {
      setErrorMessage(error.message || "Afterpay payment failed")
    }
  }

  const handleSubmit = async () => {
    if (submitting) {
      return
    }

    setSubmitting(true)
    setErrorMessage(null)

    try {
      if (selectedMethod === "afterpay_clearpay") {
        await handleAfterpayPayment()
      } else {
        await handleCardPayment()
      }
    } finally {
      setSubmitting(false)
    }
  }

  const totalInCents = Math.round((order?.total || 0) * 100)

  return (
    <div className="space-y-4">
      {selectedMethod === "card" ? (
        <div className="max-w-md">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "14px",
                  fontFamily: "Satoshi, Segoe UI, Roboto, Helvetica Neue, Ubuntu, sans-serif",
                  color: "#000000",
                  "::placeholder": {
                    color: "#9CA3AF",
                  },
                },
              },
              hidePostalCode: false,
            }}
          />
        </div>
      ) : (
        <div className="space-y-2">
          {totalInCents > 0 && (
            <PaymentMethodMessagingElement
              options={{
                amount: totalInCents,
                currency: "USD",
                paymentMethodTypes: ["afterpay_clearpay"],
                countryCode: "US",
              }}
            />
          )}
        </div>
      )}

      {selectedMethod === "afterpay_clearpay" ? (
        <AfterpayButton
          onClick={handleSubmit}
          disabled={!stripe || submitting}
          isLoading={submitting}
        />
      ) : (
        <Button
          onClick={handleSubmit}
          disabled={!stripe || !elements || submitting}
          isLoading={submitting}
          className="w-full h-10 uppercase !rounded-none !bg-black !text-white hover:!bg-neutral-900 transition-colors duration-200 cursor-pointer"
        >
          Place Order
        </Button>
      )}

      <ErrorMessage error={errorMessage} data-testid="payment-collection-error-message" />
    </div>
  )
}

const PaymentForm = ({
  paymentCollectionId,
  paymentCollection,
  order,
  countryCode,
  stripeEnabled,
}: PaymentFormProps) => {
  const [collection, setCollection] = useState<PaymentCollection>(paymentCollection)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>("card")
  const [initializing, setInitializing] = useState(false)
  const [initError, setInitError] = useState<string | null>(null)

  const stripeSession = useMemo(() => resolveStripeSession(collection), [collection])
  const clientSecret = stripeSession?.data?.client_secret as string | undefined

  useEffect(() => {
    if (!stripeEnabled || stripeSession || initializing) {
      return
    }

    let mounted = true

    const init = async () => {
      setInitializing(true)
      setInitError(null)

      try {
        const response = await sdk.client.fetch<{ payment_collection: PaymentCollection }>(
          `/store/payment-collections/${paymentCollectionId}/payment-sessions`,
          {
            method: "POST",
            body: {
              provider_id: "pp_stripe_stripe",
            },
            cache: "no-store",
          }
        )

        if (!mounted) {
          return
        }

        setCollection(response.payment_collection)
      } catch (error: any) {
        if (!mounted) {
          return
        }
        setInitError(error?.message || "Failed to initialize payment session")
      } finally {
        if (mounted) {
          setInitializing(false)
        }
      }
    }

    void init()

    return () => {
      mounted = false
    }
  }, [initializing, paymentCollectionId, stripeEnabled, stripeSession])

  if (!stripeEnabled) {
    return (
      <ErrorMessage
        error="Stripe isn't enabled for this order's region."
        data-testid="payment-collection-stripe-disabled"
      />
    )
  }

  if (!stripeKey || !stripePromise) {
    return (
      <ErrorMessage
        error="Stripe configuration is missing. Set NEXT_PUBLIC_STRIPE_KEY."
        data-testid="payment-collection-stripe-config-error"
      />
    )
  }

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center gap-x-2 justify-left mb-4">
        <Heading level="h2" className="text-xl gap-x-2 items-baseline uppercase">
          Payment Method
        </Heading>
      </div>
      <Divider className="mb-6" />

      <CustomPaymentSelector
        availableMethods={SUPPORTED_METHODS}
        selectedMethod={selectedMethod}
        onMethodSelect={setSelectedMethod}
        renderPaymentDetails={() => null}
      />

      {!clientSecret && (
        <div className="py-4 text-sm text-gray-500">
          {initializing ? "Initializing payment..." : "Preparing payment session..."}
        </div>
      )}

      {initError && <ErrorMessage error={initError} data-testid="payment-collection-init-error" />}

      {clientSecret && (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              variables: {
                fontSizeBase: "14px",
                fontFamily: "Satoshi, Segoe UI, Roboto, Helvetica Neue, Ubuntu, sans-serif",
              },
            },
          }}
        >
          <PaymentCollectionStripeForm
            paymentCollectionId={paymentCollectionId}
            order={order}
            countryCode={countryCode}
            clientSecret={clientSecret}
            selectedMethod={selectedMethod}
          />
        </Elements>
      )}
    </div>
  )
}

export default PaymentForm
