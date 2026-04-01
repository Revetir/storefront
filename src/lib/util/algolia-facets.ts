import { searchClient } from "@lib/config"
import { getSaleFacetForCountryCode } from "./sale-region"

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
  saleOnly?: boolean
  countryCode?: string
}

const BRAND_FACET_CACHE_TTL_MS = 60_000
const BRAND_VERIFICATION_CHUNK_SIZE = 50
const brandFacetCache = new Map<string, { expiresAt: number; value: BrandFacet[] }>()

const normalizeSlug = (value: string) => value.trim().toLowerCase()
const escapeFilterValue = (value: string) => value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')

const joinFilters = (filters: string[]) => filters.filter(Boolean).join(" AND ")

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
  const { gender, brandSlug, color, saleOnly, countryCode } = options

  try {
    const indexName = process.env.NEXT_PUBLIC_ALGOLIA_PRODUCT_INDEX_NAME
    if (!indexName) {
      console.error("[Algolia Facets] Product index name not configured")
      return []
    }

    // Build filters for contextual faceting
    const filters: string[] = []
    // Keep facet-driven UI aligned with storefront product queries.
    filters.push("status:published")
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
    if (saleOnly) {
      const saleFacet = getSaleFacetForCountryCode(countryCode)
      filters.push(`${saleFacet}:true`)
    }

    console.log("[Algolia Facets] Fetching categories with filters:", filters.join(" AND ") || "none")

    const result = await searchClient.search([{
      indexName,
      params: {
        query: '', // Empty query to get all products
        filters: filters.length > 0 ? filters.join(" AND ") : undefined,
        facets: ['allCategoryHandles'],
        maxValuesPerFacet: 1000,
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
  const { gender, categoryHandle, color, saleOnly, countryCode } = options

  try {
    const indexName = process.env.NEXT_PUBLIC_ALGOLIA_PRODUCT_INDEX_NAME
    if (!indexName) {
      console.error("[Algolia Facets] Product index name not configured")
      return []
    }

    // Build filters for contextual faceting
    const filters: string[] = []
    // Keep facet-driven UI aligned with storefront product queries.
    filters.push("status:published")
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
    if (saleOnly) {
      const saleFacet = getSaleFacetForCountryCode(countryCode)
      filters.push(`${saleFacet}:true`)
    }

    const baseFilter = joinFilters(filters)
    const cacheKey = `${indexName}::${baseFilter || "none"}`
    const cached = brandFacetCache.get(cacheKey)
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value
    }

    console.log("[Algolia Facets] Fetching brands with filters:", baseFilter || "none")

    const result = await searchClient.search([{
      indexName,
      params: {
        query: '',
        filters: baseFilter || undefined,
        facets: ['brands.slug'],
        maxValuesPerFacet: 1000,
        hitsPerPage: 0
      }
    }])

    const searchResult = result.results[0] as any
    const facets = searchResult.facets?.['brands.slug'] || {}

    const facetBrandSlugs = Object.keys(facets)
      .map(normalizeSlug)
      .filter(Boolean)

    console.log(`[Algolia Facets] Found ${facetBrandSlugs.length} brand facet values, verifying product hits`)

    if (facetBrandSlugs.length === 0) {
      brandFacetCache.set(cacheKey, {
        expiresAt: Date.now() + BRAND_FACET_CACHE_TTL_MS,
        value: [],
      })
      return []
    }

    const verifiedSlugs: string[] = []
    for (let i = 0; i < facetBrandSlugs.length; i += BRAND_VERIFICATION_CHUNK_SIZE) {
      const chunk = facetBrandSlugs.slice(i, i + BRAND_VERIFICATION_CHUNK_SIZE)
      const verificationResult = await searchClient.search(
        chunk.map((slug) => {
          const escapedSlug = escapeFilterValue(slug)
          const scopedFilter = joinFilters([
            baseFilter,
            `brands.slug:"${escapedSlug}"`,
          ])

          return {
            indexName,
            params: {
              query: '',
              filters: scopedFilter,
              hitsPerPage: 0,
            },
          }
        })
      )

      verificationResult.results.forEach((res: any, idx: number) => {
        if ((res?.nbHits || 0) > 0) {
          verifiedSlugs.push(chunk[idx])
        }
      })
    }

    const deduped = Array.from(new Set(verifiedSlugs)).map((slug) => ({ slug }))
    console.log(`[Algolia Facets] Returning ${deduped.length} brands with published products after verification`)

    brandFacetCache.set(cacheKey, {
      expiresAt: Date.now() + BRAND_FACET_CACHE_TTL_MS,
      value: deduped,
    })

    return deduped
  } catch (error) {
    console.error("[Algolia Facets] Error fetching brand facets:", error)
    return []
  }
}
