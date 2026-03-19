"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "./cookies"

export type StorePaymentCollectionCheckoutContextResponse = {
  payment_collection: any
  order: any
  country_code: string
}

export const retrievePaymentCollectionCheckoutContext = async (
  paymentCollectionId: string
): Promise<StorePaymentCollectionCheckoutContextResponse | null> => {
  if (!paymentCollectionId) {
    return null
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client
    .fetch<StorePaymentCollectionCheckoutContextResponse>(
      `/store/payment-collections/${paymentCollectionId}/checkout-context`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      }
    )
    .catch(() => null)
}

