import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  return (
    <div id="product-info" className="relative flex lg:items-center lg:min-h-[80vh]">
      <div className="flex flex-col gap-y-4">
        {(product as any).brand?.name && (product as any)?.brand?.slug && (
          <LocalizedClientLink
            href={`/men/brands/${(product as any).brand.slug}`}
            className="text-medium text-ui-fg-base hover:text-ui-fg-subtle hover:underline"
          >
            {(product as any).brand.name.toUpperCase()}
          </LocalizedClientLink>
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
