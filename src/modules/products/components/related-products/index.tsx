import { getRegion } from "@lib/data/regions"
import { getBrandsArray } from "@lib/util/brand-utils"
import { searchProductsWithAlgolia, convertAlgoliaProductsToMedusaFormat } from "@lib/util/algolia-filters"
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

  // Brand-based related products with category fallback using Algolia
  const brands = getBrandsArray((product as any).brands)
  let products: any[] = []

  // First, try to fetch products from the same brand(s)
  if (brands.length > 0) {
    // For multiple brands (collaborations), fetch from first brand
    const primaryBrand = brands[0]

    const algoliaResult = await searchProductsWithAlgolia({
      brandSlug: primaryBrand.slug,
      hitsPerPage: 12,
    })

    products = convertAlgoliaProductsToMedusaFormat(algoliaResult.hits).filter(
      (p: any) => p.id !== product.id
    )
  }

  // If not enough brand matches, fall back to category-based products
  if (products.length < 4 && product.categories && product.categories.length > 0) {
    // Get the first category handle
    const primaryCategory = product.categories[0]

    if (primaryCategory.handle) {
      const categoryResult = await searchProductsWithAlgolia({
        categoryHandle: primaryCategory.handle,
        hitsPerPage: 12,
      })

      const categoryProducts = convertAlgoliaProductsToMedusaFormat(categoryResult.hits).filter(
        (p: any) => p.id !== product.id && !products.some((existing: any) => existing.id === p.id)
      )

      // Combine brand matches with category matches to fill the carousel
      products = [...products, ...categoryProducts]
    }
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
