"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { RadioGroup, Radio } from "@headlessui/react"
import { Button, Heading, clx } from "@medusajs/ui"
import Divider from "@modules/common/components/divider"
import CartTotals from "@modules/common/components/cart-totals"
import CustomPaymentSelector from "@modules/checkout/components/payment/custom-payment-selector"
import MedusaRadio from "@modules/common/components/radio"
import Amex from "@modules/common/icons/amex"
import ApplePayIcon from "@modules/common/icons/apple-pay"
import Discover from "@modules/common/icons/discover"
import GooglePayIcon from "@modules/common/icons/google-pay"
import Mastercard from "@modules/common/icons/mastercard"
import Visa from "@modules/common/icons/visa"
import { createPortal } from "react-dom"
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
} from "@lib/util/square-web-payments"

type PreviewResult = {
  wouldCreateOrder?: boolean
  message?: string
  payment?: {
    id?: string | null
    status?: string | null
    sourceType?: string | null
  }
}

type LocalAddress = {
  first_name: string
  last_name: string
  address_1: string
  address_2: string
  company: string
  city: string
  province: string
  postal_code: string
  country_code: string
  email: string
  phone: string
}

const CHECKOUT_REVIEW_ACTION_SLOT_ID = "checkout-review-payment-action-slot"
const SQUARE_CARD_CONTAINER_ID = "square-preview-card-container"
const SQUARE_WALLET_BUTTON_CONTAINER_ID = "square-preview-wallet-button-container"
const SQUARE_GOOGLE_PAY_BUTTON_OPTIONS = {
  buttonColor: "black",
  buttonType: "long",
  buttonSizeMode: "fill",
  buttonRadius: 0,
  buttonBorderType: "no_border",
} as const
const SQUARE_APPLE_PAY_BUTTON_CLASSNAME =
  "w-full h-10 uppercase rounded-none border-0 bg-black text-white hover:bg-neutral-900 transition-colors duration-200 cursor-pointer"

type SquareWalletMethodType = Exclude<SquareCheckoutMethodType, "square_card">

const SAMPLE_ITEM = {
  sku: "RVT-TEST-001",
  brand: "REVETIR",
  title: "Sample Technical Jacket",
  size: "M",
  color: "Black",
  quantity: 1,
  unitPrice: 28900,
}

const SAMPLE_TOTALS = {
  subtotal: 28900,
  shipping_subtotal: 0,
  shipping_total: 0,
  tax_total: 2312,
  discount_total: 0,
  gift_card_total: 0,
  total: 31212,
  currency_code: "usd",
  shipping_address: {
    address_1: "2 Park Ave",
    city: "New York",
    province: "us-ny",
    postal_code: "10016",
    country_code: "us",
  },
}

const DEFAULT_ADDRESS: LocalAddress = {
  first_name: "Alex",
  last_name: "Morgan",
  address_1: "2 Park Avenue",
  address_2: "Floor 20",
  company: "REVETIR",
  city: "New York",
  province: "us-ny",
  postal_code: "10016",
  country_code: "us",
  email: "alex@example.com",
  phone: "2125550199",
}

const SHIPPING_OPTIONS = [
  {
    id: "ship_standard",
    name: "Standard Shipping",
    detail: "Delivered by 7-10 business days",
    amountLabel: "Free",
  },
  {
    id: "ship_expedited",
    name: "Expedited Shipping",
    detail: "Delivered by 2-4 business days",
    amountLabel: "$25.00",
  },
]

const PAYMENT_METHODS: Array<{
  id: SquareCheckoutMethodType
  label: string
  icons: React.ComponentType[]
}> = [
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

export default function CheckoutPreviewPage() {
  const [address, setAddress] = useState<LocalAddress>(DEFAULT_ADDRESS)
  const [shippingMethodId, setShippingMethodId] = useState<string>(
    SHIPPING_OPTIONS[0].id
  )
  const [selectedMethod, setSelectedMethod] =
    useState<SquareCheckoutMethodType>("square_card")
  const [sdkReady, setSdkReady] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [walletAvailability, setWalletAvailability] = useState({
    applePay: false,
    googlePay: false,
  })
  const [reviewActionSlot, setReviewActionSlot] = useState<HTMLElement | null>(
    null
  )
  const [result, setResult] = useState<PreviewResult | null>(null)

  const squareApplicationId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID || ""
  const squareLocationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || ""
  const isSquareSandbox = process.env.NEXT_PUBLIC_SQUARE_IS_SANDBOX === "true"

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

  const availableMethods = useMemo(() => {
    return PAYMENT_METHODS.filter((method) => {
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
          "Missing NEXT_PUBLIC_SQUARE_APPLICATION_ID or NEXT_PUBLIC_SQUARE_LOCATION_ID."
        )
        return
      }

      try {
        await loadSquareScript(isSquareSandbox)
        if (!isMounted || !window.Square) {
          return
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
            toErrorMessage(error, "Failed to initialize Square checkout preview.")
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
    (payments: SquarePayments) =>
      payments.paymentRequest({
        countryCode: "US",
        currencyCode: SAMPLE_TOTALS.currency_code.toUpperCase(),
        total: {
          amount: formatSquareDisplayAmount(
            SAMPLE_TOTALS.total,
            SAMPLE_TOTALS.currency_code
          ),
          label: "Order Total",
        },
      }),
    []
  )

  const tokenizeSelectedMethod = useCallback(async () => {
    const payments = paymentsRef.current
    if (!payments) {
      throw new Error("Square SDK is not ready yet.")
    }

    if (selectedMethod === "square_card") {
      if (!cardRef.current) {
        throw new Error("Card input is not ready yet.")
      }

      const tokenResult = await cardRef.current.tokenize()
      return {
        token: readSquareTokenOrThrow(tokenResult),
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
      return {
        token: readSquareTokenOrThrow(tokenResult),
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
      return {
        token: readSquareTokenOrThrow(tokenResult),
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

  const handlePreviewPlaceOrder = useCallback(async () => {
    if (submitting) {
      return
    }

    setSubmitting(true)
    setErrorMessage(null)
    setResult(null)

    try {
      const { token, sourceType } = await tokenizeSelectedMethod()

      const response = await fetch("/api/square/sandbox-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceId: token,
          sourceType,
        }),
      })

      const payload = (await response.json().catch(() => ({}))) as PreviewResult
      if (!response.ok) {
        throw new Error(payload.message || "Preview payment test failed.")
      }

      setResult(payload)
    } catch (error) {
      setErrorMessage(
        toErrorMessage(
          error,
          "Payment preview failed. Please review your configuration."
        )
      )
    } finally {
      setSubmitting(false)
    }
  }, [submitting, tokenizeSelectedMethod])

  useEffect(() => {
    walletSubmitRef.current = () => {
      void handlePreviewPlaceOrder()
    }
  }, [handlePreviewPlaceOrder])

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
          applePayButton.textContent = "Apple Pay"
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

  const renderMethodDetail = (method: SquareCheckoutMethodType) => {
    if (method === "square_card") {
      return (
        <div className="max-w-md pt-2 space-y-3">
          <div id={SQUARE_CARD_CONTAINER_ID} className="min-h-[44px]" />
        </div>
      )
    }

    return null
  }

  const cardReviewAction =
    reviewActionSlot &&
    selectedMethod === "square_card" &&
    createPortal(
      <Button
        variant="transparent"
        disabled={!sdkReady || submitting}
        onClick={handlePreviewPlaceOrder}
        isLoading={submitting}
        className="w-full h-10 uppercase !rounded-none !bg-black !text-white hover:!bg-neutral-900 transition-colors duration-200 cursor-pointer !shadow-none after:!hidden focus-visible:!shadow-none [&>span>div]:!rounded-none"
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
        data-testid="square-preview-wallet-button-container"
      />,
      reviewActionSlot
    )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_416px] content-container gap-x-40 py-6">
      <div className="w-full grid grid-cols-1 gap-y-8">
        <div className="bg-white">
          <div className="flex flex-row items-center justify-between mb-4">
            <Heading
              level="h2"
              className="flex flex-row text-xl gap-x-2 items-baseline uppercase"
            >
              Shipping Address
            </Heading>
          </div>
          <Divider className="mb-6" />
          <div className="pb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  value={address.first_name}
                  onChange={(e) =>
                    setAddress((prev) => ({ ...prev, first_name: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-0 focus:border-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  value={address.last_name}
                  onChange={(e) =>
                    setAddress((prev) => ({ ...prev, last_name: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-0 focus:border-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address
                </label>
                <input
                  value={address.address_1}
                  onChange={(e) =>
                    setAddress((prev) => ({ ...prev, address_1: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-0 focus:border-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apt. / Unit #
                </label>
                <input
                  value={address.address_2}
                  onChange={(e) =>
                    setAddress((prev) => ({ ...prev, address_2: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-0 focus:border-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  value={address.city}
                  onChange={(e) =>
                    setAddress((prev) => ({ ...prev, city: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-0 focus:border-black"
                />
              </div>
              <div className="flex gap-4">
                <div className="w-3/5">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    value={address.province.toUpperCase()}
                    onChange={(e) =>
                      setAddress((prev) => ({
                        ...prev,
                        province: e.target.value.toLowerCase(),
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-0 focus:border-black"
                  />
                </div>
                <div className="w-2/5">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zip Code
                  </label>
                  <input
                    value={address.postal_code}
                    onChange={(e) =>
                      setAddress((prev) => ({
                        ...prev,
                        postal_code: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-0 focus:border-black"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  value={address.email}
                  onChange={(e) =>
                    setAddress((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-0 focus:border-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  value={address.phone}
                  onChange={(e) =>
                    setAddress((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-0 focus:border-black"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white">
          <div className="flex flex-row items-center justify-between mb-4">
            <Heading
              level="h2"
              className="flex flex-row text-xl gap-x-2 items-baseline uppercase"
            >
              Shipping Method
            </Heading>
          </div>
          <Divider className="mb-6" />
          <div className="pb-8 md:pt-0 pt-2">
            <RadioGroup value={shippingMethodId} onChange={setShippingMethodId}>
              {SHIPPING_OPTIONS.map((option) => (
                <Radio
                  key={option.id}
                  value={option.id}
                  className="flex items-center gap-x-4 text-small-regular cursor-pointer py-1.5"
                >
                  <MedusaRadio checked={option.id === shippingMethodId} />
                  <div className="flex flex-col flex-1">
                    <span className="text-base-regular">
                      {option.amountLabel} / {option.name}
                    </span>
                    <span className="text-sm text-ui-fg-muted">{option.detail}</span>
                  </div>
                </Radio>
              ))}
            </RadioGroup>
          </div>
        </div>

        <div className="bg-white">
          <div className="flex flex-row items-center gap-x-2 justify-left mb-4">
            <Heading level="h2" className="text-xl gap-x-2 items-baseline uppercase">
              Payment Method
            </Heading>
          </div>
          <Divider className="mb-6" />

          <CustomPaymentSelector
            availableMethods={availableMethods}
            selectedMethod={selectedMethod}
            onMethodSelect={(method) => {
              setSelectedMethod(method)
              setErrorMessage(null)
            }}
            renderPaymentDetails={renderMethodDetail}
          />

          {!squareApplicationId || !squareLocationId ? (
            <p className="text-red-600 text-sm mt-4">
              Missing Square public env vars for rendering payment fields.
            </p>
          ) : null}
        </div>
      </div>

      <div className="lg:sticky lg:top-20 lg:self-start">
        <div className="overflow-x-hidden flex flex-col-reverse lg:flex-col gap-y-8 py-8 lg:py-0 lg:pr-3 lg:[scrollbar-gutter:stable]">
          <div className="w-full bg-white flex flex-col">
            <Heading
              level="h2"
              className="flex flex-row text-xl items-baseline uppercase mb-4"
            >
              Review
            </Heading>
            <Divider className="mb-6" />
            <div className="pl-[1px] overflow-visible">
              <table className="w-full border-collapse">
                <tbody>
                  <tr className="w-full">
                    <td className="!pl-0 py-4 pr-4 w-24 align-top">
                      <div className="w-20 h-20 border border-gray-200 bg-gray-50" />
                    </td>
                    <td className="text-left py-3 !pr-0 lg:pr-4 align-top">
                      <p className="text-ui-fg-muted text-small font-medium uppercase">
                        {SAMPLE_ITEM.brand}
                      </p>
                      <p className="txt-medium-plus text-ui-fg-base">
                        {SAMPLE_ITEM.title}
                      </p>
                      <p className="text-xs text-ui-fg-subtle mt-1">
                        Size {SAMPLE_ITEM.size} / {SAMPLE_ITEM.color}
                      </p>
                    </td>
                    <td className="!pr-0 align-top text-right">
                      <p className="txt-medium-plus">$289.00</p>
                      <p className="text-xs text-ui-fg-muted mt-1">
                        Quantity: {SAMPLE_ITEM.quantity}
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <Divider className="my-4" />
            <CartTotals totals={SAMPLE_TOTALS as any} isCheckoutPage={true} />
            <div className="mt-4">
              <div id={CHECKOUT_REVIEW_ACTION_SLOT_ID} className="w-full" />
            </div>
            {cardReviewAction}
            {walletReviewAction}
            {(errorMessage || result) && (
              <div
                className={clx("mt-4 text-sm border p-3", {
                  "border-red-300 bg-red-50 text-red-700": !!errorMessage,
                  "border-gray-300 bg-gray-50 text-gray-800":
                    !errorMessage && !!result,
                })}
              >
                {errorMessage ? (
                  <p>{errorMessage}</p>
                ) : (
                  <>
                    <p>{result?.message || "Preview completed."}</p>
                    <p className="text-xs mt-1">
                      Would create order:{" "}
                      {result?.wouldCreateOrder ? "Yes" : "No"}
                    </p>
                    <p className="text-xs">
                      Payment status: {result?.payment?.status || "N/A"}
                    </p>
                  </>
                )}
              </div>
            )}
            <Divider className="my-6" />
            <footer className="w-full bg-white pb-4">
              <div className="flex flex-col items-center gap-y-2">
                <div className="text-black text-xs text-center">
                  REVETIR, 2 Park Avenue, 20th Floor, New York, NY 10016
                </div>
                <div className="flex flex-wrap justify-center items-center text-gray-400 text-xs gap-x-4">
                  <a href="#" className="hover:text-ui-fg-base">
                    Terms &amp; Conditions
                  </a>
                  <a href="#" className="hover:text-ui-fg-base">
                    Privacy Policy
                  </a>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  )
}
