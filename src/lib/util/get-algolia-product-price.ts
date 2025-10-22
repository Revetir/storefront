import { convertToLocale } from "./money"
import { AlgoliaProduct } from "./algolia-filters"
import { getPercentageDiff } from "./get-precentage-diff"

export interface AlgoliaProductPrice {
  calculated_price_number: number
  calculated_price: string
  original_price_number?: number
  original_price?: string
  currency_code: string
  price_type: "default" | "sale"
  percentage_diff?: string
}

/**
 * Determine which region pricing to use based on country code
 */
function getRegionPricing(product: AlgoliaProduct, countryCode: string) {
  // Map country codes to regions
  const usCountries = ['us', 'ca'] // US and Canada use USD
  const euCountries = ['gb', 'de', 'fr', 'it', 'es', 'nl', 'be', 'at', 'ie', 'pt', 'fi', 'dk', 'se', 'no', 'ch', 'lu', 'mt', 'cy', 'ee', 'lv', 'lt', 'pl', 'cz', 'sk', 'hu', 'si', 'hr', 'ro', 'bg', 'gr']
  
  const isUSRegion = usCountries.includes(countryCode.toLowerCase())
  const isEURegion = euCountries.includes(countryCode.toLowerCase())
  
  if (isUSRegion) {
    return {
      minPrice: product.minPriceUs || product.minPrice,
      currency: 'USD'
    }
  } else if (isEURegion) {
    return {
      minPrice: product.minPriceEu,
      currency: 'EUR'
    }
  } else {
    // Default to US pricing
    return {
      minPrice: product.minPriceUs || product.minPrice,
      currency: 'USD'
    }
  }
}

/**
 * Get price information from Algolia product using region-specific pricing
 * This function finds the cheapest variant and includes sale price information
 */
export function getAlgoliaProductPrice(product: AlgoliaProduct, countryCode: string = 'us'): AlgoliaProductPrice | null {
  if (!product.variants || product.variants.length === 0) {
    return null
  }

  // Get region-specific pricing
  const usCountries = ['us', 'ca']
  const euCountries = ['gb', 'de', 'fr', 'it', 'es', 'nl', 'be', 'at', 'ie', 'pt', 'fi', 'dk', 'se', 'no', 'ch', 'lu', 'mt', 'cy', 'ee', 'lv', 'lt', 'pl', 'cz', 'sk', 'hu', 'si', 'hr', 'ro', 'bg', 'gr']
  
  const isUSRegion = usCountries.includes(countryCode.toLowerCase())
  const isEURegion = euCountries.includes(countryCode.toLowerCase())
  
  // Find the cheapest variant with pricing data
  let cheapestVariant = null
  let minPrice = Infinity
  
  for (const variant of product.variants) {
    let variantPricing = null
    
    if (isUSRegion && variant.pricing?.us) {
      variantPricing = variant.pricing.us
    } else if (isEURegion && variant.pricing?.eu) {
      variantPricing = variant.pricing.eu
    } else {
      // Fallback to US pricing or original calculated_price
      variantPricing = variant.pricing?.us || variant.calculated_price
    }
    
    if (variantPricing?.calculated_amount && variantPricing.calculated_amount < minPrice) {
      minPrice = variantPricing.calculated_amount
      cheapestVariant = variantPricing
    }
  }
  
  if (!cheapestVariant || cheapestVariant.calculated_amount <= 0) {
    return null
  }

  const isSale = cheapestVariant.price_list_type === "sale"
  const hasOriginalPrice = cheapestVariant.original_amount && cheapestVariant.original_amount > cheapestVariant.calculated_amount

  const result: AlgoliaProductPrice = {
    calculated_price_number: cheapestVariant.calculated_amount,
    calculated_price: convertToLocale({
      amount: cheapestVariant.calculated_amount,
      currency_code: cheapestVariant.currency_code,
    }),
    currency_code: cheapestVariant.currency_code,
    price_type: isSale ? "sale" : "default",
  }

  // Add original price and percentage diff if it's a sale
  if (isSale && hasOriginalPrice) {
    result.original_price_number = cheapestVariant.original_amount
    result.original_price = convertToLocale({
      amount: cheapestVariant.original_amount,
      currency_code: cheapestVariant.currency_code,
    })
    result.percentage_diff = getPercentageDiff(
      cheapestVariant.original_amount,
      cheapestVariant.calculated_amount
    )
  }

  return result
}

/**
 * Get variant pricing for a specific region
 */
export function getVariantPricing(variant: any, countryCode: string = 'us') {
  const usCountries = ['us', 'ca']
  const euCountries = ['gb', 'de', 'fr', 'it', 'es', 'nl', 'be', 'at', 'ie', 'pt', 'fi', 'dk', 'se', 'no', 'ch', 'lu', 'mt', 'cy', 'ee', 'lv', 'lt', 'pl', 'cz', 'sk', 'hu', 'si', 'hr', 'ro', 'bg', 'gr']
  
  const isUSRegion = usCountries.includes(countryCode.toLowerCase())
  const isEURegion = euCountries.includes(countryCode.toLowerCase())
  
  if (isUSRegion && variant.pricing?.us) {
    return variant.pricing.us
  } else if (isEURegion && variant.pricing?.eu) {
    return variant.pricing.eu
  } else {
    // Fallback to US pricing or original calculated_price
    return variant.pricing?.us || variant.calculated_price
  }
}

/**
 * Get variant price information with sale price support
 */
export function getVariantPrice(variant: any, countryCode: string = 'us'): AlgoliaProductPrice | null {
  const variantPricing = getVariantPricing(variant, countryCode)
  
  if (!variantPricing?.calculated_amount || variantPricing.calculated_amount <= 0) {
    return null
  }

  const isSale = variantPricing.price_list_type === "sale"
  const hasOriginalPrice = variantPricing.original_amount && variantPricing.original_amount > variantPricing.calculated_amount

  const result: AlgoliaProductPrice = {
    calculated_price_number: variantPricing.calculated_amount,
    calculated_price: convertToLocale({
      amount: variantPricing.calculated_amount,
      currency_code: variantPricing.currency_code,
    }),
    currency_code: variantPricing.currency_code,
    price_type: isSale ? "sale" : "default",
  }

  // Add original price and percentage diff if it's a sale
  if (isSale && hasOriginalPrice) {
    result.original_price_number = variantPricing.original_amount
    result.original_price = convertToLocale({
      amount: variantPricing.original_amount,
      currency_code: variantPricing.currency_code,
    })
    result.percentage_diff = getPercentageDiff(
      variantPricing.original_amount,
      variantPricing.calculated_amount
    )
  }

  return result
}

/**
 * Check if a product is from Algolia (has minPrice and pricing structure)
 */
export function isAlgoliaProduct(product: any): product is AlgoliaProduct {
  return (
    product.minPrice !== undefined &&
    product.variants &&
    product.variants.length > 0 &&
    product.variants[0]?.pricing !== undefined
  )
}
