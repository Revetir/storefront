import { Metadata } from "next"

import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"
import { listProductsWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { listProductTypes } from "@lib/data/product-types"

export const metadata: Metadata = {
  title: "Store",
  description: "Explore all of our products.",
}

type Params = {
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
    brand?: string
    maxPrice?: string
  }>
  params: Promise<{
    countryCode: string
  }>
}

export default async function StorePage(props: Params) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { sortBy, page, brand, maxPrice } = searchParams

  // Fetch product data on the server
  const pageNumber = page ? parseInt(page, 10) : 1
  const sort = sortBy || "created_at"

  const queryParams: any = {}

  // Convert brand value to type ID if brand filter is provided
  if (brand) {
    const productTypes = await listProductTypes()
    const typeObj = productTypes.find(t => t.value === brand)
    if (typeObj) {
      queryParams.type_id = [typeObj.id]
    }
  }

  const region = await getRegion(params.countryCode)

  if (!region) {
    return null
  }

  // Use server-side pagination
  const {
    response: { products, count },
    totalPages,
    currentPage,
  } = await listProductsWithSort({
    page: pageNumber,
    queryParams,
    sortBy: sort,
    countryCode: params.countryCode,
  })

  // Apply price filtering if maxPrice is provided
  let filteredProducts = products
  let filteredCount = count
  if (maxPrice) {
    const maxPriceNumber = parseInt(maxPrice)
    filteredProducts = products.filter((product) => {
      return product.variants?.some((variant) => {
        const price = variant.calculated_price?.calculated_amount
        return price && price < maxPriceNumber
      })
    })
    filteredCount = filteredProducts.length
  }

  return (
    <StoreTemplate
      sortBy={sortBy}
      page={page}
      countryCode={params.countryCode}
      type={brand}
      maxPrice={maxPrice}
      products={filteredProducts}
      region={region}
      totalPages={totalPages}
      currentPage={currentPage}
    />
  )
}
