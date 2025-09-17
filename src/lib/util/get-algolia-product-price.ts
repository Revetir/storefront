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
 * Get price information from Algolia product using region-specific minPrice
 */
export function getAlgoliaProductPrice(product: AlgoliaProduct, countryCode: string = 'us'): AlgoliaProductPrice | null {
  const regionPricing = getRegionPricing(product, countryCode)
  
  if (!regionPricing.minPrice || regionPricing.minPrice <= 0) {
    return null
  }

  return {
    calculated_price_number: regionPricing.minPrice,
    calculated_price: convertToLocale({
      amount: regionPricing.minPrice,
      currency_code: regionPricing.currency,
    }),
    currency_code: regionPricing.currency,
    price_type: "default" as const,
  }
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
