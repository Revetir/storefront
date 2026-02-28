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

type FbqTrackPayload = {
  value?: number
  currency?: string
  content_name?: string
  content_ids?: string[]
  content_type?: ContentType
  contents?: PixelContent[]
  num_items?: number
}

const normalizeContentIds = (contentIds?: string[]) => {
  const normalized = contentIds?.filter(
    (id): id is string => typeof id === "string" && id.length > 0
  )

  return normalized?.length ? normalized : undefined
}

const normalizeContents = (contents?: PixelContent[]) => {
  if (!contents?.length) {
    return undefined
  }

  const normalized = contents
    .filter(
      (content): content is PixelContent =>
        Boolean(content && typeof content.id === "string" && content.id.length > 0)
    )
    .map((content) => ({
      id: content.id,
      ...(typeof content.quantity === "number" && content.quantity > 0
        ? { quantity: content.quantity }
        : {}),
      ...(typeof content.item_price === "number" && Number.isFinite(content.item_price)
        ? { item_price: content.item_price }
        : {}),
    }))

  return normalized.length ? normalized : undefined
}

const safeTrack = (eventName: string, payload: FbqTrackPayload) => {
  if (typeof window === "undefined" || typeof window.fbq !== "function") {
    return
  }

  try {
    window.fbq("track", eventName, payload)
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`Meta Pixel "${eventName}" tracking failed`, error)
    }
  }
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
  if (!Number.isFinite(value) || !currency) {
    return
  }

  const normalizedContentIds = normalizeContentIds(contentIds)
  const normalizedContents = normalizeContents(contents)
  const normalizedNumItems =
    typeof numItems === "number" && numItems > 0 ? numItems : undefined

  safeTrack("Purchase", {
    value,
    currency,
    ...(normalizedContentIds ? { content_ids: normalizedContentIds } : {}),
    ...(contentType ? { content_type: contentType } : {}),
    ...(normalizedContents ? { contents: normalizedContents } : {}),
    ...(typeof normalizedNumItems === "number" ? { num_items: normalizedNumItems } : {}),
  })
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
  const normalizedContentIds = normalizeContentIds(contentIds)
  const normalizedContents = normalizeContents(contents)

  safeTrack("ViewContent", {
    ...(typeof value === "number" && Number.isFinite(value) ? { value } : {}),
    ...(currency ? { currency } : {}),
    ...(contentName ? { content_name: contentName } : {}),
    ...(normalizedContentIds ? { content_ids: normalizedContentIds } : {}),
    ...(contentType ? { content_type: contentType } : {}),
    ...(normalizedContents ? { contents: normalizedContents } : {}),
  })
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
  if (!Number.isFinite(value) || !currency) {
    return
  }

  const normalizedContentIds = normalizeContentIds(contentIds)
  const normalizedContents = normalizeContents(contents)

  safeTrack("AddToCart", {
    value,
    currency,
    ...(normalizedContentIds ? { content_ids: normalizedContentIds } : {}),
    ...(contentName ? { content_name: contentName } : {}),
    ...(contentType ? { content_type: contentType } : {}),
    ...(normalizedContents ? { contents: normalizedContents } : {}),
  })
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
  if (!Number.isFinite(value) || !currency) {
    return
  }

  const normalizedContentIds = normalizeContentIds(contentIds)
  const normalizedContents = normalizeContents(contents)
  const normalizedNumItems =
    typeof numItems === "number" && numItems > 0 ? numItems : undefined

  safeTrack("InitiateCheckout", {
    value,
    currency,
    ...(typeof normalizedNumItems === "number" ? { num_items: normalizedNumItems } : {}),
    ...(normalizedContentIds ? { content_ids: normalizedContentIds } : {}),
    ...(contentType ? { content_type: contentType } : {}),
    ...(normalizedContents ? { contents: normalizedContents } : {}),
  })
}
