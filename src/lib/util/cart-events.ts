const CART_OPTIMISTIC_ADD_EVENT = "revetir:cart-optimistic-add"
const CART_OPTIMISTIC_REVERT_EVENT = "revetir:cart-optimistic-revert"

type CartOptimisticDetail = {
  quantity?: number
}

const dispatchCartEvent = (eventName: string, detail: CartOptimisticDetail) => {
  if (typeof window === "undefined") {
    return
  }

  window.dispatchEvent(new CustomEvent<CartOptimisticDetail>(eventName, { detail }))
}

export const emitOptimisticCartAdd = (quantity = 1) => {
  dispatchCartEvent(CART_OPTIMISTIC_ADD_EVENT, { quantity })
}

export const emitOptimisticCartRevert = (quantity = 1) => {
  dispatchCartEvent(CART_OPTIMISTIC_REVERT_EVENT, { quantity })
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
