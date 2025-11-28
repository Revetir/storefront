"use client"

import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import ShoppingBag from "@modules/common/icons/shopping-bag"
import { usePathname } from "next/navigation"
import { Fragment, useEffect, useRef, useState } from "react"
import { getProductUrl, formatBrandNames, getBrandsArray } from "@lib/util/brand-utils"

const CartDropdown = ({
  cart: cartState,
}: {
  cart?: HttpTypes.StoreCart | null
}) => {
  const [activeTimer, setActiveTimer] = useState<NodeJS.Timer | undefined>(
    undefined
  )
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false)

  const open = () => setCartDropdownOpen(true)
  const close = () => setCartDropdownOpen(false)

  const totalItems =
    cartState?.items?.reduce((acc, item) => {
      return acc + item.quantity
    }, 0) || 0

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

  // Clean up the timer when the component unmounts
  useEffect(() => {
    return () => {
      if (activeTimer) {
        clearTimeout(activeTimer)
      }
    }
  }, [activeTimer])

  const pathname = usePathname()

  // open cart dropdown when modifying the cart items, but only if we're not on the cart page
  useEffect(() => {
    if (itemRef.current !== totalItems && !pathname.includes("/cart")) {
      timedOpen()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalItems, itemRef.current])

  return (
    <div
      className="h-full z-50"
      onMouseEnter={openAndCancel}
      onMouseLeave={close}
    >
      {/* Mobile: Direct link to cart page */}
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

      {/* Desktop: Popover dropdown */}
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
              {cartState && cartState.items?.length ? (
                <>
                  <div className="overflow-y-scroll max-h-[402px] px-4 grid grid-cols-1 gap-y-8 no-scrollbar p-px">
                    {cartState.items
                      .sort((a, b) => {
                        return (a.created_at ?? "") > (b.created_at ?? "")
                          ? -1
                          : 1
                      })
                      .map((item) => (
                        <div
                          className="grid grid-cols-[132px_1fr] gap-x-4"
                          key={item.id}
                          data-testid="cart-item"
                        >
                          <LocalizedClientLink
                            href={getProductUrl((item.product as any)?.brands, item.product_handle || '')}
                            className="w-full"
                          >
                            <Thumbnail
                              thumbnail={item.thumbnail}
                              images={item.variant?.product?.images}
                              size="square"
                              product={{
                                brand: { name: (item.product as any)?.brands?.[0]?.name || "Product" },
                                title: item.title || ""
                              } as any}
                            />
                          </LocalizedClientLink>
                          <div className="flex flex-col justify-start flex-1">
                            <div className="flex flex-col">
                              <div className="flex items-start justify-between">
                                <div className="flex flex-col overflow-ellipsis whitespace-nowrap mr-4 w-[180px]">
                                  {getBrandsArray((item.product as any)?.brands).length > 0 && (
                                    <span className="text-ui-fg-muted text-xs font-medium truncate block">
                                      {getBrandsArray((item.product as any)?.brands).map((brand, idx, arr) => (
                                        <Fragment key={brand.slug}>
                                          <span className="uppercase">{brand.name}</span>
                                          {idx < arr.length - 1 && <span> x </span>}
                                        </Fragment>
                                      ))}
                                    </span>
                                  )}
                                  <h3 className="text-base-regular overflow-hidden text-ellipsis normal-case">
                                    <LocalizedClientLink
                                      href={getProductUrl((item.product as any)?.brands, item.product_handle || '')}
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
                                  <span
                                    className="text-ui-fg-muted text-xs"
                                    data-testid="cart-item-quantity"
                                    data-value={item.quantity}
                                  >
                                    <span className="normal-case">Quantity:</span> {item.quantity}
                                  </span>
                                </div>
                                <div className="flex justify-end">
                                  <LineItemPrice
                                    item={item}
                                    style="tight"
                                    currencyCode={cartState.currency_code}
                                    forceVertical={true}
                                    showTotal={false}
                                  />
                                </div>
                              </div>
                            </div>
                            <DeleteButton
                              id={item.id}
                              className="mt-2"
                              data-testid="cart-item-remove-button"
                            >
                              Remove
                            </DeleteButton>
                          </div>
                        </div>
                      ))}
                  </div>
                  <div className="p-4 flex flex-col gap-y-4 text-small-regular">
                    <div className="flex items-center justify-between">
                      <span className="text-ui-fg-base font-semibold">
                        Subtotal{" "}
                        <span className="font-normal"> (excl. taxes)</span>
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
                    <LocalizedClientLink href="/bag" passHref>
                      <Button
                        className="w-full h-10 uppercase !rounded-none !bg-black !text-white hover:!bg-neutral-900 transition-colors duration-200"
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
                        <rect x="6" y="10" width="20" height="18" stroke="currentColor" strokeWidth="2" fill="none"/>
                        <path d="M10 10 L10 8 C10 5.79 11.79 4 14 4 L18 4 C20.21 4 22 5.79 22 8 L22 10" stroke="currentColor" strokeWidth="2" fill="none"/>
                      </svg>
                      <span className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-medium">
                        0
                      </span>
                    </div>
                    <span>Your shopping bag is empty</span>
                    {/* <div>
                      <div className="flex gap-2">
                        <LocalizedClientLink href="/categories/men">
                          <>
                            <span className="sr-only">Go to menswear page</span>
                            <Button onClick={close}>Menswear</Button>
                          </>
                        </LocalizedClientLink>
                        <LocalizedClientLink href="/categories/women">
                          <>
                            <span className="sr-only">Go to womenswear page</span>
                            <Button onClick={close}>Womenswear</Button>
                          </>
                        </LocalizedClientLink>
                      </div>
                    </div> */}
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
