import { searchClient } from "@lib/config"

export interface CategoryFacet {
  handle: string
}

export interface BrandFacet {
  slug: string
}

export interface AlgoliaFacetOptions {
  gender?: "men" | "women"
  categoryHandle?: string
  brandSlug?: string
  color?: string
}

async function disableNextCache() {
  if (!process.env.NEXT_RUNTIME) {
    return
  }
  const { unstable_noStore } = await import("next/cache")
  unstable_noStore()
}

/**
 * Get available categories from Algolia facets (contextual based on current filters)
 * Returns only categories that have products matching the current filter context
 *
 * @param options - Filter options (gender, brandSlug, color)
 * @returns Array of category handles that have products
 *
 * @example
 * // Get all men's categories with products
 * const categories = await getAvailableCategories({ gender: "men" })
 *
 * @example
 * // Get categories that have Balenciaga products in menswear
 * const categories = await getAvailableCategories({
 *   gender: "men",
 *   brandSlug: "balenciaga"
 * })
 *
 * @example
 * // Get categories that have black products
 * const categories = await getAvailableCategories({
 *   gender: "men",
 *   color: "Black"
 * })
 */
export async function getAvailableCategories(
  options: AlgoliaFacetOptions = {}
): Promise<CategoryFacet[]> {
  await disableNextCache()
  const { gender, brandSlug, color } = options

  try {
    const indexName = process.env.NEXT_PUBLIC_ALGOLIA_PRODUCT_INDEX_NAME
    if (!indexName) {
      console.error("[Algolia Facets] Product index name not configured")
      return []
    }

    // Build filters for contextual faceting
    const filters: string[] = []
    if (gender) {
      const genderValue = gender === "men" ? "menswear" : "womenswear"
      filters.push(`gender:${genderValue}`)
    }
    if (brandSlug) {
      filters.push(`brands.slug:"${brandSlug}"`)
    }
    if (color) {
      filters.push(`primaryColor:"${color}"`)
    }

    console.log("[Algolia Facets] Fetching categories with filters:", filters.join(" AND ") || "none")

    const result = await searchClient.search([{
      indexName,
      params: {
        query: '', // Empty query to get all products
        filters: filters.length > 0 ? filters.join(" AND ") : undefined,
        facets: ['allCategoryHandles'],
        maxFacetHits: 1000,
        hitsPerPage: 0 // Only want facet data, not products
      }
    }])

    const searchResult = result.results[0] as any
    const facets = searchResult.facets?.allCategoryHandles || {}

    const categoryHandles = Object.keys(facets)
    console.log(`[Algolia Facets] Found ${categoryHandles.length} categories with products`)

    // Return just the handles (no counts per user request)
    return categoryHandles.map(handle => ({ handle }))
  } catch (error) {
    console.error("[Algolia Facets] Error fetching category facets:", error)
    return []
  }
}

/**
 * Get available brands from Algolia facets (contextual based on current filters)
 * Returns only brands that have products matching the current filter context
 *
 * @param options - Filter options (gender, categoryHandle, color)
 * @returns Array of brand slugs that have products
 *
 * @example
 * // Get all brands with men's products
 * const brands = await getAvailableBrands({ gender: "men" })
 *
 * @example
 * // Get brands that sell men's pants
 * const brands = await getAvailableBrands({
 *   gender: "men",
 *   categoryHandle: "pants"
 * })
 *
 * @example
 * // Get brands that sell black products
 * const brands = await getAvailableBrands({
 *   gender: "men",
 *   color: "Black"
 * })
 */
export async function getAvailableBrands(
  options: AlgoliaFacetOptions = {}
): Promise<BrandFacet[]> {
  await disableNextCache()
  const { gender, categoryHandle, color } = options

  try {
    const indexName = process.env.NEXT_PUBLIC_ALGOLIA_PRODUCT_INDEX_NAME
    if (!indexName) {
      console.error("[Algolia Facets] Product index name not configured")
      return []
    }

    // Build filters for contextual faceting
    const filters: string[] = []
    if (gender) {
      const genderValue = gender === "men" ? "menswear" : "womenswear"
      filters.push(`gender:${genderValue}`)
    }
    if (categoryHandle) {
      const genderPrefix = gender === "men" ? "mens" : "womens"
      const fullCategoryHandle = `${genderPrefix}-${categoryHandle}`
      filters.push(`allCategoryHandles:"${fullCategoryHandle}"`)
    }
    if (color) {
      filters.push(`primaryColor:"${color}"`)
    }

    console.log("[Algolia Facets] Fetching brands with filters:", filters.join(" AND ") || "none")

    const result = await searchClient.search([{
      indexName,
      params: {
        query: '',
        filters: filters.length > 0 ? filters.join(" AND ") : undefined,
        facets: ['brands.slug'],
        maxFacetHits: 1000,
        hitsPerPage: 0
      }
    }])

    const searchResult = result.results[0] as any
    const facets = searchResult.facets?.['brands.slug'] || {}

    const brandSlugs = Object.keys(facets)
    console.log(`[Algolia Facets] Found ${brandSlugs.length} brands with products`)

    return brandSlugs.map(slug => ({ slug }))
  } catch (error) {
    console.error("[Algolia Facets] Error fetching brand facets:", error)
    return []
  }
}
