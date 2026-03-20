"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "./cookies"

export type StorePaymentCollectionCheckoutContextResponse = {
  payment_collection: any
  order: any
  country_code: string
}

type CheckoutProduct = {
  id: string
  brands?: Array<{ id?: string; name: string; slug: string }>
  variants?: Array<{
    id: string
    calculated_price?: Record<string, any> | null
    prices?: Array<Record<string, any>> | null
  }>
}

type StoreProductResponse = {
  product: CheckoutProduct
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

const resolveVariantOriginalUnitPrice = (
  variant: any,
  currencyCode?: string
): number | null => {
  const matchingVariantPrice = Array.isArray(variant?.prices)
    ? variant.prices.find(
        (price: any) =>
          String(price?.currency_code || "").toLowerCase() ===
          String(currencyCode || "").toLowerCase()
      )
    : null

  return firstFinite(
    variant?.calculated_price?.original_amount_with_tax,
    variant?.calculated_price?.original_amount,
    variant?.calculated_price?.original?.amount,
    variant?.calculated_price?.calculated_amount_with_tax,
    variant?.calculated_price?.calculated_amount,
    variant?.calculated_price?.calculated?.amount,
    matchingVariantPrice?.amount,
    matchingVariantPrice?.raw_amount?.value,
    variant?.prices?.[0]?.amount,
    variant?.prices?.[0]?.raw_amount?.value
  )
}

const enrichOrderItems = async ({
  order,
  countryCode,
  headers,
}: {
  order: any
  countryCode?: string
  headers: Record<string, string>
}) => {
  const items = Array.isArray(order?.items) ? order.items : []
  if (!items.length) {
    return order
  }

  const productIds = Array.from(
    new Set(
      items
        .map((item: any) => item?.product_id)
        .filter((productId: unknown): productId is string => typeof productId === "string")
    )
  )

  if (!productIds.length) {
    return order
  }

  const products = await Promise.all(
    productIds.map(async (productId) => {
      const baseQuery = {
        fields: "id,handle,+brands.*,variants.id,variants.calculated_price.*,variants.prices.*",
      }

      const contextualQuery = {
        ...baseQuery,
        ...(order?.region_id ? { region_id: order.region_id } : {}),
        ...(countryCode ? { country_code: countryCode } : {}),
      }

      let productResponse = await sdk.client
        .fetch<StoreProductResponse>(`/store/products/${productId}`, {
          method: "GET",
          headers,
          query: contextualQuery,
          cache: "no-store",
        })
        .catch(() => null)

      if (!productResponse?.product) {
        productResponse = await sdk.client
          .fetch<StoreProductResponse>(`/store/products/${productId}`, {
            method: "GET",
            headers,
            query: baseQuery,
            cache: "no-store",
          })
          .catch(() => null)
      }

      return productResponse?.product || null
    })
  )

  const productsById = new Map<string, CheckoutProduct>(
    products
      .filter((product): product is CheckoutProduct => Boolean(product?.id))
      .map((product) => [product.id, product])
  )

  const enrichedItems = items.map((item: any) => {
    const product = productsById.get(item.product_id)
    const variant = product?.variants?.find((productVariant) => productVariant.id === item.variant_id)

    const unitPrice = firstFinite(
      item.unit_price,
      item.detail?.unit_price,
      item.raw_unit_price?.value
    )

    const compareAtUnitPrice = firstFinite(
      item.compare_at_unit_price,
      item.detail?.compare_at_unit_price,
      item.raw_compare_at_unit_price?.value
    )

    const variantOriginalUnitPrice = resolveVariantOriginalUnitPrice(
      variant,
      order?.currency_code
    )
    const fallbackCompareAtUnitPrice =
      unitPrice !== null &&
      variantOriginalUnitPrice !== null &&
      variantOriginalUnitPrice > unitPrice
        ? variantOriginalUnitPrice
        : null

    const resolvedCompareAtUnitPrice =
      compareAtUnitPrice !== null
        ? compareAtUnitPrice
        : fallbackCompareAtUnitPrice

    const mergedProduct = {
      ...(item.product || {}),
      ...(product || {}),
      brands: product?.brands || item.product?.brands || [],
    }

    const mergedVariant = item.variant
      ? {
          ...item.variant,
          ...(variant || {}),
          product: mergedProduct,
        }
      : variant
        ? {
            ...variant,
            product: mergedProduct,
          }
        : item.variant

    return {
      ...item,
      compare_at_unit_price: resolvedCompareAtUnitPrice,
      product: mergedProduct,
      variant: mergedVariant,
    }
  })

  return {
    ...order,
    items: enrichedItems,
  }
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

  const context = await sdk.client
    .fetch<StorePaymentCollectionCheckoutContextResponse>(
      `/store/payment-collections/${paymentCollectionId}/checkout-context`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      }
    )
    .catch(() => null)

  if (!context?.order) {
    return context
  }

  const enrichedOrder = await enrichOrderItems({
    order: context.order,
    countryCode: context.country_code,
    headers,
  })

  return {
    ...context,
    order: enrichedOrder,
  }
}
