import { retrieveCart } from "@lib/data/cart"
import { getAuthHeaders, removeCartId } from "@lib/data/cookies"
import { sdk } from "@lib/config"
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

const isOrderReadable = async (orderId: string) => {
  try {
    const headers = {
      ...(await getAuthHeaders()),
    }

    await sdk.client.fetch<{ order: { id: string } }>(`/store/orders/${orderId}`, {
      method: "GET",
      headers,
      cache: "no-store",
    })

    return true
  } catch {
    return false
  }
}

export async function GET(req: NextRequest, { params }: { params: Params }) {
  const { cartId } = await params
  const { origin, searchParams } = req.nextUrl
  const countryCode = (searchParams.get("country_code") || "us").toLowerCase()
  const checkoutUrl = `${origin}/${countryCode}/checkout`

  const cart = await retrieveCart(cartId)

  if (!cart) {
    return NextResponse.redirect(`${checkoutUrl}?step=review&error=payment_failed`)
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
      return NextResponse.redirect(`${checkoutUrl}?step=review&error=payment_failed`)
    }

    if (cartRes.type === "order") {
      const orderId = cartRes.order.id

      // Avoid redirecting to confirmation before the order endpoint becomes readable.
      for (let orderAttempt = 1; orderAttempt <= 4; orderAttempt += 1) {
        if (await isOrderReadable(orderId)) {
          await removeCartId()
          return NextResponse.redirect(`${origin}/${countryCode}/order/${orderId}/confirmed`)
        }

        await wait(200 * orderAttempt)
      }

      await removeCartId()
      return NextResponse.redirect(`${origin}/${countryCode}/order/${orderId}/confirmed`)
    }

    const shouldRetry =
      attempt < maxAttempts &&
      isRetryableCartCompletionError(cartRes.error?.message, cartRes.error?.type)

    if (shouldRetry) {
      await wait(250 * attempt)
      continue
    }

    break
  }

  return NextResponse.redirect(`${checkoutUrl}?step=review&error=payment_failed`)
}

