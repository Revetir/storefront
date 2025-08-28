import { sdk } from "@lib/config"

export type ProductType = {
  id: string
  value: string
}

export const listProductTypes = async (): Promise<ProductType[]> => {
  // Medusa v2 Store API: /store/product-types
  const { product_types } = await sdk.client.fetch<{ product_types: ProductType[] }>(
    "/store/product-types",
    { method: "GET" }
  )
  
  // Sort product types alphabetically by brand name (value)
  return product_types.sort((a, b) => a.value.localeCompare(b.value))
} 