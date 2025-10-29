"use client"

import { convertToLocale } from "@lib/util/money"
import React, { useState } from "react"
import Tooltip from "../tooltip"

type CartTotalsProps = {
  totals: {
    total?: number | null
    subtotal?: number | null
    tax_total?: number | null
    shipping_total?: number | null
    discount_total?: number | null
    gift_card_total?: number | null
    currency_code: string
    shipping_subtotal?: number | null
    shipping_address?: {
      address_1?: string | null
    } | null
  }
}

const CartTotals: React.FC<CartTotalsProps> = ({ totals }) => {
  const [deliveryTooltipVisible, setDeliveryTooltipVisible] = useState(false)
  const [returnsTooltipVisible, setReturnsTooltipVisible] = useState(false)
  const {
    currency_code,
    total,
    subtotal,
    tax_total,
    discount_total,
    gift_card_total,
    shipping_subtotal,
    shipping_address,
  } = totals

  // Check if we have an address for tax calculation
  const hasAddress = !!shipping_address?.address_1

  return (
    <div>
      <div className="flex flex-col gap-y-2 txt-medium text-ui-fg-subtle ">
        <div className="flex items-center justify-between">
          <span className="flex gap-x-1 items-center uppercase">
            Subtotal
          </span>
          <span data-testid="cart-subtotal" data-value={subtotal || 0}>
            {convertToLocale({ amount: subtotal ?? 0, currency_code })}
          </span>
        </div>
        {!!discount_total && (
          <div className="flex items-center justify-between">
            <span>Discount</span>
            <span
              className="text-ui-fg-interactive"
              data-testid="cart-discount"
              data-value={discount_total || 0}
            >
              -{" "}
              {convertToLocale({ amount: discount_total ?? 0, currency_code })}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between uppercase">
          <Tooltip
            content="Standard shipping is complimentary on this order, with all duties and additional import fees prepaid"
            onVisibilityChange={setDeliveryTooltipVisible}
          >
            <span>Delivery</span>
          </Tooltip>
          <span
            data-testid="cart-shipping"
            data-value={shipping_subtotal || 0}
            className={deliveryTooltipVisible ? 'hidden' : ''}
          >
            {shipping_subtotal === 0 ? (
              <span className="font-bold">FREE</span>
            ) : (
              convertToLocale({ amount: shipping_subtotal ?? 0, currency_code })
            )}
          </span>
        </div>
        <div className="flex items-center justify-between uppercase">
          <Tooltip
            content="Returns are complimentary within 7 days of delivery, with a prepaid return label included in every order"
            onVisibilityChange={setReturnsTooltipVisible}
          >
            <span>Returns</span>
          </Tooltip>
          <span
            className={returnsTooltipVisible ? 'hidden' : 'font-bold'}
          >
            FREE
          </span>
        </div>
        <div className="flex justify-between">
          <span className="flex gap-x-1 items-center uppercase">Taxes</span>
          <span data-testid="cart-taxes" data-value={tax_total || 0}>
            {hasAddress ? (
              convertToLocale({ amount: tax_total ?? 0, currency_code })
            ) : (
              <span className="italic">Calculated at checkout</span>
            )}
          </span>
        </div>
        {!!gift_card_total && (
          <div className="flex items-center justify-between">
            <span>Gift card</span>
            <span
              className="text-ui-fg-interactive"
              data-testid="cart-gift-card-amount"
              data-value={gift_card_total || 0}
            >
              -{" "}
              {convertToLocale({ amount: gift_card_total ?? 0, currency_code })}
            </span>
          </div>
        )}
      </div>
      <div className="h-px w-full border-b border-gray-200 my-4" />
      <div className="flex items-center justify-between text-ui-fg-base mb-2 txt-medium uppercase">
        <span>Estimated Order Total</span>
        <span
          className="txt-xlarge-plus"
          data-testid="cart-total"
          data-value={total || 0}
        >
          {convertToLocale({ amount: total ?? 0, currency_code })}
        </span>
      </div>
      <div className="h-px w-full border-b border-gray-200 mt-4" />
    </div>
  )
}

export default CartTotals
