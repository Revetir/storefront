"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { HttpTypes } from "@medusajs/types"

const ORDER_FIELDS = [
  "id",
  "display_id",
  "custom_display_id",
  "metadata",
  "email",
  "status",
  "fulfillment_status",
  "payment_status",
  "currency_code",
  "created_at",
  "total",
  "subtotal",
  "item_total",
  "shipping_total",
  "shipping_subtotal",
  "tax_total",
  "discount_total",
  "gift_card_total",
  "*items",
  "*items.variant",
  "*items.product",
  "*shipping_methods",
  "*shipping_address",
  "*billing_address",
  "*fulfillments",
  "*payment_collections",
  "*payment_collections.payments",
].join(",")

const isOrderFieldsParseError = (error: any) => {
  const rawMessage = error?.response?.data?.message || error?.message || ""
  const message = String(rawMessage).toLowerCase()

  return (
    message.includes("entity 'order' does not have property") ||
    message.includes('entity "order" does not have property') ||
    message.includes("does not have property ''") ||
    message.includes('does not have property ""')
  )
}

export const retrieveOrder = async (id: string) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("orders")),
  }

  try {
    return await sdk.client.fetch<HttpTypes.StoreOrderResponse>(`/store/orders/${id}`, {
      method: "GET",
      query: {
        fields: ORDER_FIELDS,
      },
      headers,
      next,
      cache: "force-cache",
    })
    .then(({ order }) => order)
  } catch (error) {
    if (isOrderFieldsParseError(error)) {
      return await sdk.client
        .fetch<HttpTypes.StoreOrderResponse>(`/store/orders/${id}`, {
          method: "GET",
          headers,
          next,
          cache: "force-cache",
        })
        .then(({ order }) => order)
    }

    return medusaError(error)
  }
}

export const listOrders = async (
  limit: number = 10,
  offset: number = 0,
  filters?: Record<string, any>
) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("orders")),
  }

  try {
    return await sdk.client
      .fetch<HttpTypes.StoreOrderListResponse>(`/store/orders`, {
        method: "GET",
        query: {
          limit,
          offset,
          order: "-created_at",
          fields: ORDER_FIELDS,
          ...filters,
        },
        headers,
        next,
        cache: "force-cache",
      })
      .then(({ orders }) => orders)
  } catch (error) {
    if (isOrderFieldsParseError(error)) {
      return await sdk.client
        .fetch<HttpTypes.StoreOrderListResponse>(`/store/orders`, {
          method: "GET",
          query: {
            limit,
            offset,
            order: "-created_at",
            ...filters,
          },
          headers,
          next,
          cache: "force-cache",
        })
        .then(({ orders }) => orders)
    }

    return medusaError(error)
  }
}

export const createTransferRequest = async (
  state: {
    success: boolean
    error: string | null
    order: HttpTypes.StoreOrder | null
  },
  formData: FormData
): Promise<{
  success: boolean
  error: string | null
  order: HttpTypes.StoreOrder | null
}> => {
  const id = formData.get("order_id") as string

  if (!id) {
    return { success: false, error: "Order ID is required", order: null }
  }

  const headers = await getAuthHeaders()

  return await sdk.store.order
    .requestTransfer(
      id,
      {},
      {
        fields: "id, email",
      },
      headers
    )
    .then(({ order }) => ({ success: true, error: null, order }))
    .catch((err) => ({ success: false, error: err.message, order: null }))
}

export const acceptTransferRequest = async (id: string, token: string) => {
  const headers = await getAuthHeaders()

  return await sdk.store.order
    .acceptTransfer(id, { token }, {}, headers)
    .then(({ order }) => ({ success: true, error: null, order }))
    .catch((err) => ({ success: false, error: err.message, order: null }))
}

export const declineTransferRequest = async (id: string, token: string) => {
  const headers = await getAuthHeaders()

  return await sdk.store.order
    .declineTransfer(id, { token }, {}, headers)
    .then(({ order }) => ({ success: true, error: null, order }))
    .catch((err) => ({ success: false, error: err.message, order: null }))
}
