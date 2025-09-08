"use server"

import { sdk } from "@lib/config"
import { getCacheOptions } from "./cookies"

export interface Brand {
  id: string
  name: string
  slug: string
  blurb?: string
}

export const listBrands = async (): Promise<Brand[]> => {
  const next = await getCacheOptions("brands")

  const { brands } = await sdk.client.fetch<{
    brands: Brand[]
  }>("/store/brands", {
    query: {
      limit: 1000, // Get all brands
    },
    next,
    cache: "force-cache",
  })

  return brands || []
}

export const getBrandBySlug = async (slug: string): Promise<Brand | null> => {
  try {
    // Temporarily bypass cache options to test if that's causing the issue
    const { brand } = await sdk.client.fetch<{
      brand: Brand
    }>(`/store/brands/${slug}`, {
      cache: "force-cache",
    })

    return brand || null
  } catch (error) {
    console.error("Error fetching brand by slug:", error)
    return null
  }
}

export const getBrandProducts = async ({
  brandSlug,
  categorySlug,
  limit = 12,
  offset = 0,
  sort = "created_at",
  countryCode,
}: {
  brandSlug: string
  categorySlug?: string
  limit?: number
  offset?: number
  sort?: string
  countryCode: string
}): Promise<{
  products: any[]
  count: number
  limit: number
  offset: number
}> => {
  const next = await getCacheOptions("brand-products")

  const queryParams: any = {
    limit,
    offset,
    sort,
  }

  if (categorySlug) {
    queryParams.category_slug = categorySlug
  }

  const { products, count } = await sdk.client.fetch<{
    products: any[]
    count: number
    limit: number
    offset: number
  }>(`/store/brands/${brandSlug}/products`, {
    query: queryParams,
    next,
    cache: "force-cache",
  })

  return {
    products: products || [],
    count: count || 0,
    limit,
    offset,
  }
}
