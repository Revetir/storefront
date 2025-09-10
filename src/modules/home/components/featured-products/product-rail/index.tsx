import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"

import InteractiveLink from "@modules/common/components/interactive-link"
import ProductPreview from "@modules/products/components/product-preview"

export default async function ProductRail({
  collection,
  region,
}: {
  collection: HttpTypes.StoreCollection
  region: HttpTypes.StoreRegion
}) {
  const {
    response: { products: pricedProducts },
  } = await listProducts({
    regionId: region.id,
    queryParams: {
      collection_id: collection.id,
      // Include brand and type for canonical link and display
      fields: "handle,title,thumbnail,*brand.*,*type.*,*variants.calculated_price",
      expand: "brand,type",
    },
  })

  if (!pricedProducts) {
    return null
  }

  return (
    <div className="content-container py-12 small:py-24">
      <ul className="grid grid-cols-2 small:grid-cols-3 gap-x-6 gap-y-24 small:gap-y-36">
        {pricedProducts &&
          pricedProducts.map((product, index) => (
            <li key={product.id}>
              <ProductPreview 
                product={product} 
                region={region} 
                isFeatured 
                priority={index < 6} // Priority loading for first 6 featured products
              />
            </li>
          ))}
      </ul>
    </div>
  )
}
