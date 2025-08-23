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
  return product_types
} 