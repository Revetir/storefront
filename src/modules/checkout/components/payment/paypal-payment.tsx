"use client"

import { sdk } from "@lib/config"
import { initiatePaymentSession, placeOrder } from "@lib/data/cart"
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

const PAYPAL_PROVIDER_ID = "pp_paypal_paypal"

type PayPalCartPaymentProps = {
  cart: any
}

type CartLike = {
  id?: string
  currency_code?: string
  payment_collection?: {
    payment_sessions?: Array<{
      provider_id?: string
      status?: string
      data?: Record<string, any>
    }>
  } | null
}

const resolvePayPalSession = (cart: CartLike | null | undefined) => {
  const sessions = cart?.payment_collection?.payment_sessions || []
  return (
    sessions.find(
      (session) =>
        session.provider_id === PAYPAL_PROVIDER_ID &&
        session.status === "pending" &&
        typeof session.data?.id === "string"
    ) ||
    sessions.find(
      (session) =>
        session.provider_id === PAYPAL_PROVIDER_ID &&
        session.status !== "canceled" &&
        typeof session.data?.id === "string"
    ) ||
    null
  )
}

const resolvePayPalOrderId = (cart: CartLike | null | undefined) => {
  const session = resolvePayPalSession(cart)
  if (!session?.data) {
    return null
  }

  return (
    (typeof session.data.id === "string" && session.data.id) ||
    (typeof session.data.order_id === "string" && session.data.order_id) ||
    null
  )
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
      disabled={disabled || !cardFieldsForm || submitting}
      onClick={handleSubmit}
      isLoading={submitting}
      className="w-full h-10 uppercase !rounded-none !bg-black !text-white hover:!bg-neutral-900 transition-colors duration-200 cursor-pointer"
    >
      Pay with card
    </Button>
  )
}

const PayPalCartPayment = ({ cart }: PayPalCartPaymentProps) => {
  const [workingCart, setWorkingCart] = useState<CartLike>(cart)
  const [clientToken, setClientToken] = useState<string | null>(null)
  const [loadingClientToken, setLoadingClientToken] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || ""

  useEffect(() => {
    setWorkingCart(cart)
  }, [cart])

  const currencyCode = useMemo(
    () => String(cart?.currency_code || "usd").toUpperCase(),
    [cart?.currency_code]
  )

  const completeOrder = useCallback(async () => {
    const order = await placeOrder()
    window.location.assign(`/${order.countryCode}/order/${order.orderId}/confirmed`)
  }, [])

  const ensurePayPalSession = useCallback(async () => {
    const existingOrderId = resolvePayPalOrderId(workingCart)
    if (existingOrderId) {
      return existingOrderId
    }

    const initialized = await initiatePaymentSession(workingCart as any, {
      provider_id: PAYPAL_PROVIDER_ID,
    })
    const nextCart = ((initialized as any)?.cart || initialized || workingCart) as CartLike
    setWorkingCart(nextCart)

    const nextOrderId = resolvePayPalOrderId(nextCart)
    if (!nextOrderId) {
      throw new Error("Failed to initialize a PayPal order for this cart.")
    }

    return nextOrderId
  }, [workingCart])

  const createOrder = useCallback(async () => {
    setErrorMessage(null)
    return ensurePayPalSession()
  }, [ensurePayPalSession])

  const handleApprove = useCallback(async () => {
    setSubmitting(true)
    setErrorMessage(null)
    try {
      await completeOrder()
    } catch (error) {
      setErrorMessage(toErrorMessage(error, "Failed to place order after PayPal approval."))
    } finally {
      setSubmitting(false)
    }
  }, [completeOrder])

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
          data-testid="paypal-payment-config-error-message"
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

      <ErrorMessage error={errorMessage} data-testid="paypal-payment-error-message" />
    </div>
  )
}

export default PayPalCartPayment
