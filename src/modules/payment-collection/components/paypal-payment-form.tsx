"use client"

import { sdk } from "@lib/config"
import { Button, Heading } from "@medusajs/ui"
import ErrorMessage from "@modules/checkout/components/error-message"
import Divider from "@modules/common/components/divider"
import {
  PayPalButtons,
  PayPalCardFieldsForm,
  PayPalCardFieldsProvider,
  PayPalScriptProvider,
  usePayPalCardFields,
} from "@paypal/react-paypal-js"
import { useCallback, useEffect, useMemo, useState } from "react"

type PaymentSession = {
  provider_id?: string
  status?: string
  data?: Record<string, any> | null
}

type PaymentCollection = {
  id: string
  amount: number
  currency_code: string
  payment_sessions?: PaymentSession[]
}

type PayPalPaymentCollectionFormProps = {
  paymentCollectionId: string
  paymentCollection: PaymentCollection
  order: any
  countryCode: string
  paypalProviderId: string
}

const toErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message
  }

  if (typeof error === "string" && error.trim()) {
    return error
  }

  return fallback
}

const resolvePayPalOrderId = (
  paymentCollection: PaymentCollection | null | undefined,
  paypalProviderId: string
) => {
  const sessions = paymentCollection?.payment_sessions || []
  const session =
    sessions.find(
      (entry) =>
        entry.provider_id === paypalProviderId &&
        entry.status === "pending" &&
        typeof entry.data?.id === "string"
    ) ||
    sessions.find(
      (entry) =>
        entry.provider_id === paypalProviderId &&
        entry.status !== "canceled" &&
        typeof entry.data?.id === "string"
    )

  if (!session?.data) {
    return null
  }

  return (
    (typeof session.data.id === "string" && session.data.id) ||
    (typeof session.data.order_id === "string" && session.data.order_id) ||
    null
  )
}

const PayPalCardSubmitButton = ({
  disabled,
  onSubmitStart,
  onSubmitEnd,
}: {
  disabled: boolean
  onSubmitStart: () => void
  onSubmitEnd: () => void
}) => {
  const { cardFieldsForm } = usePayPalCardFields()
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!cardFieldsForm || submitting || disabled) {
      return
    }

    setSubmitting(true)
    onSubmitStart()

    try {
      await cardFieldsForm.submit()
    } finally {
      setSubmitting(false)
      onSubmitEnd()
    }
  }

  return (
    <Button
      disabled={!cardFieldsForm || disabled || submitting}
      onClick={handleSubmit}
      isLoading={submitting}
      className="w-full h-10 uppercase !rounded-none !bg-black !text-white hover:!bg-neutral-900 transition-colors duration-200 cursor-pointer"
    >
      Pay with card
    </Button>
  )
}

const PayPalPaymentCollectionForm = ({
  paymentCollectionId,
  paymentCollection,
  order,
  countryCode,
  paypalProviderId,
}: PayPalPaymentCollectionFormProps) => {
  const [collection, setCollection] = useState<PaymentCollection>(paymentCollection)
  const [clientToken, setClientToken] = useState<string | null>(null)
  const [loadingClientToken, setLoadingClientToken] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || ""

  useEffect(() => {
    setCollection(paymentCollection)
  }, [paymentCollection])

  const currencyCode = useMemo(
    () => String(order?.currency_code || paymentCollection.currency_code || "usd").toUpperCase(),
    [order?.currency_code, paymentCollection.currency_code]
  )

  const redirectToCaptureValidation = useCallback(() => {
    const url = new URL(
      `/api/capture-payment-collection/${paymentCollectionId}`,
      window.location.origin
    )
    url.searchParams.set("country_code", countryCode)
    url.searchParams.set("order_id", order?.id || "")

    window.location.assign(url.toString())
  }, [countryCode, order?.id, paymentCollectionId])

  const createOrder = useCallback(async () => {
    setErrorMessage(null)

    const existingOrderId = resolvePayPalOrderId(collection, paypalProviderId)
    if (existingOrderId) {
      return existingOrderId
    }

    const response = await sdk.client.fetch<{ payment_collection: PaymentCollection }>(
      `/store/payment-collections/${paymentCollectionId}/payment-sessions`,
      {
        method: "POST",
        body: {
          provider_id: paypalProviderId,
        },
        cache: "no-store",
      }
    )

    const nextCollection = response?.payment_collection || collection
    setCollection(nextCollection)

    const orderId = resolvePayPalOrderId(nextCollection, paypalProviderId)
    if (!orderId) {
      throw new Error("Failed to initialize a PayPal payment session.")
    }

    return orderId
  }, [collection, paymentCollectionId, paypalProviderId])

  const handleApprove = useCallback(async (_data?: any, actions?: any) => {
    setSubmitting(true)
    setErrorMessage(null)
    try {
      if (actions?.order?.authorize) {
        await actions.order.authorize()
      }
      redirectToCaptureValidation()
    } catch (error) {
      setErrorMessage(
        toErrorMessage(error, "PayPal approval succeeded, but finalization failed.")
      )
      setSubmitting(false)
    }
  }, [redirectToCaptureValidation])

  useEffect(() => {
    let mounted = true

    const fetchClientToken = async () => {
      setLoadingClientToken(true)
      setErrorMessage(null)
      try {
        const response = await sdk.client.fetch<{
          client_token?: string
          clientToken?: string
        }>("/store/paypal/client-token", {
          method: "POST",
          cache: "no-store",
        })

        if (!mounted) {
          return
        }

        const token = response.client_token || response.clientToken
        if (!token) {
          throw new Error("PayPal client token response was empty.")
        }

        setClientToken(token)
      } catch (error) {
        if (mounted) {
          setErrorMessage(
            toErrorMessage(error, "Failed to initialize PayPal. Please refresh and try again.")
          )
        }
      } finally {
        if (mounted) {
          setLoadingClientToken(false)
        }
      }
    }

    void fetchClientToken()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center gap-x-2 justify-left mb-4">
        <Heading level="h2" className="text-xl gap-x-2 items-baseline uppercase">
          Payment Method
        </Heading>
      </div>
      <Divider className="mb-6" />

      {!paypalClientId && (
        <ErrorMessage
          error="PayPal configuration is missing. Set NEXT_PUBLIC_PAYPAL_CLIENT_ID."
          data-testid="paypal-payment-collection-config-error-message"
        />
      )}

      {loadingClientToken && (
        <div className="py-4 text-sm text-gray-500">Loading PayPal checkout...</div>
      )}

      {!paypalClientId ? null : !loadingClientToken && clientToken && (
        <PayPalScriptProvider
          options={{
            clientId: paypalClientId,
            components: "buttons,card-fields",
            currency: currencyCode,
            intent: "authorize",
            dataClientToken: clientToken,
          }}
        >
          <div className="space-y-6">
            <div>
              <p className="mb-3 text-sm text-gray-700">Pay with PayPal</p>
              <PayPalButtons
                style={{ layout: "vertical", label: "paypal", tagline: false }}
                forceReRender={[currencyCode]}
                createOrder={createOrder}
                onApprove={handleApprove}
                onCancel={() => {
                  setErrorMessage("PayPal checkout was canceled.")
                }}
                onError={(error) => {
                  setErrorMessage(
                    toErrorMessage(error, "PayPal checkout failed. Please try again.")
                  )
                }}
              />
            </div>

            <div className="border-t border-ui-border-base pt-5">
              <p className="mb-3 text-sm text-gray-700">Or pay with card</p>
              <PayPalCardFieldsProvider
                createOrder={createOrder}
                onApprove={handleApprove}
                onError={(error) => {
                  setErrorMessage(
                    toErrorMessage(error, "Card payment failed. Please try again.")
                  )
                }}
                style={{
                  input: {
                    "font-size": "14px",
                    "font-family": "Satoshi, Segoe UI, Roboto, Helvetica Neue, Ubuntu, sans-serif",
                    color: "#000000",
                  },
                  ".invalid": { color: "#dc2626" },
                }}
              >
                <div className="space-y-4">
                  <PayPalCardFieldsForm />
                  <PayPalCardSubmitButton
                    disabled={submitting}
                    onSubmitStart={() => {
                      setSubmitting(true)
                      setErrorMessage(null)
                    }}
                    onSubmitEnd={() => {
                      setSubmitting(false)
                    }}
                  />
                </div>
              </PayPalCardFieldsProvider>
            </div>
          </div>
        </PayPalScriptProvider>
      )}

      <ErrorMessage error={errorMessage} data-testid="paypal-payment-collection-error-message" />
    </div>
  )
}

export default PayPalPaymentCollectionForm
