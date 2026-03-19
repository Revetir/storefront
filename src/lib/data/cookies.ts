import "server-only"
import { cookies as nextCookies } from "next/headers"

const PRIVATE_CHECKOUT_TOKEN_COOKIE = "_medusa_private_checkout_token"
const PRIVATE_CHECKOUT_QUOTED_TOTAL_COOKIE = "_medusa_private_checkout_quoted_total"
const PRIVATE_CHECKOUT_CART_COOKIE = "_medusa_private_checkout_cart_id"

export const getAuthHeaders = async (): Promise<
  { authorization: string } | {}
> => {
  try {
    const cookies = await nextCookies()
    const token = cookies.get("_medusa_jwt")?.value

    if (!token) {
      return {}
    }

    return { authorization: `Bearer ${token}` }
  } catch {
    return {}
  }
}

export const getCacheTag = async (tag: string): Promise<string> => {
  try {
    const cookies = await nextCookies()
    const cacheId = cookies.get("_medusa_cache_id")?.value

    if (!cacheId) {
      return ""
    }

    return `${tag}-${cacheId}`
  } catch (error) {
    return ""
  }
}

export const getCacheOptions = async (
  tag: string
): Promise<{ tags: string[] } | {}> => {
  if (typeof window !== "undefined") {
    return {}
  }

  const cacheTag = await getCacheTag(tag)

  if (!cacheTag) {
    return {}
  }

  return { tags: [`${cacheTag}`] }
}

export const setAuthToken = async (token: string) => {
  const cookies = await nextCookies()
  cookies.set("_medusa_jwt", token, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  })
}

export const removeAuthToken = async () => {
  const cookies = await nextCookies()
  cookies.set("_medusa_jwt", "", {
    maxAge: -1,
  })
}

export const getCartId = async () => {
  const cookies = await nextCookies()
  return cookies.get("_medusa_cart_id")?.value
}

export const getCheckoutCartId = async () => {
  const cookies = await nextCookies()
  const privateToken = cookies.get(PRIVATE_CHECKOUT_TOKEN_COOKIE)?.value
  const privateCartId = cookies.get(PRIVATE_CHECKOUT_CART_COOKIE)?.value

  if (privateToken && privateCartId) {
    return privateCartId
  }

  return cookies.get("_medusa_cart_id")?.value
}

export const setCartId = async (cartId: string) => {
  const cookies = await nextCookies()
  cookies.set("_medusa_cart_id", cartId, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  })
}

export const removeCartId = async () => {
  const cookies = await nextCookies()
  cookies.set("_medusa_cart_id", "", {
    maxAge: -1,
  })
}

export const getPrivateCheckoutToken = async () => {
  const cookies = await nextCookies()
  return cookies.get(PRIVATE_CHECKOUT_TOKEN_COOKIE)?.value
}

export const setPrivateCheckoutToken = async (token: string) => {
  const cookies = await nextCookies()
  cookies.set(PRIVATE_CHECKOUT_TOKEN_COOKIE, token, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  })
}

export const removePrivateCheckoutToken = async () => {
  const cookies = await nextCookies()
  cookies.set(PRIVATE_CHECKOUT_TOKEN_COOKIE, "", {
    maxAge: -1,
  })
}

export const getPrivateCheckoutCartId = async () => {
  const cookies = await nextCookies()
  return cookies.get(PRIVATE_CHECKOUT_CART_COOKIE)?.value
}

export const setPrivateCheckoutCartId = async (cartId: string) => {
  const cookies = await nextCookies()
  cookies.set(PRIVATE_CHECKOUT_CART_COOKIE, cartId, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  })
}

export const removePrivateCheckoutCartId = async () => {
  const cookies = await nextCookies()
  cookies.set(PRIVATE_CHECKOUT_CART_COOKIE, "", {
    maxAge: -1,
  })
}

export const getPrivateCheckoutQuotedTotal = async () => {
  const cookies = await nextCookies()
  const rawValue = cookies.get(PRIVATE_CHECKOUT_QUOTED_TOTAL_COOKIE)?.value
  if (!rawValue) {
    return null
  }

  const parsed = Number(rawValue)
  return Number.isFinite(parsed) ? parsed : null
}

export const setPrivateCheckoutQuotedTotal = async (total: number) => {
  const cookies = await nextCookies()
  cookies.set(PRIVATE_CHECKOUT_QUOTED_TOTAL_COOKIE, String(total), {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  })
}

export const removePrivateCheckoutQuotedTotal = async () => {
  const cookies = await nextCookies()
  cookies.set(PRIVATE_CHECKOUT_QUOTED_TOTAL_COOKIE, "", {
    maxAge: -1,
  })
}
