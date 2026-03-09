import { HttpTypes } from "@medusajs/types"

type OrderLike = Partial<HttpTypes.StoreOrder> & {
  custom_display_id?: unknown
  metadata?: Record<string, unknown> | null
}

const isNonEmptyValue = (value: unknown): value is string | number => {
  if (typeof value === "number") {
    return Number.isFinite(value)
  }

  if (typeof value === "string") {
    return value.trim().length > 0
  }

  return false
}

export const getOrderDisplayId = (order?: OrderLike | null): string => {
  if (!order) {
    return ""
  }

  const customDisplayId =
    order.custom_display_id ?? order.metadata?.custom_display_id

  if (isNonEmptyValue(customDisplayId)) {
    return String(customDisplayId).trim()
  }

  if (isNonEmptyValue(order.display_id)) {
    return String(order.display_id).trim()
  }

  if (isNonEmptyValue(order.id)) {
    return String(order.id).trim()
  }

  return ""
}
