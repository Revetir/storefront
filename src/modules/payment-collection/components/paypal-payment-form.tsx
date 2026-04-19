"use client"

import { sdk } from "@lib/config"
import { Button, Heading } from "@medusajs/ui"
import ErrorMessage from "@modules/checkout/components/error-message"
import CustomPaymentSelector from "@modules/checkout/components/payment/custom-payment-selector"
import Divider from "@modules/common/components/divider"
import Amex from "@modules/common/icons/amex"
import ApplePayIcon from "@modules/common/icons/apple-pay"
import Discover from "@modules/common/icons/discover"
import Mastercard from "@modules/common/icons/mastercard"
import PayPalPPIcon from "@modules/common/icons/paypal-pp"
import Visa from "@modules/common/icons/visa"
import { checkWalletAvailability } from "@lib/util/wallet-availability"
import {
  PayPalButtons,
  PayPalCVVField,
  PayPalCardFieldsProvider,
  PayPalExpiryField,
  PayPalNumberField,
  PayPalScriptProvider,
  usePayPalCardFields,
} from "@paypal/react-paypal-js"
import { useCallback, useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"

type PayPalMethodType =
  | "paypal_card"
  | "paypal_wallet"
  | "paypal_apple_pay"

const PAYMENT_COLLECTION_REVIEW_ACTION_SLOT_ID = "payment-collection-review-payment-action-slot"

type PayPalMethodConfig = {
  id: PayPalMethodType
  label: string
  icons: React.ComponentType[]
}

const PAYPAL_METHODS: PayPalMethodConfig[] = [
  {
    id: "paypal_card",
    label: "Pay with credit or debit card",
    icons: [Visa, Mastercard, Amex, Discover],
  },
  {
    id: "paypal_wallet",
    label: "Pay with PayPal",
    icons: [PayPalPPIcon],
  },
  {
    id: "paypal_apple_pay",
    label: "Pay with Apple Pay",
    icons: [ApplePayIcon],
  },
]

const PAYPAL_CARD_FIELD_STYLE = {
  input: {
    "font-size": "14px",
    "font-family": "Satoshi, Segoe UI, Roboto, Helvetica Neue, Ubuntu, sans-serif",
    color: "#111827",
    background: "#ffffff",
    border: "1px solid #d1d5db",
    "border-radius": "0",
    padding: "10px 12px",
    "line-height": "20px",
    "box-shadow": "none",
    outline: "none",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  ":focus": {
    border: "1px solid #000000",
    "box-shadow": "none",
  },
  "::placeholder": {
    color: "#6b7280",
  },
  ".invalid": {
    color: "#dc2626",
    border: "1px solid #ef4444",
    "box-shadow": "none",
  },
  ".valid": {
    border: "1px solid #d1d5db",
  },
} as const

const PAYPAL_FIELD_LABEL_CLASS = "block text-sm font-medium text-gray-700 mb-1"
const PAYPAL_FIELD_HOST_CLASS = "paypal-card-field-host"

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
      variant="transparent"
      disabled={!cardFieldsForm || disabled || submitting}
      onClick={handleSubmit}
      isLoading={submitting}
      className="w-full h-10 uppercase !rounded-none !bg-black !text-white hover:!bg-neutral-900 transition-colors duration-200 cursor-pointer !shadow-none after:!hidden focus-visible:!shadow-none [&>span>div]:!rounded-none"
      data-testid="paypal-payment-collection-card-submit"
    >
      Place order
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
  const [selectedMethod, setSelectedMethod] = useState<PayPalMethodType>("paypal_card")
  const [clientToken, setClientToken] = useState<string | null>(null)
  const [loadingClientToken, setLoadingClientToken] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [walletAvailability, setWalletAvailability] = useState({
    applePay: false,
  })
  const [reviewActionSlot, setReviewActionSlot] = useState<HTMLElement | null>(null)
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || ""

  useEffect(() => {
    setCollection(paymentCollection)
  }, [paymentCollection])

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const availability = checkWalletAvailability()
    setWalletAvailability({
      applePay: availability.applePay,
    })
  }, [])

  useEffect(() => {
    if (typeof document === "undefined") {
      return
    }

    const resolveSlot = () => {
      setReviewActionSlot(document.getElementById(PAYMENT_COLLECTION_REVIEW_ACTION_SLOT_ID))
    }

    resolveSlot()

    const observer = new MutationObserver(resolveSlot)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
    }
  }, [])

  const currencyCode = useMemo(
    () => String(order?.currency_code || paymentCollection.currency_code || "usd").toUpperCase(),
    [order?.currency_code, paymentCollection.currency_code]
  )

  const availableMethods = useMemo(() => {
    return PAYPAL_METHODS.filter((method) => {
      if (method.id === "paypal_apple_pay") {
        return walletAvailability.applePay
      }

      return true
    })
  }, [walletAvailability.applePay])

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

    try {
      // Always refresh the provider session so PayPal uses the latest order totals.
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
        throw new Error("Failed to initialize a PayPal order for this cart.")
      }

      return orderId
    } catch (error) {
      const message = toErrorMessage(
        error,
        "Checkout is missing required information. Please review your details and try again."
      )
      setErrorMessage(message)
      throw new Error(message)
    }
  }, [collection, paymentCollectionId, paypalProviderId])

  const handleApprove = useCallback(
    async () => {
      setSubmitting(true)
      setErrorMessage(null)
      try {
        redirectToCaptureValidation()
      } catch (error) {
        setErrorMessage(
          toErrorMessage(error, "PayPal approval succeeded, but finalization failed.")
        )
      } finally {
        setSubmitting(false)
      }
    },
    [redirectToCaptureValidation]
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
    if (
      method === "paypal_wallet" ||
      method === "paypal_apple_pay"
    ) {
      return null
    }

    return (
      <PayPalCardFieldsProvider
        createOrder={createOrder}
        onApprove={handleApprove}
        onError={(error) => {
          setErrorMessage(toErrorMessage(error, "Card payment failed. Please try again."))
        }}
        style={PAYPAL_CARD_FIELD_STYLE as any}
      >
        <div className="max-w-md pt-2 space-y-3 paypal-card-fields-stack">
          <div>
            <label className={PAYPAL_FIELD_LABEL_CLASS}>Card Number</label>
            <PayPalNumberField
              placeholder="1234 1234 1234 1234"
              className={PAYPAL_FIELD_HOST_CLASS}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={PAYPAL_FIELD_LABEL_CLASS}>Expiration</label>
              <PayPalExpiryField placeholder="MM/YY" className={PAYPAL_FIELD_HOST_CLASS} />
            </div>
            <div>
              <label className={PAYPAL_FIELD_LABEL_CLASS}>Security Code</label>
              <PayPalCVVField placeholder="CVV" className={PAYPAL_FIELD_HOST_CLASS} />
            </div>
          </div>
        </div>
        {reviewActionSlot &&
          createPortal(
            <PayPalCardSubmitButton
              disabled={submitting}
              onSubmitStart={() => {
                setSubmitting(true)
                setErrorMessage(null)
              }}
              onSubmitEnd={() => {
                setSubmitting(false)
              }}
            />,
            reviewActionSlot
          )}
      </PayPalCardFieldsProvider>
    )
  }

  const walletReviewAction =
    reviewActionSlot &&
    (selectedMethod === "paypal_wallet" ||
      selectedMethod === "paypal_apple_pay")
      ? createPortal(
          <div className="w-full space-y-2">
            {(() => {
              const fundingSource =
                selectedMethod === "paypal_apple_pay"
                    ? "applepay"
                    : "paypal"
              const isWalletLikeMethod = selectedMethod === "paypal_wallet"
              return (
            <PayPalButtons
              fundingSource={fundingSource as any}
              style={{
                layout: "horizontal",
                ...(isWalletLikeMethod ? { label: "paypal" } : {}),
                color:
                  selectedMethod === "paypal_apple_pay"
                    ? "black"
                    : "gold",
                shape: "rect",
                borderRadius: 0,
                tagline: false,
                height: 40,
              }}
              forceReRender={[currencyCode, selectedMethod]}
              createOrder={createOrder}
              onApprove={handleApprove}
              onCancel={() => {
                setErrorMessage("PayPal checkout was canceled.")
              }}
              onError={(error) => {
                setErrorMessage(toErrorMessage(error, "PayPal checkout failed. Please try again."))
              }}
            />
              )
            })()}
          </div>,
          reviewActionSlot
        )
      : null

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

      {loadingClientToken && <div className="py-4 text-sm text-gray-500">Loading PayPal checkout...</div>}

      {!paypalClientId
        ? null
        : !loadingClientToken &&
          clientToken && (
            <PayPalScriptProvider
              options={{
                clientId: paypalClientId,
                components: "buttons,card-fields",
                enableFunding: "applepay",
                currency: currencyCode,
                intent: "authorize",
                dataClientToken: clientToken,
              }}
            >
              <CustomPaymentSelector
                availableMethods={availableMethods}
                selectedMethod={selectedMethod}
                onMethodSelect={(method) => {
                  setSelectedMethod(method)
                  setErrorMessage(null)
                }}
                renderPaymentDetails={renderMethodDetail}
              />
              {walletReviewAction}
            </PayPalScriptProvider>
          )}

      <ErrorMessage error={errorMessage} data-testid="paypal-payment-collection-error-message" />
    </div>
  )
}

export default PayPalPaymentCollectionForm
