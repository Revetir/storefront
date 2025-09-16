import { convertToLocale } from "./money"
import { AlgoliaProduct } from "./algolia-filters"

export interface AlgoliaProductPrice {
  calculated_price_number: number
  calculated_price: string
  original_price_number?: number
  original_price?: string
  currency_code: string
  price_type: "default"
  percentage_diff?: string
}

/**
 * Get price information from Algolia product using minPrice
 */
export function getAlgoliaProductPrice(product: AlgoliaProduct): AlgoliaProductPrice | null {
  if (!product.minPrice || product.minPrice <= 0) {
    return null
  }

  // Default to USD if no currency info available
  const currency_code = "USD"

  return {
    calculated_price_number: product.minPrice,
    calculated_price: convertToLocale({
      amount: product.minPrice,
      currency_code,
    }),
    currency_code,
    price_type: "default" as const,
  }
}

/**
 * Check if a product is from Algolia (has minPrice but no variants with calculated_price)
 */
export function isAlgoliaProduct(product: any): product is AlgoliaProduct {
  return (
    product.minPrice !== undefined &&
    (!product.variants || 
     product.variants.length === 0 || 
     !product.variants[0]?.calculated_price?.calculated_amount)
  )
}
