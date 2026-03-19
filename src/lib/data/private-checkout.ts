"use server"

import { sdk } from "@lib/config"
import {
  getAuthHeaders,
  getPrivateCheckoutBackupCartId,
  getPrivateCheckoutQuotedTotal,
  getPrivateCheckoutToken,
  removeCartId,
  removePrivateCheckoutBackupCartId,
  removePrivateCheckoutQuotedTotal,
  removePrivateCheckoutToken,
  setCartId,
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
  await removePrivateCheckoutQuotedTotal()
}

export const clearPrivateCheckoutSessionState = async () => {
  await removePrivateCheckoutToken()
  await removePrivateCheckoutBackupCartId()
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
