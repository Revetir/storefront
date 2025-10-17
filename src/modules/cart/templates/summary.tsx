"use client"

import { Button, Heading } from "@medusajs/ui"

import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import DiscountCode from "@modules/checkout/components/discount-code"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import { trackCheckoutInitiated } from "@lib/util/analytics"

type SummaryProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StorePromotion[]
  }
}

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  } else if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  } else {
    return "payment"
  }
}

const Summary = ({ cart }: SummaryProps) => {
  const step = getCheckoutStep(cart)

  const handleCheckoutClick = () => {
    // Track checkout initiation with item details
    trackCheckoutInitiated({
      cart_value: cart.total,
      item_count: cart.items?.length || 0,
      items: cart.items?.map(item => ({
        product_id: item.product_id,
        product_name: item.product_title,
        brand: (item.product as any)?.brands?.[0]?.name,
        variant_id: item.variant_id,
        quantity: item.quantity,
        price: item.unit_price,
      })),
    })
  }

  return (
    <div className="flex flex-col gap-y-4">
      <Heading level="h2" className="text-[2rem] leading-[2.75rem]">
        Summary
      </Heading>
      <DiscountCode cart={cart} />
      <Divider />
      <CartTotals totals={cart} />
      <LocalizedClientLink
        href={"/checkout?step=" + step}
        data-testid="checkout-button"
        onClick={handleCheckoutClick}
      >
        <Button className="w-full h-10">Proceed to checkout</Button>
      </LocalizedClientLink>
    </div>
  )
}

export default Summary
