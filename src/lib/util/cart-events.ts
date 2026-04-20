const CART_OPTIMISTIC_ADD_EVENT = "revetir:cart-optimistic-add"
const CART_OPTIMISTIC_REVERT_EVENT = "revetir:cart-optimistic-revert"

export type CartOptimisticBrandPreview = {
  name: string
  slug?: string
}

export type CartOptimisticItemPreview = {
  variantId?: string
  title?: string
  variantTitle?: string | null
  productHandle?: string
  thumbnail?: string | null
  brands?: CartOptimisticBrandPreview[]
  unitPrice?: number
  originalUnitPrice?: number
  currencyCode?: string
  displayPrice?: string
  displayOriginalPrice?: string
}

export type CartOptimisticDetail = {
  quantity?: number
  requestId?: string
  item?: CartOptimisticItemPreview
}

const dispatchCartEvent = (eventName: string, detail: CartOptimisticDetail) => {
  if (typeof window === "undefined") {
    return
  }

  window.dispatchEvent(new CustomEvent<CartOptimisticDetail>(eventName, { detail }))
}

export const emitOptimisticCartAdd = (detail: CartOptimisticDetail = {}) => {
  dispatchCartEvent(CART_OPTIMISTIC_ADD_EVENT, {
    ...detail,
    quantity: Math.max(0, detail.quantity ?? 1),
  })
}

export const emitOptimisticCartRevert = (
  detail: CartOptimisticDetail = {}
) => {
  dispatchCartEvent(CART_OPTIMISTIC_REVERT_EVENT, {
    ...detail,
    quantity: Math.max(0, detail.quantity ?? 1),
  })
}

export const onOptimisticCartAdd = (
  handler: (detail: CartOptimisticDetail) => void
) => {
  if (typeof window === "undefined") {
    return () => undefined
  }

  const listener = (event: Event) => {
    handler((event as CustomEvent<CartOptimisticDetail>).detail || {})
  }

  window.addEventListener(CART_OPTIMISTIC_ADD_EVENT, listener)

  return () => {
    window.removeEventListener(CART_OPTIMISTIC_ADD_EVENT, listener)
  }
}

export const onOptimisticCartRevert = (
  handler: (detail: CartOptimisticDetail) => void
) => {
  if (typeof window === "undefined") {
    return () => undefined
  }

  const listener = (event: Event) => {
    handler((event as CustomEvent<CartOptimisticDetail>).detail || {})
  }

  window.addEventListener(CART_OPTIMISTIC_REVERT_EVENT, listener)

  return () => {
    window.removeEventListener(CART_OPTIMISTIC_REVERT_EVENT, listener)
  }
}
