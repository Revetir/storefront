"use client"

import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react"
import { deleteLineItem, updateLineItem } from "@lib/data/cart"
import { getProductUrl, getBrandsArray } from "@lib/util/brand-utils"
import {
  CartOptimisticItemPreview,
  onOptimisticCartAdd,
  onOptimisticCartRevert,
} from "@lib/util/cart-events"
import { convertToLocale } from "@lib/util/money"
import { Trash } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ShoppingBag from "@modules/common/icons/shopping-bag"
import Thumbnail from "@modules/products/components/thumbnail"
import { usePathname, useRouter } from "next/navigation"
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react"

type OptimisticCartItem = {
  requestId: string
  quantity: number
  preview?: CartOptimisticItemPreview
  variantId?: string
  hidden: boolean
  lineId?: string
  isSyncing: boolean
  lastRequestedQuantity?: number
}

const MAX_QTY = 10

const getOptimisticRequestIdFromLine = (line: HttpTypes.StoreCartLineItem) => {
  const metadata = (line.metadata || {}) as Record<string, unknown>
  return typeof metadata.optimistic_request_id === "string"
    ? metadata.optimistic_request_id
    : null
}

const sortCartItems = (items: HttpTypes.StoreCartLineItem[]) =>
  [...items].sort((a, b) => ((a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1))

const CartDropdown = ({
  cart: cartState,
}: {
  cart?: HttpTypes.StoreCart | null
}) => {
  const router = useRouter()
  const [activeTimer, setActiveTimer] = useState<ReturnType<typeof setTimeout> | null>(
    null
  )
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false)
  const [updatingLineId, setUpdatingLineId] = useState<string | null>(null)
  const [optimisticItems, setOptimisticItems] = useState<OptimisticCartItem[]>([])
  const [optimisticHiddenServerLineIds, setOptimisticHiddenServerLineIds] = useState<
    Set<string>
  >(new Set())
  const [optimisticDeletingServerLineIds, setOptimisticDeletingServerLineIds] =
    useState<Set<string>>(new Set())

  const open = () => setCartDropdownOpen(true)
  const close = () => setCartDropdownOpen(false)

  const sortedServerItems = useMemo(
    () => sortCartItems(cartState?.items || []),
    [cartState?.items]
  )

  const lineById = useMemo(() => {
    const map = new Map<string, HttpTypes.StoreCartLineItem>()
    sortedServerItems.forEach((item) => {
      map.set(item.id, item)
    })
    return map
  }, [sortedServerItems])

  const linkedLineIds = useMemo(() => {
    const ids = new Set<string>()
    optimisticItems.forEach((item) => {
      if (item.lineId) {
        ids.add(item.lineId)
      }
    })
    return ids
  }, [optimisticItems])

  const optimisticVisibleItems = useMemo(
    () => optimisticItems.filter((item) => !item.hidden && item.quantity > 0),
    [optimisticItems]
  )

  const serverVisibleItems = useMemo(
    () =>
      sortedServerItems.filter(
        (item) =>
          !linkedLineIds.has(item.id) &&
          !optimisticHiddenServerLineIds.has(item.id)
      ),
    [sortedServerItems, linkedLineIds, optimisticHiddenServerLineIds]
  )

  const serverTotalItems =
    cartState?.items?.reduce((acc, item) => {
      return acc + item.quantity
    }, 0) || 0

  const optimisticCountAdjustment = useMemo(() => {
    return optimisticItems.reduce((acc, item) => {
      const line = item.lineId ? lineById.get(item.lineId) : undefined

      if (item.hidden || item.quantity <= 0) {
        if (line) {
          return acc - line.quantity
        }
        return acc
      }

      if (!line) {
        return acc + item.quantity
      }

      return acc + (item.quantity - line.quantity)
    }, 0)
  }, [lineById, optimisticItems])

  const hiddenServerCountAdjustment = useMemo(() => {
    return sortedServerItems.reduce((acc, item) => {
      if (optimisticHiddenServerLineIds.has(item.id)) {
        return acc - item.quantity
      }

      return acc
    }, 0)
  }, [sortedServerItems, optimisticHiddenServerLineIds])

  const totalItems = Math.max(
    0,
    serverTotalItems + optimisticCountAdjustment + hiddenServerCountAdjustment
  )
  const subtotal = cartState?.subtotal ?? 0
  const itemRef = useRef<number>(totalItems || 0)

  const timedOpen = () => {
    open()
    const timer = setTimeout(close, 5000)
    setActiveTimer(timer)
  }

  const openAndCancel = () => {
    if (activeTimer) {
      clearTimeout(activeTimer)
    }
    open()
  }

  const syncOptimisticOperation = useCallback(
    async (requestId: string, lineId: string, targetQuantity: number) => {
      let didFail = false

      try {
        if (targetQuantity <= 0) {
          await deleteLineItem(lineId)
        } else {
          await updateLineItem({
            lineId,
            quantity: targetQuantity,
          })
        }

        router.refresh()
      } catch (error) {
        didFail = true
        console.error("Optimistic cart sync failed", error)
      } finally {
        setOptimisticItems((prev) =>
          prev.map((item) =>
            item.requestId === requestId
              ? {
                  ...item,
                  isSyncing: false,
                  // If the sync failed, clear the in-flight marker so reconcile can retry.
                  lastRequestedQuantity: didFail
                    ? undefined
                    : item.lastRequestedQuantity,
                }
              : item
          )
        )

        if (didFail) {
          router.refresh()
        }
      }
    },
    [router]
  )

  const setOptimisticQuantity = (requestId: string, nextQuantity: number) => {
    const clampedQuantity = Math.max(1, Math.min(MAX_QTY, nextQuantity))

    setOptimisticItems((prev) =>
      prev.map((item) =>
        item.requestId === requestId
          ? {
              ...item,
              hidden: false,
              quantity: clampedQuantity,
            }
          : item
      )
    )
  }

  const removeOptimisticItem = (requestId: string) => {
    setOptimisticItems((prev) =>
      prev.map((item) =>
        item.requestId === requestId
          ? {
              ...item,
              hidden: true,
              quantity: 0,
            }
          : item
      )
    )
  }

  const removeOptimisticServerItem = async (lineId: string) => {
    if (optimisticDeletingServerLineIds.has(lineId)) {
      return
    }

    setOptimisticDeletingServerLineIds((prev) => {
      if (prev.has(lineId)) {
        return prev
      }

      const next = new Set(prev)
      next.add(lineId)
      return next
    })

    setOptimisticHiddenServerLineIds((prev) => {
      const next = new Set(prev)
      next.add(lineId)
      return next
    })

    try {
      await deleteLineItem(lineId)
      router.refresh()
    } catch (error) {
      console.error("Optimistic server line delete failed", error)
      setOptimisticHiddenServerLineIds((prev) => {
        const next = new Set(prev)
        next.delete(lineId)
        return next
      })
      router.refresh()
    } finally {
      setOptimisticDeletingServerLineIds((prev) => {
        const next = new Set(prev)
        next.delete(lineId)
        return next
      })
    }
  }

  // Clean up timer on unmount.
  useEffect(() => {
    return () => {
      if (activeTimer) {
        clearTimeout(activeTimer)
      }
    }
  }, [activeTimer])

  // Prune local optimistic server-delete state as cart lines change.
  useEffect(() => {
    const currentServerLineIds = new Set(sortedServerItems.map((item) => item.id))

    setOptimisticHiddenServerLineIds((prev) => {
      let changed = false
      const next = new Set<string>()
      prev.forEach((id) => {
        if (currentServerLineIds.has(id)) {
          next.add(id)
        } else {
          changed = true
        }
      })
      return changed ? next : prev
    })

    setOptimisticDeletingServerLineIds((prev) => {
      let changed = false
      const next = new Set<string>()
      prev.forEach((id) => {
        if (currentServerLineIds.has(id)) {
          next.add(id)
        } else {
          changed = true
        }
      })
      return changed ? next : prev
    })
  }, [sortedServerItems])

  // Subscribe to optimistic add/revert events.
  useEffect(() => {
    const disposeAdd = onOptimisticCartAdd((detail) => {
      const quantity = Math.max(0, detail.quantity ?? 1)
      const requestId =
        detail.requestId ||
        `optimistic-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

      setOptimisticItems((prev) => [
        {
          requestId,
          quantity,
          preview: detail.item,
          variantId: detail.item?.variantId,
          hidden: false,
          isSyncing: false,
        },
        ...prev,
      ])
    })

    const disposeRevert = onOptimisticCartRevert((detail) => {
      const quantity = Math.max(0, detail.quantity ?? 1)

      setOptimisticItems((prev) => {
        if (!prev.length) {
          return prev
        }

        if (detail.requestId) {
          return prev.filter((item) => item.requestId !== detail.requestId)
        }

        let remaining = quantity
        const nextItems: OptimisticCartItem[] = []

        for (const item of prev) {
          if (remaining <= 0) {
            nextItems.push(item)
            continue
          }

          if (item.quantity > remaining) {
            nextItems.push({
              ...item,
              quantity: item.quantity - remaining,
            })
            remaining = 0
            continue
          }

          remaining -= item.quantity
        }

        return nextItems
      })
    })

    return () => {
      disposeAdd()
      disposeRevert()
    }
  }, [])

  // Link pending optimistic rows to real server lines when they arrive.
  useEffect(() => {
    if (!sortedServerItems.length) {
      return
    }

    setOptimisticItems((prev) => {
      if (!prev.length) {
        return prev
      }

      let changed = false
      const usedLineIds = new Set(
        prev
          .map((item) => item.lineId)
          .filter((lineId): lineId is string => typeof lineId === "string")
      )

      const next = prev.map((item) => {
        if (item.lineId) {
          return item
        }

        const requestMatchedLine = sortedServerItems.find(
          (line) =>
            !usedLineIds.has(line.id) &&
            getOptimisticRequestIdFromLine(line) === item.requestId
        )

        const variantMatchedLine =
          !requestMatchedLine && item.variantId
            ? sortedServerItems.find(
                (line) =>
                  !usedLineIds.has(line.id) && line.variant_id === item.variantId
              )
            : undefined

        const matchedLine = requestMatchedLine || variantMatchedLine

        if (!matchedLine) {
          return item
        }

        usedLineIds.add(matchedLine.id)
        changed = true

        return {
          ...item,
          lineId: matchedLine.id,
        }
      })

      return changed ? next : prev
    })
  }, [sortedServerItems])

  // Reconcile queued optimistic actions as soon as line ids are available.
  useEffect(() => {
    if (!optimisticItems.length) {
      return
    }

    const operations: Array<{
      requestId: string
      lineId: string
      targetQuantity: number
    }> = []

    setOptimisticItems((prev) => {
      if (!prev.length) {
        return prev
      }

      let changed = false
      const nextItems: OptimisticCartItem[] = []

      for (const item of prev) {
        if (!item.lineId) {
          nextItems.push(item)
          continue
        }

        const line = lineById.get(item.lineId)
        const wantsDelete = item.hidden || item.quantity <= 0

        if (wantsDelete && !line) {
          changed = true
          continue
        }

        if (!line) {
          nextItems.push(item)
          continue
        }

        if (wantsDelete) {
          if (!item.isSyncing && item.lastRequestedQuantity !== 0) {
            changed = true
            nextItems.push({
              ...item,
              isSyncing: true,
              lastRequestedQuantity: 0,
            })
            operations.push({
              requestId: item.requestId,
              lineId: item.lineId,
              targetQuantity: 0,
            })
          } else {
            nextItems.push(item)
          }
          continue
        }

        if (line.quantity === item.quantity && !item.isSyncing) {
          changed = true
          continue
        }

        if (!item.isSyncing && item.lastRequestedQuantity !== item.quantity) {
          changed = true
          nextItems.push({
            ...item,
            isSyncing: true,
            lastRequestedQuantity: item.quantity,
          })
          operations.push({
            requestId: item.requestId,
            lineId: item.lineId,
            targetQuantity: item.quantity,
          })
          continue
        }

        nextItems.push(item)
      }

      return changed ? nextItems : prev
    })

    operations.forEach((operation) => {
      void syncOptimisticOperation(
        operation.requestId,
        operation.lineId,
        operation.targetQuantity
      )
    })
  }, [lineById, optimisticItems, syncOptimisticOperation])

  const pathname = usePathname()
  const isCartLikePage = pathname.includes("/cart") || pathname.includes("/bag")

  // Open dropdown when cart item count changes, except on cart-like pages.
  useEffect(() => {
    if (itemRef.current !== totalItems && !isCartLikePage) {
      timedOpen()
    }
    itemRef.current = totalItems
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalItems, isCartLikePage])

  const changeItemQuantity = async (
    item: HttpTypes.StoreCartLineItem,
    nextQuantity: number
  ) => {
    const maxQuantity = item.variant?.manage_inventory ? 10 : MAX_QTY
    const clampedQuantity = Math.max(1, Math.min(maxQuantity, nextQuantity))

    if (clampedQuantity === item.quantity) {
      return
    }

    try {
      setUpdatingLineId(item.id)
      await updateLineItem({
        lineId: item.id,
        quantity: clampedQuantity,
      })
      router.refresh()
    } finally {
      setUpdatingLineId(null)
    }
  }

  const hasRenderableItems =
    optimisticVisibleItems.length > 0 || serverVisibleItems.length > 0

  return (
    <div
      className="h-full z-50"
      onMouseEnter={openAndCancel}
      onMouseLeave={close}
    >
      {/* Mobile: direct link to bag page */}
      <div className="lg:hidden relative">
        <LocalizedClientLink
          href="/bag"
          className="flex items-center justify-center h-full p-1 sm:px-2"
          data-testid="mobile-cart-link"
        >
          <ShoppingBag className="w-5 h-5 text-gray-700" />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </LocalizedClientLink>
      </div>

      {/* Desktop: popover dropdown */}
      <div className="hidden lg:block">
        <Popover className="relative h-full">
          <PopoverButton className="h-full">
            <LocalizedClientLink
              className="hover:text-black hover:underline"
              href="/bag"
              data-testid="nav-cart-link"
            >{`BAG (${totalItems})`}</LocalizedClientLink>
          </PopoverButton>
          <Transition
            show={cartDropdownOpen}
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <PopoverPanel
              static
              className="absolute top-[calc(100%+1px)] right-0 bg-white border-x border-b border-gray-200 w-[450px] text-ui-fg-base"
              data-testid="nav-cart-dropdown"
            >
              <div className="p-4 flex items-center justify-center">
                <h3 className="text-large-semi">Shopping Bag</h3>
              </div>
              {hasRenderableItems ? (
                <>
                  <div className="overflow-y-scroll max-h-[402px] px-4 grid grid-cols-1 gap-y-8 no-scrollbar p-px">
                    {optimisticVisibleItems.map((optimisticItem) => {
                      const preview = optimisticItem.preview
                      const line = optimisticItem.lineId
                        ? lineById.get(optimisticItem.lineId)
                        : undefined

                      const previewBrands = preview?.brands || []
                      const lineBrands = getBrandsArray((line?.product as any)?.brands).map(
                        (brand) => ({
                          name: brand.name,
                          slug: brand.slug,
                        })
                      )
                      const displayBrands =
                        previewBrands.length > 0 ? previewBrands : lineBrands
                      const hrefBrands = displayBrands.filter(
                        (brand): brand is { name: string; slug: string } =>
                          typeof brand.slug === "string" && brand.slug.length > 0
                      )

                      const productHandle =
                        preview?.productHandle || line?.product_handle || ""
                      const optimisticHref = productHandle
                        ? getProductUrl(hrefBrands, productHandle)
                        : "/bag"

                      const title = preview?.title || line?.title || "Item"
                      const variantTitle =
                        preview?.variantTitle || line?.variant?.title || null

                      const optimisticCurrency =
                        preview?.currencyCode || cartState?.currency_code

                      const hasNumericPrice =
                        typeof preview?.unitPrice === "number" &&
                        typeof optimisticCurrency === "string"
                      const hasNumericOriginalPrice =
                        typeof preview?.originalUnitPrice === "number" &&
                        hasNumericPrice &&
                        preview.originalUnitPrice > (preview.unitPrice || 0)

                      const optimisticDisplayPrice =
                        preview?.displayPrice ||
                        (hasNumericPrice
                          ? convertToLocale({
                              amount: (preview?.unitPrice || 0) * optimisticItem.quantity,
                              currency_code: optimisticCurrency || "usd",
                            }).replace(/\s*USD$/, "")
                          : null)

                      const optimisticDisplayOriginalPrice =
                        preview?.displayOriginalPrice ||
                        (hasNumericOriginalPrice
                          ? convertToLocale({
                              amount:
                                (preview?.originalUnitPrice || 0) *
                                optimisticItem.quantity,
                              currency_code: optimisticCurrency || "usd",
                            }).replace(/\s*USD$/, "")
                          : null)

                      const isUpdating = optimisticItem.isSyncing

                      return (
                        <div
                          className="grid grid-cols-[132px_1fr] gap-x-4"
                          key={optimisticItem.requestId}
                          data-testid="cart-item-optimistic"
                        >
                          <LocalizedClientLink href={optimisticHref} className="w-full">
                            <Thumbnail
                              thumbnail={preview?.thumbnail ?? line?.thumbnail ?? null}
                              images={line?.variant?.product?.images}
                              size="square"
                              product={
                                {
                                  brands: displayBrands,
                                  title,
                                } as any
                              }
                            />
                          </LocalizedClientLink>
                          <div className="flex flex-col flex-1 min-h-[132px]">
                            <div className="flex items-center justify-between flex-1">
                              <div className="flex flex-col overflow-ellipsis whitespace-nowrap mr-4 w-[180px]">
                                {displayBrands.length > 0 && (
                                  <span className="text-ui-fg-muted text-xs font-medium truncate block">
                                    {displayBrands.map((brand, idx, arr) => (
                                      <Fragment key={`${brand.slug || brand.name}-${idx}`}>
                                        <span className="uppercase">{brand.name}</span>
                                        {idx < arr.length - 1 && <span> x </span>}
                                      </Fragment>
                                    ))}
                                  </span>
                                )}
                                <h3 className="text-base-regular overflow-hidden text-ellipsis normal-case">
                                  <LocalizedClientLink
                                    href={optimisticHref}
                                    data-testid="product-link-optimistic"
                                    className="normal-case"
                                  >
                                    {title}
                                  </LocalizedClientLink>
                                </h3>
                                {variantTitle &&
                                  variantTitle.toLowerCase() !== "default variant" && (
                                    <div className="text-ui-fg-subtle text-xs">
                                      <span className="normal-case">Size:</span>{" "}
                                      {variantTitle.length <= 3
                                        ? variantTitle.toUpperCase()
                                        : variantTitle}
                                    </div>
                                  )}
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                {line && cartState ? (
                                  <LineItemPrice
                                    item={line}
                                    style="tight"
                                    currencyCode={cartState.currency_code}
                                    forceVertical={true}
                                    showTotal={false}
                                  />
                                ) : optimisticDisplayPrice ? (
                                  <div className="text-left">
                                    {optimisticDisplayOriginalPrice ? (
                                      <div className="flex flex-col items-start gap-0.5">
                                        <span className="text-xs text-ui-fg-base font-medium">
                                          {optimisticDisplayPrice}
                                        </span>
                                        <span className="line-through text-gray-500 text-xs">
                                          {optimisticDisplayOriginalPrice}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-xs text-ui-fg-base font-medium">
                                        {optimisticDisplayPrice}
                                      </span>
                                    )}
                                  </div>
                                ) : null}
                                <div className="inline-flex items-center gap-1 text-ui-fg-muted text-xs whitespace-nowrap">
                                  <span className="normal-case whitespace-nowrap">
                                    Quantity: {optimisticItem.quantity}
                                  </span>
                                  <div className="flex flex-col gap-[1px]">
                                    <button
                                      type="button"
                                      aria-label="Increase quantity"
                                      onClick={() =>
                                        setOptimisticQuantity(
                                          optimisticItem.requestId,
                                          optimisticItem.quantity + 1
                                        )
                                      }
                                      disabled={isUpdating || optimisticItem.quantity >= MAX_QTY}
                                      className="w-3 h-2 flex items-center justify-center text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                      <span className="w-0 h-0 border-l-[3px] border-r-[3px] border-b-[4px] border-l-transparent border-r-transparent border-b-current" />
                                    </button>
                                    <button
                                      type="button"
                                      aria-label="Decrease quantity"
                                      onClick={() =>
                                        setOptimisticQuantity(
                                          optimisticItem.requestId,
                                          optimisticItem.quantity - 1
                                        )
                                      }
                                      disabled={isUpdating || optimisticItem.quantity <= 1}
                                      className="w-3 h-2 flex items-center justify-center text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                      <span className="w-0 h-0 border-l-[3px] border-r-[3px] border-t-[4px] border-l-transparent border-r-transparent border-t-current" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div
                              className="mt-4 mb-1 self-start flex items-center justify-between text-small-regular"
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  removeOptimisticItem(optimisticItem.requestId)
                                }
                                disabled={optimisticItem.isSyncing}
                                className="flex gap-x-1 text-ui-fg-subtle hover:text-ui-fg-base cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                data-testid="cart-item-remove-button-optimistic"
                              >
                                <Trash />
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}

                    {serverVisibleItems.map((item) => {
                      const maxQuantity = item.variant?.manage_inventory
                        ? 10
                        : MAX_QTY
                      const isUpdating = updatingLineId === item.id
                      const isDeleting = optimisticDeletingServerLineIds.has(item.id)

                      return (
                        <div
                          className="grid grid-cols-[132px_1fr] gap-x-4"
                          key={item.id}
                          data-testid="cart-item"
                        >
                          <LocalizedClientLink
                            href={getProductUrl(
                              (item.product as any)?.brands,
                              item.product_handle || ""
                            )}
                            className="w-full"
                          >
                            <Thumbnail
                              thumbnail={item.thumbnail}
                              images={item.variant?.product?.images}
                              size="square"
                              product={
                                {
                                  brand: {
                                    name:
                                      (item.product as any)?.brands?.[0]?.name ||
                                      "Product",
                                  },
                                  title: item.title || "",
                                } as any
                              }
                            />
                          </LocalizedClientLink>
                          <div className="flex flex-col flex-1 min-h-[132px]">
                            <div className="flex items-center justify-between flex-1">
                              <div className="flex flex-col overflow-ellipsis whitespace-nowrap mr-4 w-[180px]">
                                {getBrandsArray((item.product as any)?.brands).length > 0 && (
                                  <span className="text-ui-fg-muted text-xs font-medium truncate block">
                                    {getBrandsArray((item.product as any)?.brands).map(
                                      (brand, idx, arr) => (
                                        <Fragment key={brand.slug}>
                                          <span className="uppercase">{brand.name}</span>
                                          {idx < arr.length - 1 && <span> x </span>}
                                        </Fragment>
                                      )
                                    )}
                                  </span>
                                )}
                                <h3 className="text-base-regular overflow-hidden text-ellipsis normal-case">
                                  <LocalizedClientLink
                                    href={getProductUrl(
                                      (item.product as any)?.brands,
                                      item.product_handle || ""
                                    )}
                                    data-testid="product-link"
                                    className="normal-case"
                                  >
                                    {item.title}
                                  </LocalizedClientLink>
                                </h3>
                                <div className="text-ui-fg-subtle text-xs">
                                  <LineItemOptions
                                    variant={item.variant}
                                    data-testid="cart-item-variant"
                                    data-value={item.variant}
                                    size="text-xs"
                                  />
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <LineItemPrice
                                  item={item}
                                  style="tight"
                                  currencyCode={cartState?.currency_code || "usd"}
                                  forceVertical={true}
                                  showTotal={false}
                                />
                                <div
                                  className="inline-flex items-center gap-1 text-ui-fg-muted text-xs whitespace-nowrap"
                                  data-testid="cart-item-quantity"
                                  data-value={item.quantity}
                                >
                                  <span className="normal-case whitespace-nowrap">
                                    Quantity: {item.quantity}
                                  </span>
                                  <div className="flex flex-col gap-[1px]">
                                    <button
                                      type="button"
                                      aria-label="Increase quantity"
                                      onClick={() =>
                                        changeItemQuantity(item, item.quantity + 1)
                                      }
                                      disabled={isUpdating || item.quantity >= maxQuantity}
                                      className="w-3 h-2 flex items-center justify-center text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                      <span className="w-0 h-0 border-l-[3px] border-r-[3px] border-b-[4px] border-l-transparent border-r-transparent border-b-current" />
                                    </button>
                                    <button
                                      type="button"
                                      aria-label="Decrease quantity"
                                      onClick={() =>
                                        changeItemQuantity(item, item.quantity - 1)
                                      }
                                      disabled={isUpdating || item.quantity <= 1}
                                      className="w-3 h-2 flex items-center justify-center text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                      <span className="w-0 h-0 border-l-[3px] border-r-[3px] border-t-[4px] border-l-transparent border-r-transparent border-t-current" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="mt-4 mb-1 self-start flex items-center justify-between text-small-regular">
                              <button
                                type="button"
                                onClick={() => removeOptimisticServerItem(item.id)}
                                disabled={isDeleting}
                                className="flex gap-x-1 text-ui-fg-subtle hover:text-ui-fg-base cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                data-testid="cart-item-remove-button"
                              >
                                <Trash />
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="p-4 flex flex-col gap-y-4 text-small-regular">
                    {cartState ? (
                      <div className="flex items-center justify-between">
                        <span className="text-ui-fg-base font-semibold">
                          Subtotal <span className="font-normal">(excluding taxes)</span>
                        </span>
                        <span
                          className="text-large-semi"
                          data-testid="cart-subtotal"
                          data-value={subtotal}
                        >
                          {convertToLocale({
                            amount: subtotal,
                            currency_code: cartState.currency_code,
                          })}
                        </span>
                      </div>
                    ) : (
                      <div className="text-ui-fg-subtle text-xs uppercase tracking-[0.08em]">
                        Updating bag...
                      </div>
                    )}
                    <LocalizedClientLink href="/bag" passHref>
                      <Button
                        variant="transparent"
                        className="w-full h-10 uppercase !rounded-none !bg-black !text-white hover:!bg-neutral-900 transition-colors duration-200 !shadow-none after:!hidden focus-visible:!shadow-none"
                        data-testid="go-to-cart-button"
                      >
                        Go to bag
                      </Button>
                    </LocalizedClientLink>
                  </div>
                </>
              ) : (
                <div>
                  <div className="flex py-16 flex-col gap-y-4 items-center justify-center">
                    <div className="relative">
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 32 32"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-gray-900"
                      >
                        <rect
                          x="6"
                          y="10"
                          width="20"
                          height="18"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                        />
                        <path
                          d="M10 10 L10 8 C10 5.79 11.79 4 14 4 L18 4 C20.21 4 22 5.79 22 8 L22 10"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                        />
                      </svg>
                      <span className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-medium">
                        0
                      </span>
                    </div>
                    <span>Your shopping bag is empty</span>
                  </div>
                </div>
              )}
            </PopoverPanel>
          </Transition>
        </Popover>
      </div>
    </div>
  )
}

export default CartDropdown
