"use client"

import { useParams, useSearchParams } from "next/navigation"
import { useEffect, useRef } from "react"

type PaymentReturnHandlerProps = {
  cartId: string
}

const resolveCountryCode = (
  routeCountryCode: string | string[] | undefined,
  searchParamCountryCode?: string | null
): string => {
  const fromRoute = Array.isArray(routeCountryCode)
    ? routeCountryCode[0]
    : routeCountryCode

  return (
    fromRoute?.toLowerCase() ||
    searchParamCountryCode?.toLowerCase() ||
    "us"
  )
}

const PaymentReturnHandler = ({ cartId }: PaymentReturnHandlerProps) => {
  const params = useParams()
  const searchParams = useSearchParams()
  const handledRef = useRef(false)

  useEffect(() => {
    if (handledRef.current) {
      return
    }

    const paymentIntent = searchParams.get("payment_intent")
    const paymentIntentClientSecret = searchParams.get(
      "payment_intent_client_secret"
    )
    const redirectStatus = searchParams.get("redirect_status")

    if (!paymentIntent || !paymentIntentClientSecret || !redirectStatus) {
      return
    }

    if (!["pending", "succeeded"].includes(redirectStatus)) {
      return
    }

    handledRef.current = true

    const countryCode = resolveCountryCode(
      params?.countryCode as string | string[] | undefined,
      searchParams.get("country_code")
    )

    const captureUrl = new URL(
      `/api/capture-payments/${cartId}`,
      window.location.origin
    )
    captureUrl.searchParams.set("payment_intent", paymentIntent)
    captureUrl.searchParams.set(
      "payment_intent_client_secret",
      paymentIntentClientSecret
    )
    captureUrl.searchParams.set("redirect_status", redirectStatus)
    captureUrl.searchParams.set("country_code", countryCode)

    window.location.replace(captureUrl.toString())
  }, [cartId, params, searchParams])

  return null
}

export default PaymentReturnHandler
