import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import { getVariantPrice, isAlgoliaProduct } from "@lib/util/get-algolia-product-price"
import { getProductPrice } from "@lib/util/get-product-price"

type LineItemUnitPriceProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  style?: "default" | "tight"
  currencyCode: string
}

const LineItemUnitPrice = ({
  item,
  style = "default",
  currencyCode,
}: LineItemUnitPriceProps) => {
  const subtotal =
    item.subtotal ?? item.total ?? item.unit_price * item.quantity

  // Check if this item has product-level sale pricing
  let variantPrice = null
  if (item.variant) {
    const product = (item as any).product
    if (product && isAlgoliaProduct(product)) {
      variantPrice = getVariantPrice(item.variant as any, currencyCode.toLowerCase())
    } else if (product) {
      const priceData = getProductPrice({
        product: product as any,
        variantId: item.variant.id,
      })
      variantPrice = priceData.variantPrice
    }
  }

  const salePrice =
    variantPrice &&
    variantPrice.price_type === "sale" &&
    "original_price" in variantPrice
      ? variantPrice
      : null
  const unitSalePrice = salePrice?.calculated_price ?? null
  const unitOriginalPrice = salePrice ? (salePrice as any).original_price : null
  const isOnSale = salePrice != null

  return (
    <div className="flex flex-col text-ui-fg-muted justify-center h-full">
      {isOnSale && unitSalePrice && unitOriginalPrice ? (
        <>
          {/* Desktop: horizontal layout */}
          <div className="hidden md:flex items-center gap-1.5">
            <span
              className="font-medium"
              data-testid="product-unit-price"
            >
              {unitSalePrice?.replace(/\s*USD$/, '')}
            </span>
            <span
              className="line-through text-gray-500"
              data-testid="product-unit-original-price"
            >
              {unitOriginalPrice?.replace(/\s*USD$/, '')}
            </span>
          </div>

          {/* Mobile: vertical layout */}
          <div className="md:hidden flex flex-col items-start gap-0.5">
            <span
              className="font-medium"
              data-testid="product-unit-price-mobile"
            >
              {unitSalePrice?.replace(/\s*USD$/, '')}
            </span>
            <span
              className="line-through text-gray-500"
              data-testid="product-unit-original-price-mobile"
            >
              {unitOriginalPrice?.replace(/\s*USD$/, '')}
            </span>
          </div>
        </>
      ) : (
        <span
          data-testid="product-unit-price"
        >
          {convertToLocale({
            amount: subtotal / item.quantity,
            currency_code: currencyCode,
          })?.replace(/\s*USD$/, '')}
        </span>
      )}
    </div>
  )
}

export default LineItemUnitPrice
