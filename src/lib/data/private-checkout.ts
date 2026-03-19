"use server"

import { sdk } from "@lib/config"
import {
  getAuthHeaders,
  getCartId,
  getPrivateCheckoutBackupCartId,
  getPrivateCheckoutToken,
  removeCartId,
  removePrivateCheckoutBackupCartId,
  removePrivateCheckoutToken,
  setCartId,
  setPrivateCheckoutBackupCartId,
  setPrivateCheckoutToken,
} from "./cookies"

type ResolvePrivateCheckoutResponse = {
  cart_id: string
  session_id: string
  expires_at: string
}

export const resolvePrivateCheckoutSession = async (
  token: string
): Promise<ResolvePrivateCheckoutResponse | null> => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client
    .fetch<ResolvePrivateCheckoutResponse>(
      "/store/private-checkout-sessions/resolve",
      {
        method: "POST",
        body: { token },
        headers,
      }
    )
    .catch(() => null)
}

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

export const activatePrivateCheckoutSessionCart = async ({
  token,
  cartId,
}: {
  token: string
  cartId: string
}) => {
  const existingCartId = await getCartId()
  const backupCartId = await getPrivateCheckoutBackupCartId()

  if (!backupCartId && existingCartId && existingCartId !== cartId) {
    await setPrivateCheckoutBackupCartId(existingCartId)
  }

  await setPrivateCheckoutToken(token)
  await setCartId(cartId)
}

export const finalizePrivateCheckoutSession = async (orderId: string) => {
  const token = await getPrivateCheckoutToken()
  const backupCartId = await getPrivateCheckoutBackupCartId()

  if (token) {
    await consumePrivateCheckoutSession({ token, orderId })
    if (backupCartId) {
      await setCartId(backupCartId)
    } else {
      await removeCartId()
    }
  } else {
    await removeCartId()
  }

  await removePrivateCheckoutToken()
  await removePrivateCheckoutBackupCartId()
}

export const clearPrivateCheckoutSessionState = async () => {
  await removePrivateCheckoutToken()
  await removePrivateCheckoutBackupCartId()
}
