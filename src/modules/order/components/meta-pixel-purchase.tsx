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
    const storageKey = `meta_pixel_purchase_${order.id}`

    try {
      if (sessionStorage.getItem(storageKey) === "1") {
        return
      }
    } catch {
      // Ignore storage access issues and continue with tracking.
    }

    // Only track once when component mounts
    const totalValue = order.total / 100 // Convert from cents to dollars
    const currency = order.currency_code.toUpperCase()

    // Get product IDs from line items
    const contentIds =
      order.items?.map((item) => item.variant?.id || item.variant?.sku || item.id) || []

    // Get detailed contents with quantities
    const contents =
      order.items?.map((item) => ({
        id: item.variant?.id || item.variant?.sku || item.id,
        quantity: item.quantity,
        item_price: typeof item.unit_price === "number" ? item.unit_price / 100 : undefined,
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

    try {
      sessionStorage.setItem(storageKey, "1")
    } catch {
      // Ignore storage access issues after tracking.
    }

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
  }, [order]) // Re-run when order payload changes

  return null // This component doesn't render anything
}
