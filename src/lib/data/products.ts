"use server"

import { sdk } from "@lib/config"
import { sortProducts } from "@lib/util/sort-products"
import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { getRegion, retrieveRegion } from "./regions"

export type ProductQueryParams = Record<string, any>

export const listProducts = async ({
  pageParam = 1,
  queryParams,
  countryCode,
  regionId,
}: {
  pageParam?: number
  queryParams?: ProductQueryParams
  countryCode?: string
  regionId?: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: ProductQueryParams
}> => {
  if (!countryCode && !regionId) {
    throw new Error("Country code or region ID is required")
  }

  const limit = queryParams?.limit || 12
  const _pageParam = Math.max(pageParam, 1)
  const offset = _pageParam === 1 ? 0 : (_pageParam - 1) * limit

  let region: HttpTypes.StoreRegion | undefined | null

  if (countryCode) {
    region = await getRegion(countryCode)
  } else {
    region = await retrieveRegion(regionId!)  
  }

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const finalQuery = {
    limit,
    offset,
    region_id: region.id,
    fields: "id,title,handle,status,thumbnail,created_at,updated_at,deleted_at,is_giftcard,discountable,description,subtitle,material,weight,length,height,width,hs_code,origin_country,mid_code,metadata",
    ...queryParams,
  }

  const next = {
    ...(await getCacheOptions("products")),
    revalidate: 7200, // Increase to 2 hours for better cache hit rates
    tags: [`products-${region.id}`, `products-${JSON.stringify(finalQuery)}`], // Add specific cache tags
  }
  
  console.log('API Query Parameters:', finalQuery)
  
  return sdk.client
    .fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
      "/store/products",
      {
        method: "GET",
        query: finalQuery,
        headers,
        next,
      }
    )
    .then(({ products, count }) => {
      const nextPage = count > offset + limit ? pageParam + 1 : null

      return {
        response: {
          products,
          count,
        },
        nextPage,
        queryParams,
      }
    })
}

/**
 * This will fetch products with brand filtering support using our custom endpoint.
 * It bypasses MedusaJS's validation limitations for brand_id parameter.
 */
export const listProductsWithBrandSupport = async ({
  page = 1,
  queryParams,
  sortBy = "created_at",
  countryCode,
}: {
  page?: number
  queryParams?: ProductQueryParams
  sortBy?: SortOptions
  countryCode: string
}): Promise<{ 
  response: { products: HttpTypes.StoreProduct[]; count: number }; 
  nextPage: number | null; 
  totalPages: number;
  currentPage: number;
  queryParams?: ProductQueryParams 
}> => {
  const limit = queryParams?.limit || 60
  const offset = (page - 1) * limit

  if (!countryCode) {
    throw new Error("Country code is required")
  }

  const region = await getRegion(countryCode)
  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
      totalPages: 0,
      currentPage: page,
    }
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const finalQuery = {
    limit,
    offset,
    region_id: region.id,
    fields: "id,title,handle,status,thumbnail,created_at,updated_at,deleted_at,is_giftcard,discountable,description,subtitle,material,weight,length,height,width,hs_code,origin_country,mid_code,metadata,*brand.*,*type.*",
    ...queryParams,
  }

  const next = {
    ...(await getCacheOptions("products")),
    revalidate: 7200,
    tags: [`products-with-brands-${region.id}`, `products-with-brands-${JSON.stringify(finalQuery)}`],
  }
  
  console.log('Brand-filtered API Query Parameters:', finalQuery)
  
  try {
    const { products, count } = await sdk.client
      .fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
        "/store/products-with-brands", // Use our custom endpoint
        {
          method: "GET",
          query: finalQuery,
          headers,
          next,
        }
      )

    // Apply client-side sorting if needed
    let sortedProducts = products
    if (sortBy !== "created_at") {
      sortedProducts = sortProducts(products, sortBy)
    }

    const totalPages = Math.ceil(count / limit)
    const nextPage = page < totalPages ? page + 1 : null

    return {
      response: {
        products: sortedProducts,
        count,
      },
      nextPage,
      totalPages,
      currentPage: page,
      queryParams: finalQuery,
    }
  } catch (error) {
    console.error("Error fetching products with brand support:", error)
    // Fallback to empty result
    return {
      response: { products: [], count: 0 },
      nextPage: null,
      totalPages: 0,
      currentPage: page,
      queryParams: finalQuery,
    }
  }
}

/**
 * This will fetch products with filtering applied and sort them based on the sortBy parameter.
 * It will then return the paginated products based on the page and limit parameters.
 */
export const listProductsWithSort = async ({
  page = 1,
  queryParams,
  sortBy = "created_at",
  countryCode,
}: {
  page?: number
  queryParams?: ProductQueryParams
  sortBy?: SortOptions
  countryCode: string
}): Promise<{ 
  response: { products: HttpTypes.StoreProduct[]; count: number }; 
  nextPage: number | null; 
  totalPages: number;
  currentPage: number;
  queryParams?: ProductQueryParams 
}> => {
  const limit = queryParams?.limit || 60 // Restored to 60 products per page
  
  // For price sorting, we need to fetch more products and sort client-side
  // since Medusa's API doesn't properly support server-side price sorting
  const isPriceSorting = sortBy === "price_asc" || sortBy === "price_desc"
  const fetchLimit = isPriceSorting ? limit * 3 : limit // Fetch more for price sorting
  const offset = isPriceSorting ? 0 : (page - 1) * limit

  // Use proper server-side pagination and sorting for non-price sorts
  const finalQueryParams = {
    ...queryParams,
    limit: fetchLimit,
    offset,
    // Only use server-side sorting for created_at
    ...(sortBy === "created_at" && { order: "-created_at" }),
  }

  const {
    response: { products, count },
  } = await listProducts({
    pageParam: 1, // Always start from page 1
    queryParams: finalQueryParams,
    countryCode,
  })

  let sortedProducts = products
  let totalCount = count

  // Apply client-side sorting for price sorting
  if (isPriceSorting) {
    sortedProducts = sortProducts(products, sortBy)
    totalCount = sortedProducts.length
  }

  // Apply pagination for price sorting
  const startIndex = isPriceSorting ? (page - 1) * limit : 0
  const endIndex = isPriceSorting ? startIndex + limit : sortedProducts.length
  const paginatedProducts = isPriceSorting 
    ? sortedProducts.slice(startIndex, endIndex)
    : sortedProducts

  const totalPages = Math.ceil(totalCount / limit)
  const nextPage = page < totalPages ? page + 1 : null

  return {
    response: {
      products: paginatedProducts,
      count: totalCount,
    },
    nextPage,
    totalPages,
    currentPage: page,
    queryParams: finalQueryParams,
  }
}

// Helper function to convert frontend sort options to Medusa's order format
const getSortOrder = (sortBy: SortOptions): string => {
  switch (sortBy) {
    case "created_at":
      return "-created_at" // Descending order for latest arrivals
    case "price_asc":
      return "variants.calculated_price" // Ascending price
    case "price_desc":
      return "-variants.calculated_price" // Descending price
    default:
      return "-created_at" // Default to latest arrivals
  }
}

/**
 * Fetch the newest product (sorted by created_at desc)
 */
export const getNewestProduct = async ({
  countryCode,
}: {
  countryCode: string
}): Promise<HttpTypes.StoreProduct | null> => {
  try {
    const {
      response: { products },
    } = await listProducts({
      pageParam: 1,
      queryParams: {
        limit: 1,
        order: "-created_at", // Descending order for newest first
      },
      countryCode,
    })

    if (products.length === 0) {
      return null
    }

    return products[0]
  } catch (error) {
    console.error("Error fetching newest product:", error)
    return null
  }
}

/**
 * Fetch the three newest products (sorted by created_at desc)
 */
export const getNewestProducts = async ({
  countryCode,
  limit = 3,
}: {
  countryCode: string
  limit?: number
}): Promise<HttpTypes.StoreProduct[]> => {
  try {
    const {
      response: { products },
    } = await listProducts({
      pageParam: 1,
      queryParams: {
        limit,
        order: "-created_at", // Descending order for newest first
      },
      countryCode,
    })

    return products
  } catch (error) {
    console.error("Error fetching newest products:", error)
    return []
  }
}

/**
 * Fetch the newest product under $100 (sorted by created_at desc)
 */
export const getNewestProductUnder100 = async ({
  countryCode,
}: {
  countryCode: string
}): Promise<HttpTypes.StoreProduct | null> => {
  try {
    const {
      response: { products },
    } = await listProducts({
      pageParam: 1,
      queryParams: {
        limit: 50, // Reduced from 100 to 50 for better performance
        order: "-created_at", // Descending order for newest first
      },
      countryCode,
    })

    if (products.length === 0) {
      return null
    }

    // Filter products under $100 (client-side filtering still needed for price)
    const productsUnder100 = products.find((product) => {
      // Check if product has variants with calculated prices
      const hasVariants = product.variants && product.variants.length > 0
      if (!hasVariants) return false

      // Check if any variant is under $100
      return product.variants?.some((variant) => {
        const price = variant.calculated_price?.calculated_amount
        return price && price < 150
      }) || false
    })

    return productsUnder100 || null
  } catch (error) {
    console.error("Error fetching newest product under $100:", error)
    return null
  }
}

/**
 * Fetch all products for sitemap generation
 * This function fetches all products without pagination to generate sitemap entries
 */
export const getAllProductsForSitemap = async ({
  countryCode,
}: {
  countryCode: string
}): Promise<HttpTypes.StoreProduct[]> => {
  try {
    // Fetch all products with a high limit to get all products
    const {
      response: { products },
    } = await listProducts({
      pageParam: 1,
      queryParams: {
        limit: 1000, // High limit to get all products
        fields: "handle,title,updated_at,created_at,status",
        status: "published", // Only published products
      },
      countryCode,
    })

    return products
  } catch (error) {
    console.error("Error fetching all products for sitemap:", error)
    return []
  }
}
