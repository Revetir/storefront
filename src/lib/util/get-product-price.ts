import { HttpTypes } from "@medusajs/types"
import { getPercentageDiff } from "./get-precentage-diff"
import { convertToLocale } from "./money"

export const getPricesForVariant = (variant: any) => {
  if (!variant?.calculated_price?.calculated_amount) {
    return null
  }

  const calculatedAmount = variant.calculated_price.calculated_amount
  const originalAmount = variant.calculated_price.original_amount
  const isPriceList = variant.calculated_price.is_calculated_price_price_list

  // Determine if this is a sale price:
  // 1. Must be from a price list
  // 2. Original amount must exist and be greater than calculated amount
  const isSale = isPriceList && originalAmount && originalAmount > calculatedAmount

  return {
    calculated_price_number: calculatedAmount,
    calculated_price: convertToLocale({
      amount: calculatedAmount,
      currency_code: variant.calculated_price.currency_code,
    }),
    original_price_number: originalAmount,
    original_price: originalAmount ? convertToLocale({
      amount: originalAmount,
      currency_code: variant.calculated_price.currency_code,
    }) : null,
    currency_code: variant.calculated_price.currency_code,
    price_type: isSale ? "sale" : "default",
    percentage_diff: isSale ? getPercentageDiff(originalAmount, calculatedAmount) : 0,
  }
}

export function getProductPrice({
  product,
  variantId,
}: {
  product: HttpTypes.StoreProduct
  variantId?: string
}) {
  if (!product || !product.id) {
    throw new Error("No product provided")
  }

  const cheapestPrice = () => {
    if (!product || !product.variants?.length) {
      return null
    }

    const cheapestVariant: any = product.variants
      .filter((v: any) => !!v.calculated_price)
      .sort((a: any, b: any) => {
        return (
          a.calculated_price.calculated_amount -
          b.calculated_price.calculated_amount
        )
      })[0]

    return getPricesForVariant(cheapestVariant)
  }

  const variantPrice = () => {
    if (!product || !variantId) {
      return null
    }

    const variant: any = product.variants?.find(
      (v) => v.id === variantId || v.sku === variantId
    )

    if (!variant) {
      return null
    }

    return getPricesForVariant(variant)
  }

  return {
    product,
    cheapestPrice: cheapestPrice(),
    variantPrice: variantPrice(),
  }
}
