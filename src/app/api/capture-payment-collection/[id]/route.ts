import { sdk } from "@lib/config"
import { getAuthHeaders } from "@lib/data/cookies"
import { NextRequest, NextResponse } from "next/server"

type Params = Promise<{ id: string }>

type PaymentCollectionCheckoutContext = {
  payment_collection: {
    id: string
    status?: string
    payment_sessions?: Array<{
      id?: string
      provider_id?: string
      status?: string
      data?: Record<string, any>
    }>
  }
  order: {
    id: string
    payment_status?: string
    shipping_address?: {
      country_code?: string
    } | null
    billing_address?: {
      country_code?: string
    } | null
  }
  country_code?: string
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const SUCCESSFUL_ORDER_PAYMENT_STATUSES = new Set([
  "authorized",
  "partially_authorized",
  "captured",
  "partially_captured",
  "partially_refunded",
  "refunded",
])

const SUCCESSFUL_PAYMENT_COLLECTION_STATUSES = new Set([
  "authorized",
  "partially_authorized",
  "partially_captured",
  "completed",
])

const SUCCESSFUL_PAYMENT_SESSION_STATUSES = new Set([
  "authorized",
  "captured",
])

const getPaymentIntentId = (paymentSession: Record<string, any>): string | undefined => {
  return (
    paymentSession?.data?.id ||
    paymentSession?.data?.payment_intent_id ||
    paymentSession?.data?.payment_intent
  )
}

const resolveMatchingSession = ({
  context,
  paymentIntent,
}: {
  context: PaymentCollectionCheckoutContext | null
  paymentIntent?: string | null
}) => {
  if (!paymentIntent) {
    return null
  }

  return (context?.payment_collection?.payment_sessions || []).find(
    (session) => getPaymentIntentId(session as Record<string, any>) === paymentIntent
  )
}

const hasSuccessfulPaymentState = ({
  context,
  paymentIntent,
  paymentIntentClientSecret,
}: {
  context: PaymentCollectionCheckoutContext | null
  paymentIntent?: string | null
  paymentIntentClientSecret?: string | null
}) => {
  const orderPaymentStatus = String(context?.order?.payment_status || "").toLowerCase()
  if (SUCCESSFUL_ORDER_PAYMENT_STATUSES.has(orderPaymentStatus)) {
    return true
  }

  const paymentCollectionStatus = String(
    context?.payment_collection?.status || ""
  ).toLowerCase()
  if (SUCCESSFUL_PAYMENT_COLLECTION_STATUSES.has(paymentCollectionStatus)) {
    return true
  }

  const matchingSession = resolveMatchingSession({ context, paymentIntent })
  if (!matchingSession) {
    return false
  }

  if (
    paymentIntentClientSecret &&
    matchingSession.data?.client_secret !== paymentIntentClientSecret
  ) {
    return false
  }

  const sessionStatus = String(matchingSession.status || "").toLowerCase()
  return SUCCESSFUL_PAYMENT_SESSION_STATUSES.has(sessionStatus)
}

export async function GET(req: NextRequest, { params }: { params: Params }) {
  const { id: paymentCollectionId } = await params
  const { origin, searchParams } = req.nextUrl

  const paymentIntent = searchParams.get("payment_intent")
  const paymentIntentClientSecret = searchParams.get(
    "payment_intent_client_secret"
  )
  const redirectStatus = (searchParams.get("redirect_status") || "").toLowerCase()
  const orderIdParam = searchParams.get("order_id")
  const countryCodeParam = (searchParams.get("country_code") || "").toLowerCase()

  const fallbackCountryCode = countryCodeParam || "us"
  const fallbackUrl = `${origin}/${fallbackCountryCode}/checkout/private/${paymentCollectionId}`

  const headers = {
    ...(await getAuthHeaders()),
  }

  const fetchCheckoutContext = async () =>
    sdk.client
      .fetch<PaymentCollectionCheckoutContext>(
        `/store/payment-collections/${paymentCollectionId}/checkout-context`,
        {
          method: "GET",
          headers,
          cache: "no-store",
        }
      )
      .catch(() => null)

  const context = await fetchCheckoutContext()

  if (!context?.order?.id || !context?.payment_collection?.id) {
    return NextResponse.redirect(`${fallbackUrl}?error=payment_failed`)
  }

  const orderId = orderIdParam || context.order.id
  const countryCode =
    countryCodeParam ||
    context.country_code ||
    context.order.shipping_address?.country_code ||
    context.order.billing_address?.country_code ||
    "us"

  if (redirectStatus && !["pending", "succeeded"].includes(redirectStatus)) {
    return NextResponse.redirect(`${fallbackUrl}?error=payment_failed`)
  }

  if (
    hasSuccessfulPaymentState({
      context,
      paymentIntent,
      paymentIntentClientSecret,
    })
  ) {
    return NextResponse.redirect(`${origin}/${countryCode}/order/${orderId}/confirmed`)
  }

  const maxAttempts = 12
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const refreshedContext = await fetchCheckoutContext()

    if (
      hasSuccessfulPaymentState({
        context: refreshedContext,
        paymentIntent,
        paymentIntentClientSecret,
      })
    ) {
      return NextResponse.redirect(`${origin}/${countryCode}/order/${orderId}/confirmed`)
    }

    await wait(250 * (attempt + 1))
  }

  return NextResponse.redirect(`${fallbackUrl}?error=payment_failed`)
}
