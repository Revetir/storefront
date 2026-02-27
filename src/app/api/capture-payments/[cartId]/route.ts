import { retrieveCart } from "@lib/data/cart"
import { sdk } from "@lib/config"
import { getAuthHeaders } from "@lib/data/cookies"
import { NextRequest, NextResponse } from "next/server"

type Params = Promise<{ cartId: string }>

export async function GET(req: NextRequest, { params }: { params: Params }) {
  const { cartId } = await params
  const { origin, searchParams } = req.nextUrl

  const paymentIntent = searchParams.get("payment_intent")
  const paymentIntentClientSecret = searchParams.get(
    "payment_intent_client_secret"
  )
  const redirectStatus = searchParams.get("redirect_status") || ""
  const countryCode = searchParams.get("country_code")

  const cart = await retrieveCart(cartId)

  if (!cart) {
    return NextResponse.redirect(`${origin}/${countryCode}`)
  }

  const paymentSession = cart.payment_collection?.payment_sessions?.find(
    (payment) => payment.data.id === paymentIntent
  )

  if (
    !paymentSession ||
    paymentSession.data.client_secret !== paymentIntentClientSecret ||
    !["pending", "succeeded"].includes(redirectStatus) ||
    !["pending", "authorized"].includes(paymentSession.status)
  ) {
    return NextResponse.redirect(
      `${origin}/${countryCode}/cart?step=review&error=payment_failed`
    )
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const cartRes = await sdk.store.cart.complete(cartId, {}, headers)

  if (cartRes.type !== "order") {
    return NextResponse.redirect(
      `${origin}/${countryCode}/cart?step=review&error=payment_failed`
    )
  }

  return NextResponse.redirect(
    `${origin}/${countryCode}/order/${cartRes.order.id}/confirmed`
  )
}
