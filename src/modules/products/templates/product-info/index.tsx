import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getBrandsArray } from "@lib/util/brand-utils"
import React from "react"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  const brands = getBrandsArray((product as any).brand || (product as any).brands)

  return (
    <div id="product-info" className="relative flex lg:items-center lg:min-h-[80vh]">
      <div className="flex flex-col gap-y-4">
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
                  <span className="text-medium text-ui-fg-muted">×</span>
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

        <Text
          className="text-medium text-ui-fg-base whitespace-pre-line"
          data-testid="product-description" 
        >
          {product.description}
        </Text>
        {(product as any)?.product_sku?.sku && (
          <Text
            className="text-medium text-ui-fg-subtle mt-3"
            data-testid="product-sku"
          >
            {`${(product as any).product_sku.sku}`}
          </Text>
        )}
      </div>
    </div>
  )
}

export default ProductInfo
