import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { resolveLineItemPricing } from "@lib/util/resolve-line-item-pricing"

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
  const pricing = resolveLineItemPricing(item)
  const isOnSale = pricing.hasDiscount

  return (
    <div className="flex flex-col text-ui-fg-muted justify-center h-full">
      {isOnSale && pricing.originalUnit !== null ? (
        <>
          {/* Desktop: horizontal layout */}
          <div className="hidden md:flex items-center gap-1.5">
            <span
              className="font-medium"
              data-testid="product-unit-price"
            >
              {convertToLocale({
                amount: pricing.calculatedUnit,
                currency_code: currencyCode,
              })?.replace(/\s*USD$/, "")}
            </span>
            <span
              className="line-through text-gray-500"
              data-testid="product-unit-original-price"
            >
              {convertToLocale({
                amount: pricing.originalUnit,
                currency_code: currencyCode,
              })?.replace(/\s*USD$/, "")}
            </span>
          </div>

          {/* Mobile: vertical layout */}
          <div className="md:hidden flex flex-col items-start gap-0.5">
            <span
              className="font-medium"
              data-testid="product-unit-price-mobile"
            >
              {convertToLocale({
                amount: pricing.calculatedUnit,
                currency_code: currencyCode,
              })?.replace(/\s*USD$/, "")}
            </span>
            <span
              className="line-through text-gray-500"
              data-testid="product-unit-original-price-mobile"
            >
              {convertToLocale({
                amount: pricing.originalUnit,
                currency_code: currencyCode,
              })?.replace(/\s*USD$/, "")}
            </span>
          </div>
        </>
      ) : (
        <span
          data-testid="product-unit-price"
        >
          {convertToLocale({
            amount: pricing.calculatedUnit,
            currency_code: currencyCode,
          })?.replace(/\s*USD$/, '')}
        </span>
      )}
    </div>
  )
}

export default LineItemUnitPrice
