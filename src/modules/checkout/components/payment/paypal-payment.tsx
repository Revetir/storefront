"use client"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { Button, Heading } from "@medusajs/ui"
import ErrorMessage from "@modules/checkout/components/error-message"
import { usePaymentContext } from "@modules/checkout/components/payment/payment-context"
import CustomPaymentSelector from "@modules/checkout/components/payment/custom-payment-selector"
import { scrollToTop, triggerFieldErrors, validateCheckout } from "@modules/checkout/utils/validate-checkout"
import Divider from "@modules/common/components/divider"
import Amex from "@modules/common/icons/amex"
import Discover from "@modules/common/icons/discover"
import Mastercard from "@modules/common/icons/mastercard"
import PayPalIcon from "@modules/common/icons/paypal"
import Visa from "@modules/common/icons/visa"
import {
  PayPalButtons,
  PayPalCVVField,
  PayPalCardFieldsProvider,
  PayPalExpiryField,
  PayPalNumberField,
  PayPalScriptProvider,
  usePayPalCardFields,
} from "@paypal/react-paypal-js"
import { useParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"

const DEFAULT_PAYPAL_PROVIDER_ID = "pp_paypal_paypal"
const CHECKOUT_REVIEW_ACTION_SLOT_ID = "checkout-review-payment-action-slot"

type PayPalMethodType = "paypal_wallet" | "paypal_pay_later" | "paypal_card"

type PayPalMethodConfig = {
  id: PayPalMethodType
  label: string
  icons: React.ComponentType[]
}

type PaymentSession = {
  provider_id?: string
  status?: string
  amount?: number
  data?: Record<string, any>
}

type PaymentCollectionLike = {
  id?: string
  currency_code?: string
  amount?: number
  payment_sessions?: PaymentSession[]
}

type CartLike = HttpTypes.StoreCart & {
  payment_collection?: PaymentCollectionLike | null
}

type PayPalCartPaymentProps = {
  cart: CartLike
  paypalProviderId?: string
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
    border: "1px solid transparent",
    "box-shadow": "0 0 0 2px #000000",
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

const resolveCountryCodeForRedirect = (
  routeCountryCode: string | string[] | undefined,
  cartLike: CartLike | null | undefined
) => {
  const fromRoute = Array.isArray(routeCountryCode)
    ? routeCountryCode[0]
    : routeCountryCode

  return (
    fromRoute?.toLowerCase() ||
    cartLike?.shipping_address?.country_code?.toLowerCase() ||
    cartLike?.billing_address?.country_code?.toLowerCase() ||
    "us"
  )
}

const readAutocompleteFieldValue = (testId: string): string | undefined => {
  if (typeof window === "undefined") return undefined

  const container = document.querySelector(
    `[data-testid="${testId}"]`
  ) as HTMLElement | null
  const input = container?.querySelector(
    ".radar-autocomplete-input"
  ) as HTMLInputElement | null

  if (!input) {
    return undefined
  }

  return input.value?.trim() ?? ""
}

const readFieldValue = (name: string): string | undefined => {
  if (typeof window === "undefined") return undefined

  const field = document.querySelector(
    `[name="${name}"]`
  ) as HTMLInputElement | HTMLSelectElement | null

  if (field) {
    return field.value?.trim() ?? ""
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
  let hasAnyField = false

  ADDRESS_FIELDS.forEach((field) => {
    const value = readFieldValue(`${prefix}.${field}`)
    if (value !== undefined) {
      hasAnyField = true
      address[field] = value
    }
  })

  return hasAnyField ? address : null
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

  if (!cart.id) {
    return cart
  }

  try {
    const response = await sdk.store.cart.update(cart.id, updateData, {}, {})
    return response?.cart || cart
  } catch (error) {
    // If cart save fails here, keep going and let field validation surface actionable errors.
    return cart
  }
}

const fetchCheckoutCartForPayment = async (cartId: string): Promise<CartLike | null> => {
  const attempts: Array<Record<string, unknown> | undefined> = [
    {
      fields:
        "id,email,currency_code,*shipping_methods,*shipping_address,*billing_address,*payment_collection,*payment_collection.payment_sessions,+total,+subtotal,+tax_total,+shipping_total,+payment_collection.amount,+payment_collection.currency_code,+payment_collection.payment_sessions.amount,+payment_collection.payment_sessions.provider_id,+payment_collection.payment_sessions.status,+payment_collection.payment_sessions.data",
    },
    undefined,
  ]

  for (const query of attempts) {
    try {
      const response = await sdk.client.fetch<{ cart: CartLike }>(`/store/carts/${cartId}`, {
        method: "GET",
        ...(query ? { query } : {}),
        cache: "no-store",
      })

      if (response?.cart) {
        return response.cart
      }
    } catch {
      // Fall through to the next retrieval strategy.
    }
  }

  return null
}

const ensureCartPaymentCollection = async (
  cartId: string
): Promise<PaymentCollectionLike | null> => {
  try {
    const response = await sdk.client.fetch<{ payment_collection?: PaymentCollectionLike }>(
      "/store/payment-collections",
      {
        method: "POST",
        body: {
          cart_id: cartId,
        },
        cache: "no-store",
      }
    )

    return response?.payment_collection || null
  } catch {
    return null
  }
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
  const [selectedMethod, setSelectedMethod] = useState<PayPalMethodType>("paypal_wallet")
  const [clientToken, setClientToken] = useState<string | null>(null)
  const [loadingClientToken, setLoadingClientToken] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [reviewActionSlot, setReviewActionSlot] = useState<HTMLElement | null>(null)
  const { setSelectedPaymentMethod } = usePaymentContext()
  const params = useParams()
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || ""
  const resolvedPayPalProviderId = paypalProviderId || DEFAULT_PAYPAL_PROVIDER_ID

  useEffect(() => {
    setSelectedPaymentMethod(selectedMethod)
  }, [selectedMethod, setSelectedPaymentMethod])

  useEffect(() => {
    return () => {
      setSelectedPaymentMethod(null)
    }
  }, [setSelectedPaymentMethod])

  useEffect(() => {
    if (typeof document === "undefined") {
      return
    }

    const resolveSlot = () => {
      setReviewActionSlot(document.getElementById(CHECKOUT_REVIEW_ACTION_SLOT_ID))
    }

    resolveSlot()

    const observer = new MutationObserver(resolveSlot)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
    }
  }, [])

  const currencyCode = useMemo(
    () => String(cart?.currency_code || cart?.payment_collection?.currency_code || "usd").toUpperCase(),
    [cart?.currency_code, cart?.payment_collection?.currency_code]
  )

  const redirectToCheckoutCompletion = useCallback(() => {
    if (!cart?.id) {
      throw new Error("Missing checkout cart. Please refresh and try again.")
    }

    const countryCode = resolveCountryCodeForRedirect(
      params?.countryCode as string | string[] | undefined,
      cart
    )

    const completionUrl = new URL(
      `/api/complete-checkout/${cart.id}`,
      window.location.origin
    )
    completionUrl.searchParams.set("country_code", countryCode)

    window.location.assign(completionUrl.toString())
  }, [cart, params?.countryCode])

  const validateAndPrepareCheckout = useCallback(async (): Promise<CartLike> => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("checkout:submit-intent"))
    }

    const currentCart = cart as HttpTypes.StoreCart

    if (!currentCart?.id) {
      throw new Error("Missing checkout cart. Please refresh and try again.")
    }

    const syncedCart = await syncCartFromCheckoutForm(currentCart)

    const refreshedCart = await fetchCheckoutCartForPayment(currentCart.id)
    const checkoutCart = (refreshedCart || (syncedCart as CartLike)) as CartLike

    if (!checkoutCart.payment_collection?.id) {
      const fallbackCollection = cart?.payment_collection || null
      if (fallbackCollection?.id) {
        checkoutCart.payment_collection = {
          ...(fallbackCollection as any),
          ...((checkoutCart.payment_collection || {}) as any),
          id: fallbackCollection.id,
        } as any
      }
    }

    if (!checkoutCart.shipping_methods?.length) {
      throw new Error("Please select a shipping method before continuing.")
    }

    const validationErrors = validateCheckout(checkoutCart)
    if (validationErrors.length > 0) {
      scrollToTop()
      triggerFieldErrors(validationErrors)
      throw new Error("Please complete all required checkout fields before placing your order.")
    }

    return checkoutCart
  }, [cart])

  const ensurePayPalSession = useCallback(async () => {
    const preparedCart = await validateAndPrepareCheckout()

    let paymentCollection: PaymentCollectionLike | null =
      (preparedCart.payment_collection as PaymentCollectionLike | null) || null
    let paymentCollectionId = paymentCollection?.id

    if (!paymentCollectionId && preparedCart.id) {
      const createdCollection = await ensureCartPaymentCollection(preparedCart.id)

      if (createdCollection?.id) {
        paymentCollection = createdCollection
        paymentCollectionId = createdCollection.id
      }
    }

    if (!paymentCollectionId) {
      throw new Error("Missing payment collection. Please refresh and try again.")
    }

    // Always refresh the provider session so PayPal uses the latest cart totals (including tax).
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

    const nextCollection = response?.payment_collection || paymentCollection
    const nextOrderId = resolvePayPalOrderId(nextCollection, resolvedPayPalProviderId)
    if (!nextOrderId) {
      throw new Error("Failed to initialize a PayPal order for this cart.")
    }

    return nextOrderId
  }, [resolvedPayPalProviderId, validateAndPrepareCheckout])

  const createOrder = useCallback(async () => {
    setErrorMessage(null)

    try {
      return await ensurePayPalSession()
    } catch (error) {
      const message = toErrorMessage(
        error,
        "Checkout is missing required information. Please review your details and try again."
      )
      setErrorMessage(message)
      throw new Error(message)
    }
  }, [ensurePayPalSession])

  const handleApprove = useCallback(
    async () => {
      setSubmitting(true)
      setErrorMessage(null)
      try {
        redirectToCheckoutCompletion()
      } catch (error) {
        setErrorMessage(toErrorMessage(error, "Failed to place order after PayPal approval."))
      } finally {
        setSubmitting(false)
      }
    },
    [redirectToCheckoutCompletion]
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
        <style jsx global>{`
          .paypal-card-fields-stack .paypal-card-field-host {
            width: 100%;
            min-height: 40px;
            border: 0;
            background: transparent;
            border-radius: 0;
            box-sizing: border-box;
            display: block;
          }

          .paypal-card-fields-stack .paypal-card-field-host:focus-within {
            border: 0;
            outline: none;
            box-shadow: none;
          }

          .paypal-card-fields-stack .paypal-card-field-host > div {
            width: 100%;
            min-height: 38px;
            border: 0 !important;
            border-radius: 0 !important;
            background: transparent !important;
            box-shadow: none !important;
            outline: none !important;
          }

          .paypal-card-fields-stack .paypal-card-field-host > div > div {
            border: 0 !important;
            border-radius: 0 !important;
            background: transparent !important;
            box-shadow: none !important;
            outline: none !important;
          }

          .paypal-card-fields-stack .paypal-card-field-host [data-client-version] {
            border: 0 !important;
            border-radius: 0 !important;
            background: transparent !important;
            box-shadow: none !important;
            outline: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .paypal-card-fields-stack .paypal-card-field-host [data-client-version]:focus-within {
            border: 0 !important;
            box-shadow: none !important;
            outline: none !important;
          }

          .paypal-card-fields-stack .paypal-card-field-host iframe {
            border: 0 !important;
            width: 100% !important;
            min-height: 24px !important;
            display: block !important;
            background: transparent !important;
          }
        `}</style>

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
    reviewActionSlot && (selectedMethod === "paypal_wallet" || selectedMethod === "paypal_pay_later")
      ? createPortal(
          <div className="w-full space-y-2">
            <PayPalButtons
              fundingSource={(selectedMethod === "paypal_pay_later" ? "paylater" : "paypal") as any}
              style={{
                layout: "horizontal",
                label: selectedMethod === "paypal_pay_later" ? "installment" : "paypal",
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
              {walletReviewAction}
            </PayPalScriptProvider>
          )}

      <ErrorMessage error={errorMessage} data-testid="paypal-payment-error-message" />
    </div>
  )
}

export default PayPalCartPayment
