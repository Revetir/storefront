import { sdk } from "@lib/config"
import { NextRequest, NextResponse } from "next/server"

type ResolvePrivateCheckoutResponse = {
  cart_id: string
  session_id: string
  expires_at: string
}

const CART_COOKIE = "_medusa_cart_id"
const PRIVATE_CHECKOUT_TOKEN_COOKIE = "_medusa_private_checkout_token"
const PRIVATE_CHECKOUT_BACKUP_CART_COOKIE = "_medusa_private_checkout_backup_cart_id"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7

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

  if (!session?.cart_id) {
    return new NextResponse(null, { status: 404 })
  }

  const redirectUrl = new URL(`/${countryCode}/checkout`, req.url)
  const response = NextResponse.redirect(redirectUrl)

  const existingCartId = req.cookies.get(CART_COOKIE)?.value
  const existingBackupCartId = req.cookies.get(PRIVATE_CHECKOUT_BACKUP_CART_COOKIE)?.value

  if (
    !existingBackupCartId &&
    existingCartId &&
    existingCartId !== session.cart_id
  ) {
    response.cookies.set(PRIVATE_CHECKOUT_BACKUP_CART_COOKIE, existingCartId, {
      maxAge: COOKIE_MAX_AGE,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    })
  }

  response.cookies.set(PRIVATE_CHECKOUT_TOKEN_COOKIE, token, {
    maxAge: COOKIE_MAX_AGE,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  })

  response.cookies.set(CART_COOKIE, session.cart_id, {
    maxAge: COOKIE_MAX_AGE,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  })

  return response
}
