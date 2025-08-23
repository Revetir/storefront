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

  const next = {
    ...(await getCacheOptions("products")),
  }

  const finalQuery = {
    limit,
    offset,
    region_id: region.id,
    fields: "*variants.calculated_price,+variants.inventory_quantity,+metadata,+tags,*categories",
    ...queryParams,
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
        cache: "force-cache",
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
 * This will fetch products with filtering applied and sort them based on the sortBy parameter.
 * It will then return the paginated products based on the page and limit parameters.
 */
export const listProductsWithSort = async ({
  page = 0,
  queryParams,
  sortBy = "created_at",
  countryCode,
}: {
  page?: number
  queryParams?: ProductQueryParams
  sortBy?: SortOptions
  countryCode: string
}): Promise<{ response: { products: HttpTypes.StoreProduct[]; count: number }; nextPage: number | null; queryParams?: ProductQueryParams }> => {
  const limit = queryParams?.limit || 12

  // If we have filtering parameters (like type_id), fetch with a reasonable limit and apply filters
  // Otherwise, fetch more products for client-side sorting
  const fetchLimit = queryParams?.type_id || queryParams?.category_id || queryParams?.collection_id ? limit * 10 : 1000

  const {
    response: { products, count },
  } = await listProducts({
    pageParam: 0,
    queryParams: {
      ...queryParams,
      limit: fetchLimit,
    },
    countryCode,
  })

  const sortedProducts = sortProducts(products, sortBy)

  const pageParam = (page - 1) * limit
  const nextPage = count > pageParam + limit ? pageParam + limit : null

  const paginatedProducts = sortedProducts.slice(pageParam, pageParam + limit)

  return {
    response: {
      products: paginatedProducts,
      count,
    },
    nextPage,
    queryParams,
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
        limit: 100, // Fetch more products to ensure we get the newest one
      },
      countryCode,
    })

    if (products.length === 0) {
      return null
    }

    // Sort by created_at desc to get the newest product
    const sortedProducts = products.sort((a, b) => {
      const dateA = new Date(a.created_at || 0)
      const dateB = new Date(b.created_at || 0)
      return dateB.getTime() - dateA.getTime()
    })

    return sortedProducts[0]
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
        limit: 100, // Fetch more products to ensure we get the newest ones
      },
      countryCode,
    })

    if (products.length === 0) {
      return []
    }

    // Sort by created_at desc to get the newest products
    const sortedProducts = products.sort((a, b) => {
      const dateA = new Date(a.created_at || 0)
      const dateB = new Date(b.created_at || 0)
      return dateB.getTime() - dateA.getTime()
    })

    return sortedProducts.slice(0, limit)
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
        limit: 100, // Fetch more products to ensure we get the newest one under $100
      },
      countryCode,
    })

    if (products.length === 0) {
      return null
    }

    // Filter products under $100 and sort by created_at desc
    const productsUnder100 = products
      .filter((product) => {
        // Check if product has variants with calculated prices
        const hasVariants = product.variants && product.variants.length > 0
        if (!hasVariants) return false

        // Check if any variant is under $100
        return product.variants?.some((variant) => {
          const price = variant.calculated_price?.calculated_amount
          return price && price < 150
        }) || false
      })
      .sort((a, b) => {
        const dateA = new Date(a.created_at || 0)
        const dateB = new Date(b.created_at || 0)
        return dateB.getTime() - dateA.getTime()
      })

    return productsUnder100[0] || null
  } catch (error) {
    console.error("Error fetching newest product under $100:", error)
    return null
  }
}
