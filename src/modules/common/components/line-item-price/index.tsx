import { getPercentageDiff } from "@lib/util/get-precentage-diff"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import { getVariantPrice, isAlgoliaProduct } from "@lib/util/get-algolia-product-price"
import { getProductPrice } from "@lib/util/get-product-price"

type LineItemPriceProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  style?: "default" | "tight"
  currencyCode: string
  forceVertical?: boolean
}

const LineItemPrice = ({
  item,
  style = "default",
  currencyCode,
  forceVertical = false,
}: LineItemPriceProps) => {
  const { subtotal, original_subtotal } = item
  const originalPrice = original_subtotal ?? 0
  const currentPrice = subtotal ?? 0
  const hasCartDiscount = currentPrice < originalPrice && currentPrice > 0

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

  const isOnSale = variantPrice?.price_type === "sale" && "original_price" in variantPrice
  const unitSalePrice = isOnSale ? variantPrice.calculated_price : null
  const unitOriginalPrice = isOnSale ? (variantPrice as any).original_price : null

  return (
    <div className="flex flex-col gap-x-2 text-ui-fg-subtle items-end">
      <div className="text-left">
        {isOnSale && unitSalePrice && unitOriginalPrice ? (
          <>
            {/* Desktop/multi-column: horizontal layout, Mobile/cart-dropdown: vertical */}
            <div className={clx("items-center gap-1.5", {
              "hidden md:flex": !forceVertical,
              "flex flex-col items-start gap-0.5": forceVertical,
            })}>
              <span
                className="font-medium"
                data-testid="product-price"
              >
                {unitSalePrice?.replace(/\s*USD$/, '')}
              </span>
              <span
                className="line-through text-gray-500"
                data-testid="product-original-price"
              >
                {unitOriginalPrice?.replace(/\s*USD$/, '')}
              </span>
            </div>

            {/* Mobile: vertical layout (when not forced vertical) */}
            {!forceVertical && (
              <div className="md:hidden flex flex-col items-start gap-0.5">
                <span
                  className="font-medium"
                  data-testid="product-price-mobile"
                >
                  {unitSalePrice?.replace(/\s*USD$/, '')}
                </span>
                <span
                  className="line-through text-gray-500"
                  data-testid="product-original-price-mobile"
                >
                  {unitOriginalPrice?.replace(/\s*USD$/, '')}
                </span>
              </div>
            )}
          </>
        ) : (
          <span
            data-testid="product-price"
          >
            {convertToLocale({
              amount: currentPrice,
              currency_code: currencyCode,
            })?.replace(/\s*USD$/, '')}
          </span>
        )}
      </div>
    </div>
  )
}

export default LineItemPrice
