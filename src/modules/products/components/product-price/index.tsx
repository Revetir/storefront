import { clx } from "@medusajs/ui"

import { getProductPrice } from "@lib/util/get-product-price"
import { getAlgoliaProductPrice, getVariantPrice, isAlgoliaProduct } from "@lib/util/get-algolia-product-price"
import { HttpTypes } from "@medusajs/types"

export default function ProductPrice({
  product,
  variant,
  countryCode = 'us',
}: {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
  countryCode?: string
}) {
  let selectedPrice
  
  if (isAlgoliaProduct(product)) {
    // For Algolia products, use region-specific pricing
    if (variant) {
      selectedPrice = getVariantPrice(variant, countryCode)
    } else {
      selectedPrice = getAlgoliaProductPrice(product, countryCode)
    }
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
      {selectedPrice.price_type === "sale" && "original_price" in selectedPrice ? (
        <>
          {/* Desktop: horizontal layout */}
          <div className="hidden lg:flex items-center gap-2">
            <span
              className="font-medium"
              data-testid="product-price"
              data-value={selectedPrice.calculated_price_number}
            >
              {!variant && "From "}
              {selectedPrice.calculated_price?.replace(/\s*USD$/, '')}
            </span>
            <span
              className="line-through text-gray-400"
              data-testid="original-product-price"
              data-value={(selectedPrice as any).original_price_number}
            >
              {(selectedPrice as any).original_price?.replace(/\s*USD$/, '')}
            </span>
            <span className="text-gray-400">
              {(selectedPrice as any).percentage_diff}% OFF
            </span>
          </div>

          {/* Mobile: stacked layout */}
          <div className="lg:hidden flex flex-col gap-0.5">
            <span
              className="font-medium"
              data-testid="product-price"
              data-value={selectedPrice.calculated_price_number}
            >
              {!variant && "From "}
              {selectedPrice.calculated_price?.replace(/\s*USD$/, '')}
            </span>
            <div className="flex items-center gap-1.5">
              <span
                className="line-through text-gray-400"
                data-testid="original-product-price"
                data-value={(selectedPrice as any).original_price_number}
              >
                {(selectedPrice as any).original_price?.replace(/\s*USD$/, '')}
              </span>
              <span className="text-gray-400">
                {(selectedPrice as any).percentage_diff}% OFF
              </span>
            </div>
          </div>
        </>
      ) : (
        <span
          data-testid="product-price"
          data-value={selectedPrice.calculated_price_number}
        >
          {!variant && "From "}
          {selectedPrice.calculated_price?.replace(/\s*USD$/, '')}
        </span>
      )}
    </div>
  )
}
