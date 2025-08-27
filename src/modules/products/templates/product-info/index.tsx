import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  return (
    <div id="product-info" className="relative flex small:items-center small:min-h-[80vh] px-8">
      <div className="flex flex-col gap-y-4 lg:max-w-[500px]">
        {product.type?.value && (
        <LocalizedClientLink
          href={`/store?brand=${product.type.value.toLowerCase()}`}
          className="text-medium text-ui-fg-base hover:text-ui-fg-subtle hover:underline"
        >
          {product.type.value}
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
      </div>
    </div>
  )
}

export default ProductInfo
