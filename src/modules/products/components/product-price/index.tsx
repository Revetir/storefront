import { clx } from "@medusajs/ui"

import { getProductPrice } from "@lib/util/get-product-price"
import { getAlgoliaProductPrice, isAlgoliaProduct } from "@lib/util/get-algolia-product-price"
import { HttpTypes } from "@medusajs/types"

export default function ProductPrice({
  product,
  variant,
}: {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
}) {
  let selectedPrice
  
  if (isAlgoliaProduct(product)) {
    // For Algolia products, use minPrice (variants not supported yet)
    selectedPrice = getAlgoliaProductPrice(product)
  } else {
    const { cheapestPrice, variantPrice } = getProductPrice({
      product,
      variantId: variant?.id,
    })
    selectedPrice = variant ? variantPrice : cheapestPrice
  }

  if (!selectedPrice) {
    return <div className="block w-32 h-9 bg-gray-100 animate-pulse" />
  }

  return (
    <div className="flex flex-col text-ui-fg-base">
      <span
        className={clx("text-base-semi", {
          "text-ui-fg-interactive": selectedPrice.price_type === "sale",
        })}
      >
        {!variant && "From "}
        <span
          data-testid="product-price"
          data-value={selectedPrice.calculated_price_number}
        >
          {selectedPrice.calculated_price}
        </span>
      </span>
      {selectedPrice.price_type === "sale" && "original_price" in selectedPrice && (
        <>
          <p>
            <span className="text-ui-fg-subtle">Original: </span>
            <span
              className="line-through"
              data-testid="original-product-price"
              data-value={(selectedPrice as any).original_price_number}
            >
              {(selectedPrice as any).original_price}
            </span>
          </p>
          <span className="text-ui-fg-interactive">
            -{(selectedPrice as any).percentage_diff}%
          </span>
        </>
      )}
    </div>
  )
}
