/**
 * Utility functions for working with brand data in the storefront
 */

export type BrandData = {
  id?: string
  name: string
  slug: string
  blurb?: string
}

/**
 * Format brand names for display with collaboration separator
 * @param brands - Array of brand objects or single brand object
 * @returns Formatted string like "NIKE x OFF-WHITE" with lowercase x separator
 */
export function formatBrandNames(brands: BrandData[] | BrandData | undefined | null): string {
  if (!brands) {
    return ""
  }

  // Handle single brand object (backward compatibility)
  if (!Array.isArray(brands)) {
    return brands.name
  }

  // Handle array of brands
  if (brands.length === 0) {
    return ""
  }

  // Use lowercase 'x' as separator (brands are typically displayed uppercase)
  return brands.map(b => b.name).join(" x ")
}

/**
 * Get the primary (first) brand from a list
 * @param brands - Array of brand objects or single brand object
 * @returns The first brand or undefined
 */
export function getPrimaryBrand(brands: BrandData[] | BrandData | undefined | null): BrandData | undefined {
  if (!brands) {
    return undefined
  }

  // Handle single brand object (backward compatibility)
  if (!Array.isArray(brands)) {
    return brands
  }

  // Handle array of brands
  if (brands.length === 0) {
    return undefined
  }

  return brands[0]
}

/**
 * Check if a product has multiple brands (is a collaboration)
 * @param brands - Array of brand objects or single brand object
 * @returns True if the product has 2 or more brands
 */
export function isCollaboration(brands: BrandData[] | BrandData | undefined | null): boolean {
  if (!brands || !Array.isArray(brands)) {
    return false
  }

  return brands.length > 1
}

/**
 * Get all brands as an array, ensuring backward compatibility
 * @param brands - Array of brand objects or single brand object
 * @returns Array of brand objects
 */
export function getBrandsArray(brands: BrandData[] | BrandData | undefined | null): BrandData[] {
  if (!brands) {
    return []
  }

  // Handle single brand object (backward compatibility)
  if (!Array.isArray(brands)) {
    return [brands]
  }

  return brands
}

/**
 * Get the product URL with brand slug prefix(es)
 * @param brands - Array of brand objects or single brand object
 * @param productHandle - Product handle/slug
 * @returns URL like "/products/nike-air-jordan-1" or "/products/nike-off-white-air-jordan-1" for collaborations
 */
export function getProductUrl(brands: BrandData[] | BrandData | undefined | null, productHandle: string): string {
  const brandsArray = getBrandsArray(brands)

  if (brandsArray.length === 0) {
    return `/products/${productHandle}`
  }

  // Combine all brand slugs with hyphens
  const brandSlugs = brandsArray.map(b => b.slug).join("-")
  return `/products/${brandSlugs}-${productHandle}`
}
