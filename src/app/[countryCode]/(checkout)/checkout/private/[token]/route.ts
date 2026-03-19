import { sdk } from "@lib/config"
import { NextRequest, NextResponse } from "next/server"

type ResolvePrivateCheckoutResponse = {
  payment_collection_id: string
  session_id: string
  expires_at: string
  order_id?: string
  country_code?: string
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ countryCode: string; token: string }> }
) {
  const { countryCode, token } = await context.params
  const authToken = req.cookies.get("_medusa_jwt")?.value

  const headers = authToken
    ? ({ authorization: `Bearer ${authToken}` } as Record<string, string>)
    : undefined

  const session = await sdk.client
    .fetch<ResolvePrivateCheckoutResponse>("/store/private-checkout-sessions/resolve", {
      method: "POST",
      body: { token },
      headers,
    })
    .catch(() => null)

  if (!session?.payment_collection_id) {
    return new NextResponse(null, { status: 404 })
  }

  const redirectUrl = new URL(
    `/${countryCode}/payment-collection/${session.payment_collection_id}`,
    req.url
  )
  return NextResponse.redirect(redirectUrl)
}
