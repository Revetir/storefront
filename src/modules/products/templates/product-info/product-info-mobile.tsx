import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getBrandsArray } from "@lib/util/brand-utils"
import React from "react"

type ProductInfoMobileProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfoMobile = ({ product }: ProductInfoMobileProps) => {
  const brands = getBrandsArray((product as any).brands)

  return (
    <div className="flex flex-col gap-y-2">
      {brands.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {brands.map((brand, index) => (
            <React.Fragment key={brand.slug}>
              <LocalizedClientLink
                href={`/men/brands/${brand.slug}`}
                className="text-medium text-ui-fg-base hover:text-ui-fg-subtle hover:underline"
              >
                {brand.name.toUpperCase()}
              </LocalizedClientLink>
              {index < brands.length - 1 && (
                <span className="text-medium text-ui-fg-muted lowercase">x</span>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
      <Heading
        className="text-large-regular leading-tight text-ui-fg-base"
        data-testid="product-title"
      >
        {product.title}
      </Heading>
    </div>
  )
}

export default ProductInfoMobile
