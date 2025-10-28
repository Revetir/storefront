import { HttpTypes } from "@medusajs/types"
import { mapCategoryToTemplate } from "@lib/data/sizing-templates"

export interface ProductMeasurementsData {
  measurements_by_variant: Record<string, Record<string, { value: number; unit: string }>>
  template: string | null
}

/**
 * Fetch product measurements from API
 */
export async function getProductMeasurements(productId: string): Promise<ProductMeasurementsData | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
    const response = await fetch(`${baseUrl}/store/products/${productId}/measurements`)

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Failed to fetch product measurements:", error)
    return null
  }
}

/**
 * Get the primary category name for a product
 */
export const getProductCategory = (product: HttpTypes.StoreProduct): string | undefined => {
  return product.categories?.[0]?.name
}

/**
 * Get the best matching category for sizing from product's category hierarchy
 */
export const getBestSizingCategory = async (product: HttpTypes.StoreProduct): Promise<string | undefined> => {
  if (!product.categories || product.categories.length === 0) {
    return undefined
  }

  // Try each category in the product's categories array
  for (const category of product.categories) {
    const mappedCategory = await mapCategoryToTemplate(category.name, category.id)
    // If we get a specific template, use it
    if (mappedCategory) {
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
export const getProductTemplateCategory = async (product: HttpTypes.StoreProduct): Promise<string | undefined> => {
  if (!product.categories || product.categories.length === 0) {
    return undefined
  }

  // Collect all template mappings from all categories
  const templateCategories = new Set<string>()

  for (const category of product.categories) {
    const mappedCategory = await mapCategoryToTemplate(category.name, category.id)
    if (mappedCategory) {
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

  // No template found
  return undefined
}

/**
 * Check if a product category supports sizing
 */
export const isSizingSupported = async (categoryName: string): Promise<boolean> => {
  const mappedCategory = await mapCategoryToTemplate(categoryName)
  if (!mappedCategory) return false

  const supportedCategories = [
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
 * Get available sizes for a product from its variants
 */
export const getAvailableSizes = (product: HttpTypes.StoreProduct): string[] => {
  if (!product.variants || product.variants.length === 0) return []

  // Get variant titles (these are the size names)
  return product.variants.map(v => v.title || "").filter(Boolean)
}
