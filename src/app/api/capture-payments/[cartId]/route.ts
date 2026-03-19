import { retrieveCart } from "@lib/data/cart"
import { sdk } from "@lib/config"
import { getAuthHeaders, removeCartId } from "@lib/data/cookies"
import { NextRequest, NextResponse } from "next/server"

type Params = Promise<{ cartId: string }>

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const isRetryableCartCompletionError = (
  message: string | undefined,
  type: string | undefined
): boolean => {
  const combined = `${type ?? ""} ${message ?? ""}`.toLowerCase()

  return (
    combined.includes("pending") ||
    combined.includes("authorize") ||
    combined.includes("in progress")
  )
}

export async function GET(req: NextRequest, { params }: { params: Params }) {
  const { cartId } = await params
  const { origin, searchParams } = req.nextUrl

  const paymentIntent = searchParams.get("payment_intent")
  const paymentIntentClientSecret = searchParams.get(
    "payment_intent_client_secret"
  )
  const redirectStatus = searchParams.get("redirect_status") || ""
  const countryCode = (searchParams.get("country_code") || "us").toLowerCase()

  const cart = await retrieveCart(cartId)

  if (!cart) {
    return NextResponse.redirect(`${origin}/${countryCode}`)
  }

  const getPaymentIntentId = (payment: any): string | undefined => {
    return (
      payment?.data?.id ||
      payment?.data?.payment_intent_id ||
      payment?.data?.payment_intent
    )
  }

  const paymentSession = cart.payment_collection?.payment_sessions?.find(
    (payment: any) => getPaymentIntentId(payment) === paymentIntent
  )

  if (
    !paymentSession ||
    paymentSession.data.client_secret !== paymentIntentClientSecret ||
    !["pending", "succeeded"].includes(redirectStatus) ||
    !["pending", "authorized", "captured"].includes(paymentSession.status)
  ) {
    return NextResponse.redirect(
      `${origin}/${countryCode}/cart?step=review&error=payment_failed`
    )
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const maxAttempts = 4

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    let cartRes: Awaited<ReturnType<typeof sdk.store.cart.complete>>
    try {
      cartRes = await sdk.store.cart.complete(cartId, {}, headers)
    } catch {
      return NextResponse.redirect(
        `${origin}/${countryCode}/cart?step=review&error=payment_failed`
      )
    }

    if (cartRes.type === "order") {
      await removeCartId()
      return NextResponse.redirect(
        `${origin}/${countryCode}/order/${cartRes.order.id}/confirmed`
      )
    }

    const shouldRetry =
      attempt < maxAttempts &&
      isRetryableCartCompletionError(
        cartRes.error?.message,
        cartRes.error?.type
      )

    if (shouldRetry) {
      await wait(250 * attempt)
      continue
    }

    break
  }

  return NextResponse.redirect(
    `${origin}/${countryCode}/cart?step=review&error=payment_failed`
  )
}
