/**
 * Meta Pixel tracking utilities
 * Provides type-safe wrapper for Facebook Pixel events
 */

declare global {
  interface Window {
    fbq?: (...args: any[]) => void
  }
}

type ContentType = "product" | "product_group"

type PixelContent = {
  id: string
  quantity?: number
  item_price?: number
}

/**
 * Track a Meta Pixel Purchase event
 * @param value - Total purchase value in the currency
 * @param currency - Currency code (e.g., 'USD')
 * @param contentIds - Array of product/variant IDs
 * @param contentType - Type of content ('product' or 'product_group')
 * @param contents - Array of items with id and quantity
 * @param numItems - Total number of items
 */
export const trackPurchase = ({
  value,
  currency,
  contentIds,
  contentType = "product",
  contents,
  numItems,
}: {
  value: number
  currency: string
  contentIds?: string[]
  contentType?: ContentType
  contents?: PixelContent[]
  numItems?: number
}) => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "Purchase", {
      value,
      currency,
      content_ids: contentIds,
      content_type: contentType,
      contents,
      num_items: numItems,
    })
  }
}

/**
 * Track a Meta Pixel ViewContent event
 * @param value - Content value
 * @param currency - Currency code
 * @param contentName - Name of the content
 * @param contentIds - Array of content IDs
 * @param contentType - Type of content ('product' or 'product_group')
 * @param contents - Array of items with id and quantity
 */
export const trackViewContent = ({
  value,
  currency,
  contentName,
  contentIds,
  contentType = "product",
  contents,
}: {
  value?: number
  currency?: string
  contentName?: string
  contentIds?: string[]
  contentType?: ContentType
  contents?: PixelContent[]
}) => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "ViewContent", {
      value,
      currency,
      content_name: contentName,
      content_ids: contentIds,
      content_type: contentType,
      contents,
    })
  }
}

/**
 * Track a Meta Pixel AddToCart event
 * @param value - Item value
 * @param currency - Currency code
 * @param contentIds - Array of content IDs
 * @param contentName - Name of the content
 * @param contentType - Type of content ('product' or 'product_group')
 * @param contents - Array of items with id and quantity
 */
export const trackAddToCart = ({
  value,
  currency,
  contentIds,
  contentName,
  contentType = "product",
  contents,
}: {
  value: number
  currency: string
  contentIds?: string[]
  contentName?: string
  contentType?: ContentType
  contents?: PixelContent[]
}) => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "AddToCart", {
      value,
      currency,
      content_ids: contentIds,
      content_name: contentName,
      content_type: contentType,
      contents,
    })
  }
}

/**
 * Track a Meta Pixel InitiateCheckout event
 * @param value - Total cart value
 * @param currency - Currency code
 * @param numItems - Number of items
 * @param contentIds - Array of content IDs
 * @param contentType - Type of content ('product' or 'product_group')
 * @param contents - Array of items with id and quantity
 */
export const trackInitiateCheckout = ({
  value,
  currency,
  numItems,
  contentIds,
  contentType = "product",
  contents,
}: {
  value: number
  currency: string
  numItems?: number
  contentIds?: string[]
  contentType?: ContentType
  contents?: PixelContent[]
}) => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "InitiateCheckout", {
      value,
      currency,
      num_items: numItems,
      content_ids: contentIds,
      content_type: contentType,
      contents,
    })
  }
}
