import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { getBrandsArray } from "@lib/util/brand-utils"
import { HttpTypes } from "@medusajs/types"
import Product from "../product-preview"

type RelatedProductsProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

export default async function RelatedProducts({
  product,
  countryCode,
}: RelatedProductsProps) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  // Brand-based related products with category fallback
  const brands = getBrandsArray((product as any).brands)

  // First, try to fetch products from the same brand(s)
  const brandQueryParams: HttpTypes.StoreProductParams = {}
  if (region?.id) {
    brandQueryParams.region_id = region.id
  }
  if (brands.length > 0) {
    brandQueryParams.brand_id = brands.map(b => b.id).filter(Boolean) as string[]
  }

  let products = await listProducts({
    queryParams: brandQueryParams,
    countryCode,
  }).then(({ response }) => {
    return response.products.filter(
      (responseProduct) => responseProduct.id !== product.id
    )
  })

  // If not enough brand matches, fall back to category-based products
  if (products.length < 4 && product.categories && product.categories.length > 0) {
    const categoryQueryParams: HttpTypes.StoreProductParams = {}
    if (region?.id) {
      categoryQueryParams.region_id = region.id
    }
    categoryQueryParams.category_id = product.categories
      .map((c) => c.id)
      .filter(Boolean) as string[]

    const categoryProducts = await listProducts({
      queryParams: categoryQueryParams,
      countryCode,
    }).then(({ response }) => {
      return response.products.filter(
        (responseProduct) =>
          responseProduct.id !== product.id &&
          !products.some(p => p.id === responseProduct.id) // Avoid duplicates
      )
    })

    // Combine brand matches with category matches to fill the carousel
    products = [...products, ...categoryProducts]
  }

  if (!products.length) {
    return null
  }

  return (
    <div className="product-page-constraint">
      <div className="flex flex-col text-left mb-16">
        <p className="text-lg-regular text-ui-fg-base max-w-lg uppercase">
          You may also like
        </p>
      </div>

      <ul className="product-grid-fixed-cols">
        {products.map((product) => (
          <li key={product.id}>
            <Product region={region} product={product} />
          </li>
        ))}
      </ul>
    </div>
  )
}
