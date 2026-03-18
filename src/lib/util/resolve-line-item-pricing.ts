import { HttpTypes } from "@medusajs/types"

type SupportedLineItem =
  | HttpTypes.StoreCartLineItem
  | HttpTypes.StoreOrderLineItem

type ResolvedLineItemPricing = {
  calculatedTotal: number
  calculatedUnit: number
  originalTotal: number | null
  originalUnit: number | null
  hasDiscount: boolean
}

const toFiniteNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  if (typeof value === "string") {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return null
}

const firstFinite = (...values: Array<unknown>): number | null => {
  for (const value of values) {
    const numericValue = toFiniteNumber(value)
    if (numericValue !== null) {
      return numericValue
    }
  }

  return null
}

const maxFinite = (...values: Array<unknown>): number | null => {
  const numericValues = values
    .map((value) => toFiniteNumber(value))
    .filter((value): value is number => value !== null)

  if (!numericValues.length) {
    return null
  }

  return Math.max(...numericValues)
}

const normalizeQuantity = (quantity: unknown): number => {
  const numericQuantity = toFiniteNumber(quantity)
  if (!numericQuantity || numericQuantity <= 0) {
    return 1
  }

  return numericQuantity
}

export const resolveLineItemPricing = (
  item: SupportedLineItem
): ResolvedLineItemPricing => {
  const quantity = normalizeQuantity(item.quantity)
  const unitPrice = toFiniteNumber(item.unit_price)
  const compareAtUnitPrice = toFiniteNumber(item.compare_at_unit_price)
  const discountTotal = toFiniteNumber(item.discount_total)

  const calculatedTotal =
    firstFinite(
      item.subtotal,
      item.total,
      unitPrice !== null ? unitPrice * quantity : null
    ) ?? 0

  const compareAtTotal =
    compareAtUnitPrice !== null ? compareAtUnitPrice * quantity : null
  const originalFromTotals = maxFinite(item.original_subtotal, item.original_total)
  const discountFallback =
    discountTotal !== null && discountTotal > 0
      ? calculatedTotal + discountTotal
      : null

  const originalCandidate = maxFinite(
    compareAtTotal,
    originalFromTotals,
    discountFallback
  )
  const hasDiscount =
    originalCandidate !== null && originalCandidate > calculatedTotal

  const originalTotal = hasDiscount ? originalCandidate : null

  return {
    calculatedTotal,
    calculatedUnit: calculatedTotal / quantity,
    originalTotal,
    originalUnit: originalTotal !== null ? originalTotal / quantity : null,
    hasDiscount,
  }
}

export type { ResolvedLineItemPricing, SupportedLineItem }
