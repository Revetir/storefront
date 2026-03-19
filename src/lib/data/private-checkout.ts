"use server"

import { sdk } from "@lib/config"
import {
  getAuthHeaders,
  getPrivateCheckoutBackupCartId,
  getPrivateCheckoutToken,
  removeCartId,
  removePrivateCheckoutBackupCartId,
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
}

export const clearPrivateCheckoutSessionState = async () => {
  await removePrivateCheckoutToken()
  await removePrivateCheckoutBackupCartId()
}
