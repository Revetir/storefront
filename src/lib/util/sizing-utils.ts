import { HttpTypes } from "@medusajs/types"
import { mapCategoryToTemplate } from "@lib/data/sizing-templates"

export interface ProductSizingData {
  measurements: Record<string, Record<string, number>>
  fit?: string
  material?: string
  care_instructions?: string
}

/**
 * Check if a product has sizing metadata
 */
export const hasSizingData = (product: HttpTypes.StoreProduct): boolean => {
  return !!(product.metadata?.sizing)
}

/**
 * Get sizing data from product metadata
 */
export const getProductSizingData = (product: HttpTypes.StoreProduct): ProductSizingData | null => {
  if (!hasSizingData(product)) return null
  
  return product.metadata?.sizing as ProductSizingData
}

/**
 * Get the primary category name for a product
 */
export const getProductCategory = (product: HttpTypes.StoreProduct): string => {
  return product.categories?.[0]?.name || "Generic"
}

/**
 * Get the best matching category for sizing from product's category hierarchy
 */
export const getBestSizingCategory = (product: HttpTypes.StoreProduct): string => {
  if (!product.categories || product.categories.length === 0) {
    return "Generic"
  }

  // Try each category in the product's categories array
  for (const category of product.categories) {
    const mappedCategory = mapCategoryToTemplate(category.name, category.id)
    // If we get a specific template (not Generic), use it
    if (mappedCategory !== "Generic") {
      return category.name
    }
  }

  // If no specific mapping found, return the first category
  return product.categories[0].name
}

/**
 * Get the mapped template category for a product using hierarchical lookup
 * Special handling for unisex shoes (products in both mens-shoes and womens-shoes)
 */
export const getProductTemplateCategory = (product: HttpTypes.StoreProduct): string => {
  if (!product.categories || product.categories.length === 0) {
    return "Generic"
  }

  // Collect all template mappings from all categories
  const templateCategories = new Set<string>()

  for (const category of product.categories) {
    const mappedCategory = mapCategoryToTemplate(category.name, category.id)
    if (mappedCategory !== "Generic") {
      templateCategories.add(mappedCategory)
    }
  }

  // Check if product has both Shoes Men and Shoes Women -> it's unisex
  if (templateCategories.has("Shoes Men") && templateCategories.has("Shoes Women")) {
    return "Shoes Unisex"
  }

  // If we have exactly one specific template, use it
  if (templateCategories.size === 1) {
    return Array.from(templateCategories)[0]
  }

  // If we have multiple different templates (not shoes), use the first one
  if (templateCategories.size > 1) {
    return Array.from(templateCategories)[0]
  }

  // Final fallback
  return "Generic"
}

/**
 * Check if a product category supports sizing
 */
export const isSizingSupported = (categoryName: string): boolean => {
  const mappedCategory = mapCategoryToTemplate(categoryName)
  const supportedCategories = [
    "Shirts",
    "Sweatshirts",
    "Pants",
    "Shoes Unisex",
    "Shoes Men",
    "Shoes Women",
  ]
  return supportedCategories.some(cat => 
    cat.toLowerCase() === mappedCategory.toLowerCase()
  )
}


/**
 * Format measurement value with units
 */
export const formatMeasurement = (value: number, units: string = "cm"): string => {
  return `${value}${units}`
}

/**
 * Get available sizes for a product
 */
export const getAvailableSizes = (product: HttpTypes.StoreProduct): string[] => {
  const sizingData = getProductSizingData(product)
  if (!sizingData?.measurements) return []
  
  // Get sizes from the first measurement (assuming all measurements have the same sizes)
  const firstMeasurement = Object.values(sizingData.measurements)[0]
  return Object.keys(firstMeasurement || {})
}


