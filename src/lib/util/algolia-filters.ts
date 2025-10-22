import { searchClient } from "@lib/config"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

export interface AlgoliaProduct {
  objectID: string
  id: string
  title: string
  handle: string
  thumbnail?: string
  brands?: Array<{
    id: string
    name: string
    slug: string
  }>
  product_sku?: string | null
  gender: string[]
  allCategoryHandles: string[]
  allCategoryIds: string[]
  categories: Array<{
    id: string
    handle: string
    name: string
  }>
  metadata?: Record<string, any>
  variants?: Array<{
    id: string
    title: string
    calculated_price?: {
      calculated_amount: number
      original_amount: number
      currency_code: string
      price_list_type: string
    }
    pricing?: {
      us?: {
        calculated_amount: number
        original_amount: number
        currency_code: string
        price_list_type: string
      }
      eu?: {
        calculated_amount: number
        original_amount: number
        currency_code: string
        price_list_type: string
      }
    }
  }>
  minPrice?: number | null
  minPriceUs?: number | null
  minPriceEu?: number | null
  primaryColor?: string
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
  color?: string
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
    color,
    sortBy = "created_at",
    page = 1,
    hitsPerPage = 20
  } = options

  try {
    const indexName = process.env.NEXT_PUBLIC_ALGOLIA_PRODUCT_INDEX_NAME
    if (!indexName) {
      throw new Error("Algolia product index name not configured")
    }


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
    }

    // Brand filter - brands is now always an array
    if (brandSlug) {
      filters.push(`brands.slug:"${brandSlug}"`)
    }

    // Color filter
    if (color) {
      filters.push(`primaryColor:"${color}"`)
    }


    // Map frontend sort options to Algolia index names
    // Note: You'll need to create replica indices in Algolia dashboard for each sort option
    const getAlgoliaIndexName = (sortBy: SortOptions): string => {
      const baseIndexName = process.env.NEXT_PUBLIC_ALGOLIA_PRODUCT_INDEX_NAME
      if (!baseIndexName) {
        throw new Error("Algolia product index name not configured")
      }
      
      switch (sortBy) {
        case "created_at":
          return baseIndexName // Default index (newest first)
        case "price_asc":
          return `${baseIndexName}_price_asc` // Replica index for price ascending
        case "price_desc":
          return `${baseIndexName}_price_desc` // Replica index for price descending
        default:
          return baseIndexName
      }
    }

    // Get the appropriate index name based on sorting
    const searchIndexName = getAlgoliaIndexName(sortBy)

    // Execute search
    const searchResults = await searchClient.search([{
      indexName: searchIndexName,
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
          'brands',
          'product_sku',
          'gender',
          'allCategoryHandles',
          'categories',
          'metadata',
          'variants',
          'minPrice',
          'minPriceUs',
          'minPriceEu',
          'primaryColor',
          'created_at',
          'updated_at'
        ]
      }
    }])

    const result = searchResults.results[0]
    if (!result) {
      throw new Error("No search results returned from Algolia")
    }

    // Type assertion for proper Algolia search result
    const searchResult = result as any

    return {
      hits: searchResult.hits as AlgoliaProduct[],
      nbHits: searchResult.nbHits || 0,
      page: (searchResult.page || 0) + 1, // Convert back to 1-based indexing
      nbPages: searchResult.nbPages || 0,
      hitsPerPage: searchResult.hitsPerPage || hitsPerPage
    }
  } catch (error) {
    console.error("Error searching products with Algolia:", error)
    
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
    brands: product.brands,
    categories: product.categories,
    metadata: product.metadata,
    variants: product.variants,
    minPrice: product.minPrice,
    minPriceUs: product.minPriceUs,
    minPriceEu: product.minPriceEu,
    created_at: product.created_at,
    updated_at: product.updated_at,
    // Add any other fields that might be expected by UI components
  }))
}