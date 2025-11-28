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
  showTotal?: boolean // true = show total price (unit × qty), false = show unit price
}

const LineItemPrice = ({
  item,
  currencyCode,
  forceVertical = false,
  showTotal = false,
}: LineItemPriceProps) => {
  const { subtotal, quantity } = item

  // Try to get product-level sale pricing from variant data
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

  // Check if this is a product-level sale (NOT cart-level discounts)
  const isProductOnSale = variantPrice?.price_type === "sale" && "original_price" in variantPrice

  // Determine which prices to display
  let displayPrice: number
  let displayOriginalPrice: number | null = null

  if (isProductOnSale && variantPrice) {
    // Product has a sale price - use pricing from variant
    const unitSalePrice = parseFloat(variantPrice.calculated_price?.replace(/[^0-9.]/g, '') || '0')
    const unitOriginalPrice = parseFloat((variantPrice as any).original_price?.replace(/[^0-9.]/g, '') || '0')

    displayPrice = showTotal ? unitSalePrice * quantity : unitSalePrice
    displayOriginalPrice = showTotal ? unitOriginalPrice * quantity : unitOriginalPrice
  } else {
    // No product-level sale - just show current price
    // Cart-level discounts will be shown in SUMMARY section, not here
    const currentTotalPrice = subtotal ?? 0
    displayPrice = showTotal ? currentTotalPrice : currentTotalPrice / quantity
    displayOriginalPrice = null
  }

  const hasProductSale = displayOriginalPrice !== null && displayOriginalPrice > displayPrice

  return (
    <div className="flex flex-col gap-x-2 text-ui-fg-subtle items-end">
      <div className="text-left">
        {hasProductSale ? (
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
                {convertToLocale({
                  amount: displayPrice,
                  currency_code: currencyCode,
                })?.replace(/\s*USD$/, '')}
              </span>
              <span
                className="line-through text-gray-500"
                data-testid="product-original-price"
              >
                {convertToLocale({
                  amount: displayOriginalPrice!,
                  currency_code: currencyCode,
                })?.replace(/\s*USD$/, '')}
              </span>
            </div>

            {/* Mobile: vertical layout (when not forced vertical) */}
            {!forceVertical && (
              <div className="md:hidden flex flex-col items-start gap-0.5">
                <span
                  className="font-medium"
                  data-testid="product-price-mobile"
                >
                  {convertToLocale({
                    amount: displayPrice,
                    currency_code: currencyCode,
                  })?.replace(/\s*USD$/, '')}
                </span>
                <span
                  className="line-through text-gray-500"
                  data-testid="product-original-price-mobile"
                >
                  {convertToLocale({
                    amount: displayOriginalPrice!,
                    currency_code: currencyCode,
                  })?.replace(/\s*USD$/, '')}
                </span>
              </div>
            )}
          </>
        ) : (
          <span
            data-testid="product-price"
          >
            {convertToLocale({
              amount: displayPrice,
              currency_code: currencyCode,
            })?.replace(/\s*USD$/, '')}
          </span>
        )}
      </div>
    </div>
  )
}

export default LineItemPrice
