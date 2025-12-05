import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type OrderSummaryProps = {
  order: HttpTypes.StoreOrder
}

const OrderSummary = ({ order }: OrderSummaryProps) => {
  const getAmount = (amount?: number | null) => {
    if (amount == null) {
      return ""
    }

    return convertToLocale({
      amount,
      currency_code: order.currency_code,
    })
  }

  return (
    <div className="rounded-lg bg-[#f5f5f5] px-4 py-4 sm:px-6 sm:py-5">
      <div className="mb-3">
        <h2 className="text-xs sm:text-sm tracking-[0.15em] uppercase text-gray-900">
          ORDER SUMMARY
        </h2>
      </div>
      <div className="w-full h-px border-t border-gray-300" />

      <div className="pt-3 pb-1 space-y-2 text-xs sm:text-sm text-gray-900">
        <div className="flex items-center justify-between">
          <span>Subtotal</span>
          <span>{getAmount(order.item_total ?? order.subtotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Delivery</span>
          <span>{getAmount(order.shipping_total)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Taxes</span>
          <span>{getAmount(order.tax_total)}</span>
        </div>
      </div>

      <div className="pt-2 mt-1">
        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-900">
          <span className="uppercase tracking-[0.15em]">Order Total</span>
          <span>{getAmount(order.total)}</span>
        </div>
      </div>
    </div>
  )
}

export default OrderSummary
