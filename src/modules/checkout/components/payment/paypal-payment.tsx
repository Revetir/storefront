"use client"

import { sdk } from "@lib/config"
import { placeOrder } from "@lib/data/cart"
import { Heading } from "@medusajs/ui"
import ErrorMessage from "@modules/checkout/components/error-message"
import CustomPaymentSelector from "@modules/checkout/components/payment/custom-payment-selector"
import Divider from "@modules/common/components/divider"
import Amex from "@modules/common/icons/amex"
import Discover from "@modules/common/icons/discover"
import Mastercard from "@modules/common/icons/mastercard"
import PayPalIcon from "@modules/common/icons/paypal"
import Visa from "@modules/common/icons/visa"
import {
  PayPalButtons,
  PayPalCardFieldsForm,
  PayPalCardFieldsProvider,
  PayPalScriptProvider,
  usePayPalCardFields,
} from "@paypal/react-paypal-js"
import { Button } from "@medusajs/ui"
import { useCallback, useEffect, useMemo, useState } from "react"

const DEFAULT_PAYPAL_PROVIDER_ID = "pp_paypal_paypal"

type PayPalMethodType = "paypal_wallet" | "paypal_pay_later" | "paypal_card"

type PayPalMethodConfig = {
  id: PayPalMethodType
  label: string
  icons: React.ComponentType[]
}

const PayIn4Badge = () => (
  <span className="text-[10px] uppercase tracking-wide border border-ui-border-base px-2 py-1 text-ui-fg-subtle">
    Pay in 4
  </span>
)

const PAYPAL_METHODS: PayPalMethodConfig[] = [
  {
    id: "paypal_wallet",
    label: "Pay with PayPal",
    icons: [PayPalIcon],
  },
  {
    id: "paypal_pay_later",
    label: "PayPal Pay in 4",
    icons: [PayPalIcon, PayIn4Badge],
  },
  {
    id: "paypal_card",
    label: "Pay with credit or debit card",
    icons: [Visa, Mastercard, Amex, Discover],
  },
]

type PaymentSession = {
  provider_id?: string
  status?: string
  data?: Record<string, any>
}

type PaymentCollectionLike = {
  id?: string
  currency_code?: string
  payment_sessions?: PaymentSession[]
}

type CartLike = {
  id?: string
  currency_code?: string
  payment_collection?: PaymentCollectionLike | null
}

type PayPalCartPaymentProps = {
  cart: CartLike
  paypalProviderId?: string
}

const resolvePayPalSession = (
  paymentCollection: PaymentCollectionLike | null | undefined,
  providerId: string
) => {
  const sessions = paymentCollection?.payment_sessions || []

  return (
    sessions.find(
      (session) =>
        session.provider_id === providerId &&
        session.status === "pending" &&
        typeof session.data?.id === "string"
    ) ||
    sessions.find(
      (session) =>
        session.provider_id === providerId &&
        session.status !== "canceled" &&
        typeof session.data?.id === "string"
    ) ||
    null
  )
}

const resolvePayPalOrderId = (
  paymentCollection: PaymentCollectionLike | null | undefined,
  providerId: string
) => {
  const session = resolvePayPalSession(paymentCollection, providerId)

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
      data-testid="paypal-card-submit-button"
    >
      Place order
    </Button>
  )
}

const PayPalCartPayment = ({ cart, paypalProviderId }: PayPalCartPaymentProps) => {
  const [workingCart, setWorkingCart] = useState<CartLike>(cart)
  const [workingCollection, setWorkingCollection] = useState<PaymentCollectionLike | null>(
    cart?.payment_collection || null
  )
  const [selectedMethod, setSelectedMethod] = useState<PayPalMethodType>("paypal_wallet")
  const [clientToken, setClientToken] = useState<string | null>(null)
  const [loadingClientToken, setLoadingClientToken] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || ""
  const resolvedPayPalProviderId = paypalProviderId || DEFAULT_PAYPAL_PROVIDER_ID

  useEffect(() => {
    setWorkingCart(cart)
    setWorkingCollection(cart?.payment_collection || null)
  }, [cart])

  const currencyCode = useMemo(
    () =>
      String(
        workingCart?.currency_code ||
          workingCollection?.currency_code ||
          cart?.currency_code ||
          "usd"
      ).toUpperCase(),
    [cart?.currency_code, workingCart?.currency_code, workingCollection?.currency_code]
  )

  const completeOrder = useCallback(async () => {
    const order = await placeOrder()
    window.location.assign(`/${order.countryCode}/order/${order.orderId}/confirmed`)
  }, [])

  const ensurePayPalSession = useCallback(async () => {
    const existingOrderId = resolvePayPalOrderId(workingCollection, resolvedPayPalProviderId)
    if (existingOrderId) {
      return existingOrderId
    }

    const paymentCollectionId = workingCollection?.id
    if (!paymentCollectionId) {
      throw new Error("Missing payment collection. Please refresh and try again.")
    }

    const response = await sdk.client.fetch<{ payment_collection: PaymentCollectionLike }>(
      `/store/payment-collections/${paymentCollectionId}/payment-sessions`,
      {
        method: "POST",
        body: {
          provider_id: resolvedPayPalProviderId,
        },
        cache: "no-store",
      }
    )

    const nextCollection = response?.payment_collection || workingCollection
    setWorkingCollection(nextCollection)
    setWorkingCart((current) =>
      current
        ? {
            ...current,
            payment_collection: nextCollection,
          }
        : current
    )

    const nextOrderId = resolvePayPalOrderId(nextCollection, resolvedPayPalProviderId)
    if (!nextOrderId) {
      throw new Error("Failed to initialize a PayPal order for this cart.")
    }

    return nextOrderId
  }, [resolvedPayPalProviderId, workingCollection])

  const createOrder = useCallback(async () => {
    setErrorMessage(null)
    return ensurePayPalSession()
  }, [ensurePayPalSession])

  const handleApprove = useCallback(
    async (_data?: any, actions?: any) => {
      setSubmitting(true)
      setErrorMessage(null)
      try {
        if (actions?.order?.authorize) {
          await actions.order.authorize()
        }

        await completeOrder()
      } catch (error) {
        setErrorMessage(toErrorMessage(error, "Failed to place order after PayPal approval."))
      } finally {
        setSubmitting(false)
      }
    },
    [completeOrder]
  )

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

  const renderMethodDetail = (method: PayPalMethodType) => {
    if (method === "paypal_wallet" || method === "paypal_pay_later") {
      const isPayLater = method === "paypal_pay_later"
      return (
        <div className="max-w-md pt-2 space-y-2">
          {isPayLater && <PayIn4Badge />}
          <PayPalButtons
            fundingSource={(isPayLater ? "paylater" : "paypal") as any}
            style={{
              layout: "horizontal",
              label: isPayLater ? "installment" : "paypal",
              tagline: false,
              height: 40,
            }}
            forceReRender={[currencyCode, isPayLater ? "paylater" : "paypal"]}
            createOrder={createOrder}
            onApprove={handleApprove}
            onCancel={() => {
              setErrorMessage("PayPal checkout was canceled.")
            }}
            onError={(error) => {
              setErrorMessage(toErrorMessage(error, "PayPal checkout failed. Please try again."))
            }}
          />
        </div>
      )
    }

    return (
      <div className="max-w-md pt-2 space-y-4">
        <PayPalCardFieldsProvider
          createOrder={createOrder}
          onApprove={handleApprove}
          onError={(error) => {
            setErrorMessage(toErrorMessage(error, "Card payment failed. Please try again."))
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

      {!paypalClientId && (
        <ErrorMessage
          error="PayPal configuration is missing. Set NEXT_PUBLIC_PAYPAL_CLIENT_ID."
          data-testid="paypal-payment-config-error-message"
        />
      )}

      {loadingClientToken && <div className="py-4 text-sm text-gray-500">Loading PayPal checkout...</div>}

      {!paypalClientId
        ? null
        : !loadingClientToken &&
          clientToken && (
            <PayPalScriptProvider
              options={{
                clientId: paypalClientId,
                components: "buttons,card-fields",
                currency: currencyCode,
                intent: "authorize",
                dataClientToken: clientToken,
              }}
            >
              <CustomPaymentSelector
                availableMethods={PAYPAL_METHODS}
                selectedMethod={selectedMethod}
                onMethodSelect={(method) => {
                  setSelectedMethod(method)
                  setErrorMessage(null)
                }}
                renderPaymentDetails={renderMethodDetail}
              />
            </PayPalScriptProvider>
          )}

      <ErrorMessage error={errorMessage} data-testid="paypal-payment-error-message" />
    </div>
  )
}

export default PayPalCartPayment
