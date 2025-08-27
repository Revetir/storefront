"use client"

import { HttpTypes } from "@medusajs/types"
import ProductPreview from "../product-preview"

interface RelatedProductsClientProps {
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
}

export default function RelatedProductsClient({ products, region }: RelatedProductsClientProps) {
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

      <ul className="grid grid-cols-2 w-full gap-x-4 gap-y-6 
                     md:grid-cols-2 md:gap-x-4 md:gap-y-6
                     small:grid-cols-3 small:gap-x-6 small:gap-y-8
                     large:grid-cols-4 large:gap-x-8 large:gap-y-10">
        {products.map((product) => (
          <li key={product.id} className="h-full w-full">
            <ProductPreview product={product} region={region} />
          </li>
        ))}
      </ul>
    </div>
  )
}
