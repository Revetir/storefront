import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import { resolveLineItemPricing } from "@lib/util/resolve-line-item-pricing"

type LineItemPriceProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  style?: "default" | "tight"
  currencyCode: string
  forceVertical?: boolean
  showTotal?: boolean // true = show total price (unit x qty), false = show unit price
  showOriginal?: boolean
}

const LineItemPrice = ({
  item,
  currencyCode,
  forceVertical = false,
  showTotal = false,
  showOriginal = true,
}: LineItemPriceProps) => {
  const pricing = resolveLineItemPricing(item)
  const displayPrice = showTotal ? pricing.calculatedTotal : pricing.calculatedUnit
  const displayOriginalPrice = pricing.hasDiscount
    ? showTotal
      ? pricing.originalTotal
      : pricing.originalUnit
    : null
  const hasProductSale =
    showOriginal &&
    displayOriginalPrice !== null &&
    displayOriginalPrice > displayPrice

  return (
    <div className="flex flex-col gap-x-2 text-ui-fg-subtle items-end">
      <div className="text-left">
        {hasProductSale ? (
          <>
            {/* Desktop/multi-column: horizontal layout, Mobile/cart-dropdown: vertical */}
            <div
              className={clx("items-center gap-1.5", {
                "hidden md:flex": !forceVertical,
                "flex flex-col items-start gap-0.5": forceVertical,
              })}
            >
              <span className="font-medium" data-testid="product-price">
                {convertToLocale({
                  amount: displayPrice,
                  currency_code: currencyCode,
                })?.replace(/\s*USD$/, "")}
              </span>
              <span className="line-through text-gray-500" data-testid="product-original-price">
                {convertToLocale({
                  amount: displayOriginalPrice!,
                  currency_code: currencyCode,
                })?.replace(/\s*USD$/, "")}
              </span>
            </div>

            {/* Mobile: vertical layout (when not forced vertical) */}
            {!forceVertical && (
              <div className="md:hidden flex flex-col items-start gap-0.5">
                <span className="font-medium" data-testid="product-price-mobile">
                  {convertToLocale({
                    amount: displayPrice,
                    currency_code: currencyCode,
                  })?.replace(/\s*USD$/, "")}
                </span>
                <span className="line-through text-gray-500" data-testid="product-original-price-mobile">
                  {convertToLocale({
                    amount: displayOriginalPrice!,
                    currency_code: currencyCode,
                  })?.replace(/\s*USD$/, "")}
                </span>
              </div>
            )}
          </>
        ) : (
          <span data-testid="product-price">
            {convertToLocale({
              amount: displayPrice,
              currency_code: currencyCode,
            })?.replace(/\s*USD$/, "")}
          </span>
        )}
      </div>
    </div>
  )
}

export default LineItemPrice
