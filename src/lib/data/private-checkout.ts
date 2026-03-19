"use server"

import { sdk } from "@lib/config"
import {
  getAuthHeaders,
  getPrivateCheckoutQuotedTotal,
  getPrivateCheckoutToken,
  removeCartId,
  removePrivateCheckoutCartId,
  removePrivateCheckoutQuotedTotal,
  removePrivateCheckoutToken,
} from "./cookies"

export const consumePrivateCheckoutSession = async ({
  token,
  orderId,
}: {
  token: string
  orderId: string
}): Promise<boolean> => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client
    .fetch<{ success: boolean }>("/store/private-checkout-sessions/consume", {
      method: "POST",
      body: {
        token,
        order_id: orderId,
      },
      headers,
    })
    .then((resp) => Boolean(resp?.success))
    .catch(() => false)
}

export const finalizePrivateCheckoutSession = async (orderId: string) => {
  const token = await getPrivateCheckoutToken()

  if (token) {
    await consumePrivateCheckoutSession({ token, orderId })
    await removePrivateCheckoutCartId()
  } else {
    await removeCartId()
  }

  await removePrivateCheckoutToken()
  await removePrivateCheckoutQuotedTotal()
}

export const clearPrivateCheckoutSessionState = async () => {
  await removePrivateCheckoutToken()
  await removePrivateCheckoutCartId()
  await removePrivateCheckoutQuotedTotal()
}

export const validatePrivateCheckoutQuotedTotal = async (
  cartTotal: number | null | undefined
): Promise<string | null> => {
  const token = await getPrivateCheckoutToken()
  if (!token) {
    return null
  }

  const quotedTotal = await getPrivateCheckoutQuotedTotal()
  if (quotedTotal === null || cartTotal === null || cartTotal === undefined) {
    return null
  }

  const diff = Math.abs(Number(cartTotal) - quotedTotal)
  if (diff <= 0.01) {
    return null
  }

  return "This private checkout quote changed after shipping/tax recalculation. Please contact support to regenerate the payment link."
}
