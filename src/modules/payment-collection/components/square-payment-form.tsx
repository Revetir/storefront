"use client"

import { sdk } from "@lib/config"
import { Button, Heading, clx } from "@medusajs/ui"
import ErrorMessage from "@modules/checkout/components/error-message"
import CustomPaymentSelector from "@modules/checkout/components/payment/custom-payment-selector"
import Divider from "@modules/common/components/divider"
import Amex from "@modules/common/icons/amex"
import ApplePayIcon from "@modules/common/icons/apple-pay"
import Discover from "@modules/common/icons/discover"
import GooglePayIcon from "@modules/common/icons/google-pay"
import Mastercard from "@modules/common/icons/mastercard"
import Visa from "@modules/common/icons/visa"
import { checkWalletAvailability } from "@lib/util/wallet-availability"
import {
  formatSquareDisplayAmount,
  loadSquareScript,
  readSquareTokenOrThrow,
  resolveSquareSourceType,
  SQUARE_CARD_STYLE,
  type SquareCheckoutMethodType,
  type SquareMethodInstance,
  type SquarePayments,
  type SquarePaymentRequest,
} from "@lib/util/square-web-payments"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"

const PAYMENT_COLLECTION_REVIEW_ACTION_SLOT_ID = "payment-collection-review-payment-action-slot"
const SQUARE_CARD_CONTAINER_ID = "square-payment-collection-card-container"
const SQUARE_WALLET_BUTTON_CONTAINER_ID = "square-payment-collection-wallet-button-container"
const SQUARE_GOOGLE_PAY_BUTTON_OPTIONS = {
  buttonColor: "black",
  buttonType: "long",
  buttonSizeMode: "fill",
  buttonRadius: 0,
  buttonBorderType: "no_border",
} as const
const SQUARE_APPLE_PAY_BUTTON_CLASSNAME =
  "w-full h-10 rounded-none border-0 cursor-pointer"

type SquareWalletMethodType = Exclude<SquareCheckoutMethodType, "square_card">

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

type SquareMethodConfig = {
  id: SquareCheckoutMethodType
  label: string
  icons: React.ComponentType[]
}

type SquarePaymentCollectionFormProps = {
  paymentCollectionId: string
  paymentCollection: PaymentCollection
  order: any
  countryCode: string
  squareProviderId: string
}

const SQUARE_METHODS: SquareMethodConfig[] = [
  {
    id: "square_card",
    label: "Pay with credit or debit card",
    icons: [Visa, Mastercard, Amex, Discover],
  },
  {
    id: "square_apple_pay",
    label: "Pay with Apple Pay",
    icons: [ApplePayIcon],
  },
  {
    id: "square_google_pay",
    label: "Pay with Google Pay",
    icons: [GooglePayIcon],
  },
]

const toErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message
  }

  if (typeof error === "string" && error.trim()) {
    return error
  }

  return fallback
}

const resolveSquareCountryCode = ({
  order,
  countryCode,
}: {
  order: any
  countryCode: string
}) => {
  return (
    String(order?.shipping_address?.country_code || "").toUpperCase() ||
    String(order?.billing_address?.country_code || "").toUpperCase() ||
    String(countryCode || "").toUpperCase() ||
    "US"
  )
}

const resolvePaymentAmount = ({
  paymentCollection,
  order,
}: {
  paymentCollection: PaymentCollection
  order: any
}) => {
  const collectionAmount = Number(paymentCollection?.amount)
  if (Number.isFinite(collectionAmount) && collectionAmount > 0) {
    return collectionAmount
  }

  const orderTotal = Number(order?.total)
  if (Number.isFinite(orderTotal) && orderTotal > 0) {
    return orderTotal
  }

  return 0
}

const SquarePaymentCollectionForm = ({
  paymentCollectionId,
  paymentCollection,
  order,
  countryCode,
  squareProviderId,
}: SquarePaymentCollectionFormProps) => {
  const [collection, setCollection] = useState<PaymentCollection>(paymentCollection)
  const [selectedMethod, setSelectedMethod] =
    useState<SquareCheckoutMethodType>("square_card")
  const [sdkReady, setSdkReady] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [walletAvailability, setWalletAvailability] = useState({
    applePay: false,
    googlePay: false,
  })
  const [reviewActionSlot, setReviewActionSlot] = useState<HTMLElement | null>(null)

  const squareApplicationId =
    process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID || ""
  const squareLocationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || ""
  const isSquareSandbox =
    process.env.NEXT_PUBLIC_SQUARE_IS_SANDBOX === "true"
  const currencyCode = useMemo(
    () => String(order?.currency_code || paymentCollection.currency_code || "usd").toUpperCase(),
    [order?.currency_code, paymentCollection.currency_code]
  )

  const paymentsRef = useRef<SquarePayments | null>(null)
  const cardRef = useRef<SquareMethodInstance | null>(null)
  const walletMethodRef = useRef<SquareMethodInstance | null>(null)
  const walletMethodTypeRef = useRef<SquareWalletMethodType | null>(null)
  const walletHostRef = useRef<HTMLElement | null>(null)
  const walletClickHandlerRef = useRef<((event: Event) => void) | null>(null)
  const walletSubmitRef = useRef<() => void>(() => undefined)

  const detachWalletButton = useCallback(() => {
    if (walletHostRef.current && walletClickHandlerRef.current) {
      walletHostRef.current.removeEventListener("click", walletClickHandlerRef.current)
    }

    walletHostRef.current = null
    walletClickHandlerRef.current = null
    walletMethodTypeRef.current = null

    const activeWalletMethod = walletMethodRef.current
    walletMethodRef.current = null
    if (activeWalletMethod?.destroy) {
      void activeWalletMethod.destroy().catch(() => undefined)
    }
  }, [])

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
      googlePay: availability.googlePay,
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

  const availableMethods = useMemo(() => {
    return SQUARE_METHODS.filter((method) => {
      if (method.id === "square_apple_pay") {
        return walletAvailability.applePay
      }
      if (method.id === "square_google_pay") {
        return walletAvailability.googlePay
      }
      return true
    })
  }, [walletAvailability.applePay, walletAvailability.googlePay])

  useEffect(() => {
    if (!availableMethods.some((method) => method.id === selectedMethod)) {
      setSelectedMethod(availableMethods[0]?.id || "square_card")
    }
  }, [availableMethods, selectedMethod])

  useEffect(() => {
    let isMounted = true

    const initializeSquare = async () => {
      if (!squareApplicationId || !squareLocationId) {
        setErrorMessage(
          "Square configuration is missing. Set NEXT_PUBLIC_SQUARE_APPLICATION_ID and NEXT_PUBLIC_SQUARE_LOCATION_ID."
        )
        return
      }

      try {
        await loadSquareScript(isSquareSandbox)
        if (!isMounted) {
          return
        }

        if (!window.Square) {
          throw new Error("Square SDK did not initialize.")
        }

        const payments = window.Square.payments(
          squareApplicationId,
          squareLocationId
        )
        paymentsRef.current = payments

        const card = await payments.card({
          style: SQUARE_CARD_STYLE,
        })
        if (!card.attach) {
          throw new Error("Square card attach API is unavailable.")
        }
        await card.attach(`#${SQUARE_CARD_CONTAINER_ID}`)
        cardRef.current = card

        if (isMounted) {
          setSdkReady(true)
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            toErrorMessage(error, "Failed to initialize Square checkout. Please refresh and try again.")
          )
        }
      }
    }

    void initializeSquare()

    return () => {
      isMounted = false
      detachWalletButton()
      if (cardRef.current?.destroy) {
        void cardRef.current.destroy()
      }
      cardRef.current = null
      paymentsRef.current = null
    }
  }, [detachWalletButton, isSquareSandbox, squareApplicationId, squareLocationId])

  const buildWalletPaymentRequest = useCallback(
    (payments: SquarePayments): SquarePaymentRequest => {
      const paymentAmount = resolvePaymentAmount({
        paymentCollection: collection,
        order,
      })
      if (!paymentAmount) {
        throw new Error("Missing order total for payment request.")
      }

      return payments.paymentRequest({
        countryCode: resolveSquareCountryCode({ order, countryCode }),
        currencyCode,
        total: {
          amount: formatSquareDisplayAmount(paymentAmount, currencyCode),
          label: "Total",
        },
      })
    },
    [collection, countryCode, currencyCode, order]
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

  const createSessionWithToken = useCallback(
    async (sourceToken: string, sourceType: string) => {
      const response = await sdk.client.fetch<{ payment_collection: PaymentCollection }>(
        `/store/payment-collections/${paymentCollectionId}/payment-sessions`,
        {
          method: "POST",
          body: {
            provider_id: squareProviderId,
            data: {
              source_id: sourceToken,
              source_type: sourceType,
              location_id: squareLocationId,
            },
          },
          cache: "no-store",
        }
      )

      if (response?.payment_collection) {
        setCollection(response.payment_collection)
      }

      await sdk.client.fetch<{ payment_collection: PaymentCollection }>(
        `/store/payment-collections/${paymentCollectionId}/authorize`,
        {
          method: "POST",
          cache: "no-store",
        }
      )
    },
    [paymentCollectionId, squareLocationId, squareProviderId]
  )

  const tokenizeSelectedMethod = useCallback(async (): Promise<{
    token: string
    sourceType: string
  }> => {
    const payments = paymentsRef.current
    if (!payments) {
      throw new Error("Square is still initializing. Please try again.")
    }

    if (selectedMethod === "square_card") {
      if (!cardRef.current) {
        throw new Error("Card entry is not ready. Please refresh and try again.")
      }

      const tokenResult = await cardRef.current.tokenize()
      const token = readSquareTokenOrThrow(tokenResult)
      return {
        token,
        sourceType: resolveSquareSourceType({
          selectedMethod,
          tokenMethod: tokenResult.details?.method,
        }),
      }
    }

    const attachedWalletMethod =
      walletMethodTypeRef.current === selectedMethod
        ? walletMethodRef.current
        : null

    if (attachedWalletMethod) {
      const tokenResult = await attachedWalletMethod.tokenize()
      const token = readSquareTokenOrThrow(tokenResult)
      return {
        token,
        sourceType: resolveSquareSourceType({
          selectedMethod,
          tokenMethod: tokenResult.details?.method,
        }),
      }
    }

    const paymentRequest = buildWalletPaymentRequest(payments)
    const methodInstance =
      selectedMethod === "square_apple_pay"
        ? await payments.applePay(paymentRequest)
        : await payments.googlePay(paymentRequest)

    try {
      const tokenResult = await methodInstance.tokenize()
      const token = readSquareTokenOrThrow(tokenResult)
      return {
        token,
        sourceType: resolveSquareSourceType({
          selectedMethod,
          tokenMethod: tokenResult.details?.method,
        }),
      }
    } finally {
      if (methodInstance.destroy) {
        await methodInstance.destroy().catch(() => undefined)
      }
    }
  }, [buildWalletPaymentRequest, selectedMethod])

  const handleSubmit = useCallback(async () => {
    if (submitting) {
      return
    }

    setSubmitting(true)
    setErrorMessage(null)

    try {
      const { token, sourceType } = await tokenizeSelectedMethod()
      await createSessionWithToken(token, sourceType)
      redirectToCaptureValidation()
    } catch (error) {
      setErrorMessage(
        toErrorMessage(error, "Square checkout failed. Please review your details and try again.")
      )
    } finally {
      setSubmitting(false)
    }
  }, [createSessionWithToken, redirectToCaptureValidation, submitting, tokenizeSelectedMethod])

  useEffect(() => {
    walletSubmitRef.current = () => {
      void handleSubmit()
    }
  }, [handleSubmit])

  useEffect(() => {
    if (!sdkReady || !reviewActionSlot || selectedMethod === "square_card") {
      detachWalletButton()
      return
    }

    let isMounted = true

    const setupWalletButton = async () => {
      try {
        const payments = paymentsRef.current
        if (!payments) {
          return
        }

        const host = document.getElementById(SQUARE_WALLET_BUTTON_CONTAINER_ID)
        if (!host) {
          return
        }

        detachWalletButton()
        host.innerHTML = ""

        const paymentRequest = buildWalletPaymentRequest(payments)
        const methodInstance =
          selectedMethod === "square_apple_pay"
            ? await payments.applePay(paymentRequest)
            : await payments.googlePay(paymentRequest)
        let clickTarget: HTMLElement = host

        if (selectedMethod === "square_google_pay") {
          if (!methodInstance.attach) {
            throw new Error("Square wallet button attach API is unavailable.")
          }

          await methodInstance.attach(`#${SQUARE_WALLET_BUTTON_CONTAINER_ID}`, {
            ...SQUARE_GOOGLE_PAY_BUTTON_OPTIONS,
          })
        } else {
          const applePayButton = document.createElement("button")
          applePayButton.type = "button"
          applePayButton.className = SQUARE_APPLE_PAY_BUTTON_CLASSNAME
          applePayButton.setAttribute("aria-label", "Apple Pay")
          applePayButton.textContent = ""
          applePayButton.style.setProperty("-webkit-appearance", "-apple-pay-button")
          applePayButton.style.setProperty("-apple-pay-button-style", "black")
          applePayButton.style.setProperty("-apple-pay-button-type", "plain")
          applePayButton.style.setProperty("border-radius", "0")
          applePayButton.style.setProperty("border", "0")
          applePayButton.style.setProperty("width", "100%")
          applePayButton.style.setProperty("height", "40px")
          host.appendChild(applePayButton)
          clickTarget = applePayButton
        }

        if (!isMounted) {
          if (methodInstance.destroy) {
            await methodInstance.destroy().catch(() => undefined)
          }
          return
        }

        const clickHandler = () => {
          walletSubmitRef.current()
        }

        clickTarget.addEventListener("click", clickHandler)
        walletHostRef.current = clickTarget
        walletClickHandlerRef.current = clickHandler
        walletMethodRef.current = methodInstance
        walletMethodTypeRef.current = selectedMethod
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            toErrorMessage(
              error,
              "Square wallet checkout failed to initialize for this browser/device."
            )
          )
        }
      }
    }

    void setupWalletButton()

    return () => {
      isMounted = false
      detachWalletButton()
    }
  }, [
    buildWalletPaymentRequest,
    detachWalletButton,
    reviewActionSlot,
    sdkReady,
    selectedMethod,
  ])

  const cardReviewAction =
    reviewActionSlot &&
    selectedMethod === "square_card" &&
    createPortal(
      <Button
        variant="transparent"
        disabled={!sdkReady || submitting}
        onClick={handleSubmit}
        isLoading={submitting}
        className="w-full h-10 uppercase !rounded-none !bg-black !text-white hover:!bg-neutral-900 transition-colors duration-200 cursor-pointer !shadow-none after:!hidden focus-visible:!shadow-none [&>span>div]:!rounded-none"
        data-testid="square-payment-collection-submit"
      >
        Place order
      </Button>,
      reviewActionSlot
    )

  const walletReviewAction =
    reviewActionSlot &&
    selectedMethod !== "square_card" &&
    createPortal(
      <div
        id={SQUARE_WALLET_BUTTON_CONTAINER_ID}
        className="w-full h-10"
        data-testid="square-payment-collection-wallet-button-container"
      />,
      reviewActionSlot
    )

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center gap-x-2 justify-left mb-4">
        <Heading level="h2" className="text-xl gap-x-2 items-baseline uppercase">
          Payment Method
        </Heading>
      </div>
      <Divider className="mb-6" />

      {(!squareApplicationId || !squareLocationId) && (
        <ErrorMessage
          error="Square configuration is missing. Set NEXT_PUBLIC_SQUARE_APPLICATION_ID and NEXT_PUBLIC_SQUARE_LOCATION_ID."
          data-testid="square-payment-collection-config-error-message"
        />
      )}

      <CustomPaymentSelector
        availableMethods={availableMethods}
        selectedMethod={selectedMethod}
        onMethodSelect={(method) => {
          setSelectedMethod(method)
          setErrorMessage(null)
        }}
        renderPaymentDetails={() => null}
      />
      <div
        className={clx("ml-8 max-w-md pt-2 space-y-3", {
          hidden: selectedMethod !== "square_card",
        })}
        aria-hidden={selectedMethod !== "square_card"}
      >
        <div id={SQUARE_CARD_CONTAINER_ID} className="min-h-[44px]" />
      </div>
      {cardReviewAction}
      {walletReviewAction}

      <ErrorMessage error={errorMessage} data-testid="square-payment-collection-error-message" />
    </div>
  )
}

export default SquarePaymentCollectionForm
