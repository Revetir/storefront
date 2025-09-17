import { searchClient } from "@lib/config"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

export interface AlgoliaProduct {
  objectID: string
  id: string
  title: string
  handle: string
  thumbnail?: string
  brand?: {
    id: string
    name: string
    slug: string
  }
  gender: string[]
  allCategoryHandles: string[]
  allCategoryIds: string[]
  categories: Array<{
    id: string
    handle: string
    name: string
  }>
  variants?: Array<{
    id: string
    title: string
    calculated_price?: {
      calculated_amount: number
      currency_code: string
    }
    pricing?: {
      us?: {
        calculated_amount: number
        currency_code: string
      }
      eu?: {
        calculated_amount: number
        currency_code: string
      }
    }
  }>
  minPrice?: number | null
  minPriceUs?: number | null
  minPriceEu?: number | null
  created_at: string
  updated_at: string
}

export interface AlgoliaSearchResult {
  hits: AlgoliaProduct[]
  nbHits: number
  page: number
  nbPages: number
  hitsPerPage: number
}

export interface AlgoliaFilterOptions {
  gender?: "men" | "women"
  categoryHandle?: string
  brandSlug?: string
  sortBy?: SortOptions
  page?: number
  hitsPerPage?: number
}

/**
 * Search products using Algolia with filters for category and brand
 */
export async function searchProductsWithAlgolia(
  options: AlgoliaFilterOptions = {}
): Promise<AlgoliaSearchResult> {
  const {
    gender,
    categoryHandle,
    brandSlug,
    sortBy = "created_at",
    page = 1,
    hitsPerPage = 20
  } = options

  try {
    const indexName = process.env.NEXT_PUBLIC_ALGOLIA_PRODUCT_INDEX_NAME
    if (!indexName) {
      throw new Error("Algolia product index name not configured")
    }

    // Debug logging
    console.log(`[Algolia Search] Starting search with index: ${indexName}`)
    console.log(`[Algolia Search] Options:`, options)
    console.log(`[Algolia Search] Environment check:`, {
      appId: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ? 'SET' : 'MISSING',
      apiKey: process.env.NEXT_PUBLIC_ALGOLIA_API_KEY ? 'SET' : 'MISSING',
      indexName: process.env.NEXT_PUBLIC_ALGOLIA_PRODUCT_INDEX_NAME ? 'SET' : 'MISSING'
    })

    // Build filters array
    const filters: string[] = []

    // Gender filter - convert to the format used in Algolia
    if (gender) {
      const genderValue = gender === "men" ? "menswear" : "womenswear"
      filters.push(`gender:${genderValue}`)
    }

    // Category filter - use AllCategoryHandles attribute
    if (categoryHandle) {
      // Build the full category handle based on gender
      const genderPrefix = gender === "men" ? "mens" : "womens"
      const fullCategoryHandle = `${genderPrefix}-${categoryHandle}`
      filters.push(`allCategoryHandles:"${fullCategoryHandle}"`)
      console.log(`[Algolia Search] Category filter: looking for "${fullCategoryHandle}" in allCategoryHandles`)
    }

    // Brand filter
    if (brandSlug) {
      filters.push(`brand.slug:"${brandSlug}"`)
      console.log(`[Algolia Search] Brand filter: looking for "${brandSlug}" in brand.slug`)
    }

    console.log(`[Algolia Search] Filters:`, filters)
    console.log(`[Algolia Search] Sort requested:`, sortBy)
    console.log(`[Algolia Search] Index name:`, indexName)

    // Execute search
    const searchResults = await searchClient.search([{
      indexName,
      params: {
        query: "", // Empty query to get all products
        filters: filters.length > 0 ? filters.join(" AND ") : undefined,
        page: page - 1, // Algolia uses 0-based page indexing
        hitsPerPage,
        attributesToRetrieve: [
          'objectID',
          'id',
          'title',
          'handle',
          'thumbnail',
          'brand',
          'gender',
          'allCategoryHandles',
          'categories',
          'variants',
          'minPrice',
          'minPriceUs',
          'minPriceEu',
          'created_at',
          'updated_at'
        ]
        // Note: Sorting will be handled by creating different indices or using Algolia's built-in ranking
      }
    }])

    const result = searchResults.results[0]
    if (!result) {
      throw new Error("No search results returned from Algolia")
    }

    // Debug logging
    console.log(`[Algolia Search] Raw search results:`, searchResults)
    console.log(`[Algolia Search] First result:`, result)

    // Type assertion for proper Algolia search result
    const searchResult = result as any

    console.log(`[Algolia Search] Found ${searchResult.nbHits || 0} products`)
    console.log(`[Algolia Search] Applied filters:`, filters.join(" AND "))
    if (searchResult.hits && searchResult.hits.length > 0) {
      console.log(`[Algolia Search] First hit sample:`, {
        title: searchResult.hits[0].title,
        brand: searchResult.hits[0].brand,
        allCategoryHandles: searchResult.hits[0].allCategoryHandles,
        gender: searchResult.hits[0].gender
      })
    }

    return {
      hits: searchResult.hits as AlgoliaProduct[],
      nbHits: searchResult.nbHits || 0,
      page: (searchResult.page || 0) + 1, // Convert back to 1-based indexing
      nbPages: searchResult.nbPages || 0,
      hitsPerPage: searchResult.hitsPerPage || hitsPerPage
    }
  } catch (error) {
    console.error("Error searching products with Algolia:", error)
    console.error("Search options were:", options)
    console.error("Index name:", process.env.NEXT_PUBLIC_ALGOLIA_PRODUCT_INDEX_NAME)
    console.error("Error occurred during Algolia search")
    
    // Return empty result on error
    return {
      hits: [],
      nbHits: 0,
      page: 1,
      nbPages: 0,
      hitsPerPage
    }
  }
}

/**
 * Convert Algolia products to the format expected by the UI components
 */
export function convertAlgoliaProductsToMedusaFormat(products: AlgoliaProduct[]): any[] {
  return products.map(product => ({
    id: product.id,
    title: product.title,
    handle: product.handle,
    thumbnail: product.thumbnail,
    brand: product.brand,
    categories: product.categories,
    variants: product.variants,
    minPrice: product.minPrice,
    minPriceUs: product.minPriceUs,
    minPriceEu: product.minPriceEu,
    created_at: product.created_at,
    updated_at: product.updated_at,
    // Add any other fields that might be expected by UI components
  }))
}
