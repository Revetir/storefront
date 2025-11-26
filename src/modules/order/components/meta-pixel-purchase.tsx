"use client"

import { useEffect } from "react"
import { trackPurchase } from "@lib/util/meta-pixel"
import { HttpTypes } from "@medusajs/types"

type MetaPixelPurchaseProps = {
  order: HttpTypes.StoreOrder
}

/**
 * Client component that fires Meta Pixel Purchase event
 * Should be included on order confirmation page
 */
export default function MetaPixelPurchase({ order }: MetaPixelPurchaseProps) {
  useEffect(() => {
    // Only track once when component mounts
    const totalValue = order.total / 100 // Convert from cents to dollars
    const currency = order.currency_code.toUpperCase()

    // Get product IDs from line items
    const contentIds = order.items?.map((item) => item.variant?.sku || item.id) || []

    // Get detailed contents with quantities
    const contents = order.items?.map((item) => ({
      id: item.variant?.sku || item.id,
      quantity: item.quantity,
    })) || []

    // Total number of items
    const numItems = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0

    trackPurchase({
      value: totalValue,
      currency,
      contentIds,
      contentType: "product",
      contents,
      numItems,
    })

    // Optional: Log for debugging (remove in production)
    if (process.env.NODE_ENV === "development") {
      console.log("Meta Pixel Purchase Event Tracked:", {
        value: totalValue,
        currency,
        contentIds,
        contents,
        numItems,
        orderId: order.id,
      })
    }
  }, [order.id]) // Only re-run if order ID changes

  return null // This component doesn't render anything
}
