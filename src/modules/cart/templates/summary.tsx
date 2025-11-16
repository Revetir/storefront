"use client"

import { Button, Heading } from "@medusajs/ui"

import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import DiscountCode from "@modules/checkout/components/discount-code"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import AcceptedPaymentMethods from "@modules/common/components/accepted-payment-methods"
import { HttpTypes } from "@medusajs/types"
import { trackCheckoutInitiated } from "@lib/util/analytics"

type SummaryProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StorePromotion[]
  }
}

const Summary = ({ cart }: SummaryProps) => {

  const handleCheckoutClick = () => {
    // Track checkout initiation with item details
    trackCheckoutInitiated({
      cart_value: cart.total,
      item_count: cart.items?.length || 0,
      items: cart.items?.map(item => {
        const product = item.product as any
        return {
          product_id: item.product_id,
          product_name: item.product_title,
          brand: product?.brands?.[0]?.name || undefined,
          variant_id: item.variant_id,
          quantity: item.quantity,
          price: item.unit_price,
        }
      }),
    })
  }

  return (
    <div className="flex flex-col gap-y-2 mt-6 lg:mt-0">
      <Heading level="h2" className="text-xl uppercase">
        Summary
      </Heading>
      <DiscountCode cart={cart} />
      <Divider />
      <CartTotals totals={cart} />
      <LocalizedClientLink
        href="/checkout"
        data-testid="checkout-button"
        onClick={handleCheckoutClick}
      >
        <Button className="mt-2 w-full h-10 uppercase !rounded-none !bg-black !text-white btn-black">Continue to checkout</Button>
      </LocalizedClientLink>
      <AcceptedPaymentMethods />
    </div>
  )
}

export default Summary
