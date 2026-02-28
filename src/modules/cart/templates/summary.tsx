"use client"

import { Button, Heading } from "@medusajs/ui"

import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import DiscountCode from "@modules/checkout/components/discount-code"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import AcceptedPaymentMethods from "@modules/common/components/accepted-payment-methods"
import { HttpTypes } from "@medusajs/types"
import { trackCheckoutInitiated } from "@lib/util/analytics"
import { trackInitiateCheckout } from "@lib/util/meta-pixel"

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
      item_titles:
        cart.items
          ?.map((item) => item.product_title || (item as any).title || '')
          .filter((title): title is string => Boolean(title)) || [],
      item_ids:
        cart.items
          ?.map((item) => item.product_id)
          .filter((id): id is string => Boolean(id)) || [],
      items_summary:
        cart.items
          ?.map((item) => item.product_title || (item as any).title || '')
          .filter((title): title is string => Boolean(title))
          .join(' | ') || '',
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

    const totalValue = typeof cart.total === "number" ? cart.total / 100 : 0
    const currency = (cart.currency_code || "usd").toUpperCase()
    const contentIds =
      cart.items
        ?.map((item) => item.variant_id || item.product_id)
        .filter((id): id is string => Boolean(id)) || []
    const contents =
      cart.items?.reduce<
        Array<{ id: string; quantity: number; item_price?: number }>
      >((acc, item) => {
        const id = item.variant_id || item.product_id
        if (!id) {
          return acc
        }

        const itemPrice =
          typeof item.unit_price === "number" ? item.unit_price / 100 : undefined

        acc.push({
          id,
          quantity: item.quantity,
          ...(typeof itemPrice === "number" ? { item_price: itemPrice } : {}),
        })
        return acc
      }, []) || []
    const numItems =
      cart.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0

    trackInitiateCheckout({
      value: totalValue,
      currency,
      numItems,
      contentIds,
      contentType: "product",
      contents,
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
        <Button className="mt-2 w-full h-10 uppercase !rounded-none !bg-black !text-white hover:!bg-neutral-900 transition-colors duration-200">Continue to checkout</Button>
      </LocalizedClientLink>
      <AcceptedPaymentMethods />
    </div>
  )
}

export default Summary
