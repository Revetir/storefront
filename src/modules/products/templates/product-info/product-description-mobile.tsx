import { HttpTypes } from "@medusajs/types"
import { Text, Heading } from "@medusajs/ui"

type ProductDescriptionMobileProps = {
  product: HttpTypes.StoreProduct
}

const ProductDescriptionMobile = ({ product }: ProductDescriptionMobileProps) => {
  return (
    <div className="px-4 mb-12">
      <Heading className="text-base font-medium uppercase tracking-wide mb-4">
        Item Info
      </Heading>
      <Text
        className="text-medium text-ui-fg-base whitespace-pre-line"
        data-testid="product-description" 
      >
        {product.description}
      </Text>
    </div>
  )
}

export default ProductDescriptionMobile
