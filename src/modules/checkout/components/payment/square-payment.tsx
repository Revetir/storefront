"use client"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { Button, Heading, clx } from "@medusajs/ui"
import ErrorMessage from "@modules/checkout/components/error-message"
import { usePaymentContext } from "@modules/checkout/components/payment/payment-context"
import CustomPaymentSelector from "@modules/checkout/components/payment/custom-payment-selector"
import { scrollToTop, triggerFieldErrors, validateCheckout } from "@modules/checkout/utils/validate-checkout"
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
import { useParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"

const DEFAULT_SQUARE_PROVIDER_ID = "pp_square_square"
const CHECKOUT_REVIEW_ACTION_SLOT_ID = "checkout-review-payment-action-slot"
const SQUARE_WALLET_BUTTON_CONTAINER_ID = "square-wallet-button-container"
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

type SquareMethodConfig = {
  id: SquareCheckoutMethodType
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

type SquareCartPaymentProps = {
  cart: CartLike
  squareProviderId?: string
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

const SQUARE_CARD_CONTAINER_ID = "square-card-container"

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

const resolveCountryCodeForSquare = (cartLike: CartLike | null | undefined) => {
  return (
    cartLike?.shipping_address?.country_code?.toUpperCase() ||
    cartLike?.billing_address?.country_code?.toUpperCase() ||
    "US"
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
  } catch {
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
      // Try next strategy.
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

const resolvePaymentAmount = (cartLike: CartLike): number => {
  const collectionAmount = Number(cartLike?.payment_collection?.amount)
  if (Number.isFinite(collectionAmount) && collectionAmount > 0) {
    return collectionAmount
  }

  const totalAmount = Number(cartLike?.total)
  if (Number.isFinite(totalAmount) && totalAmount > 0) {
    return totalAmount
  }

  return 0
}

const SquareCartPayment = ({ cart, squareProviderId }: SquareCartPaymentProps) => {
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
  const { setSelectedPaymentMethod } = usePaymentContext()
  const params = useParams()

  const squareApplicationId =
    process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID || ""
  const squareLocationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || ""
  const isSquareSandbox =
    process.env.NEXT_PUBLIC_SQUARE_IS_SANDBOX === "true"

  const resolvedSquareProviderId = squareProviderId || DEFAULT_SQUARE_PROVIDER_ID
  const currencyCode = useMemo(
    () => String(cart?.currency_code || cart?.payment_collection?.currency_code || "usd").toUpperCase(),
    [cart?.currency_code, cart?.payment_collection?.currency_code]
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
    setSelectedPaymentMethod(selectedMethod)
  }, [selectedMethod, setSelectedPaymentMethod])

  useEffect(() => {
    return () => {
      setSelectedPaymentMethod(null)
    }
  }, [setSelectedPaymentMethod])

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
      const paymentAmount = resolvePaymentAmount(cart)
      if (!paymentAmount) {
        throw new Error("Missing checkout total for payment request.")
      }

      return payments.paymentRequest({
        countryCode: resolveCountryCodeForSquare(cart),
        currencyCode,
        total: {
          amount: formatSquareDisplayAmount(paymentAmount, currencyCode),
          label: "Total",
        },
      })
    },
    [cart, currencyCode]
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

  const createSessionWithToken = useCallback(
    async (sourceToken: string, sourceType: string): Promise<void> => {
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

      await sdk.client.fetch<{ payment_collection: PaymentCollectionLike }>(
        `/store/payment-collections/${paymentCollectionId}/payment-sessions`,
        {
          method: "POST",
          body: {
            provider_id: resolvedSquareProviderId,
            data: {
              source_id: sourceToken,
              source_type: sourceType,
              location_id: squareLocationId,
            },
          },
          cache: "no-store",
        }
      )
    },
    [resolvedSquareProviderId, squareLocationId, validateAndPrepareCheckout]
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
      redirectToCheckoutCompletion()
    } catch (error) {
      setErrorMessage(
        toErrorMessage(error, "Square checkout failed. Please review your details and try again.")
      )
    } finally {
      setSubmitting(false)
    }
  }, [createSessionWithToken, redirectToCheckoutCompletion, submitting, tokenizeSelectedMethod])

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
        data-testid="square-submit-button"
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
        data-testid="square-wallet-button-container"
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
          data-testid="square-payment-config-error-message"
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

      <ErrorMessage error={errorMessage} data-testid="square-payment-error-message" />
    </div>
  )
}

export default SquareCartPayment
