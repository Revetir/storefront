import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductInfoMobileProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfoMobile = ({ product }: ProductInfoMobileProps) => {
  return (
    <div className="flex flex-col gap-y-2">
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
    </div>
  )
}

export default ProductInfoMobile
