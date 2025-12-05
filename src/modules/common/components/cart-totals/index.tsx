"use client"

import { convertToLocale } from "@lib/util/money"
import React, { useState } from "react"
import { useCheckoutContext } from "@modules/checkout/components/checkout-context"

type CartTotalsProps = {
  totals: {
    total?: number | null
    subtotal?: number | null
    tax_total?: number | null
    shipping_total?: number | null
    discount_total?: number | null
    gift_card_total?: number | null
    currency_code: string
    shipping_subtotal?: number | null
    shipping_address?: {
      address_1?: string | null
      city?: string | null
      province?: string | null
      postal_code?: string | null
      country_code?: string | null
    } | null
  }
  isCheckoutPage?: boolean
  forceFinalLabel?: boolean
}

const CartTotals: React.FC<CartTotalsProps> = ({ totals, isCheckoutPage = false, forceFinalLabel = false }) => {
  const [deliveryExpanded, setDeliveryExpanded] = useState(false)
  const [returnsExpanded, setReturnsExpanded] = useState(false)

  // Try to get checkout context if available (only on checkout page)
  let localAddressComplete = false
  let isCalculatingTax = false
  let setIsCalculatingTax: ((value: boolean) => void) | null = null
  try {
    const context = useCheckoutContext()
    localAddressComplete = context.localAddressComplete
    isCalculatingTax = context.isCalculatingTax
    setIsCalculatingTax = context.setIsCalculatingTax
  } catch {
    // Context not available (e.g., on bag page) - that's fine
  }

  const {
    currency_code,
    total,
    subtotal,
    tax_total,
    discount_total,
    gift_card_total,
    shipping_subtotal,
    shipping_address,
  } = totals

  // Check if we have a complete address for tax calculation (from cart data)
  // Tax calculation requires: street address, city, state/province, postal code, and country
  const hasAddressInCart = !!(
    shipping_address?.address_1 &&
    shipping_address?.city &&
    shipping_address?.province &&
    shipping_address?.postal_code &&
    shipping_address?.country_code
  )

  // Use local address state for immediate feedback, fall back to cart data
  const hasAddress = localAddressComplete || hasAddressInCart

  // Auto-clear calculating state when we detect NEW tax has arrived
  // This handles the case where the page redirected and state was restored from sessionStorage
  React.useEffect(() => {
    if (!isCalculatingTax || !setIsCalculatingTax) return
    if (!hasAddress) return

    // Check if we have a snapshot of the old tax value
    if (typeof window !== "undefined") {
      const snapshot = sessionStorage.getItem("checkout_tax_snapshot")
      if (snapshot) {
        const { oldTax, timestamp, calculationId, targetAddress } = JSON.parse(snapshot)

        // Check if calculation has timed out (more than 5 seconds)
        const age = Date.now() - timestamp
        // if (age > 5000) {
        //   console.log(`CartTotals - Calculation timed out after ${age}ms, clearing state`)
        //   setIsCalculatingTax(false)
        //   sessionStorage.removeItem("checkout_tax_snapshot")
        //   return
        // }

        // Check if the cart's address matches the target address we were calculating for
        // This handles the case where tax stays the same (same jurisdiction, different address)
        const addressMatches = targetAddress && shipping_address && (
          shipping_address.address_1 === targetAddress.address_1 &&
          shipping_address.city === targetAddress.city &&
          shipping_address.province === targetAddress.province &&
          shipping_address.postal_code === targetAddress.postal_code
        )

        // Clear if tax value has CHANGED from old value
        const hasNewData = tax_total !== oldTax && tax_total !== undefined && tax_total !== null

        // Clear if we have valid tax data AND address matches what we were calculating for
        const calculationComplete = addressMatches && tax_total !== undefined && tax_total !== null

        // Fallback: Clear if we have valid tax data after a reasonable delay (for older snapshots without targetAddress)
        const hasValidDataAfterDelay = age > 1000 && tax_total !== undefined && tax_total !== null

        if (hasNewData) {
          console.log(`CartTotals - Tax updated from ${oldTax} to ${tax_total} (calc ${calculationId}), clearing state`)
          setIsCalculatingTax(false)
          sessionStorage.removeItem("checkout_tax_snapshot")
        } else if (calculationComplete) {
          console.log(`CartTotals - Address matches target, calculation complete (calc ${calculationId}), tax: ${tax_total}, clearing state`)
          setIsCalculatingTax(false)
          sessionStorage.removeItem("checkout_tax_snapshot")
        } else if (hasValidDataAfterDelay) {
          console.log(`CartTotals - Valid tax data after delay: ${tax_total} (calc ${calculationId}), clearing state`)
          setIsCalculatingTax(false)
          sessionStorage.removeItem("checkout_tax_snapshot")
        } else {
          console.log(`CartTotals - Still calculating (${age}ms), current: ${tax_total}, old: ${oldTax}, addressMatches: ${addressMatches}`)
        }
      } else {
        // No snapshot means we're not in a redirect scenario
        // Clear if we have valid tax
        if (tax_total !== undefined && tax_total !== null) {
          console.log("CartTotals - No snapshot, clearing calculating state")
          setIsCalculatingTax(false)
        }
      }
    }
  }, [isCalculatingTax, hasAddress, tax_total, shipping_address, setIsCalculatingTax])

  return (
    <div>
      <div className="flex flex-col gap-y-2 txt-medium text-ui-fg-subtle ">
        <div className="flex items-center justify-between">
          <span className="flex gap-x-1 items-center uppercase">
            Subtotal
          </span>
          <span data-testid="cart-subtotal" data-value={subtotal || 0}>
            {convertToLocale({ amount: subtotal ?? 0, currency_code })}
          </span>
        </div>
        {!!discount_total && (
          <div className="flex items-center justify-between">
            <span>Discount</span>
            <span
              className="text-ui-fg-interactive"
              data-testid="cart-discount"
              data-value={discount_total || 0}
            >
              -{" "}
              {convertToLocale({ amount: discount_total ?? 0, currency_code })}
            </span>
          </div>
        )}
        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setDeliveryExpanded(!deliveryExpanded)}
              className="flex items-center gap-1.5 text-left hover:text-gray-700 transition-colors group"
              aria-expanded={deliveryExpanded}
              aria-label="Toggle delivery information"
            >
              <span className="uppercase">Delivery</span>
              <svg
                className={`w-3 h-3 text-gray-400 group-hover:text-gray-600 transition-all duration-300 ${
                  deliveryExpanded ? 'rotate-180' : 'rotate-0'
                }`}
                fill="none"
                strokeWidth="2"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {(() => {
              const shippingAmount = shipping_subtotal ?? 0
              return (
                <span
                  data-testid="cart-shipping"
                  data-value={shippingAmount}
                >
                  {shippingAmount === 0 ? (
                    <strong>Free</strong>
                  ) : (
                    convertToLocale({ amount: shippingAmount, currency_code })
                  )}
                </span>
              )
            })()}
          </div>
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              deliveryExpanded ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <p className="text-xs italic text-gray-500 mt-1 leading-relaxed">
              Standard shipping is <strong>complimentary</strong> on this order, with all duties and additional import fees prepaid.
            </p>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setReturnsExpanded(!returnsExpanded)}
              className="flex items-center gap-1.5 text-left hover:text-gray-700 transition-colors group"
              aria-expanded={returnsExpanded}
              aria-label="Toggle returns information"
            >
              <span className="uppercase">Returns</span>
              <svg
                className={`w-3 h-3 text-gray-400 group-hover:text-gray-600 transition-all duration-300 ${
                  returnsExpanded ? 'rotate-180' : 'rotate-0'
                }`}
                fill="none"
                strokeWidth="2"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <span>
              <strong>Free</strong>
            </span>
          </div>
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              returnsExpanded ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <p className="text-xs italic text-gray-500 mt-1 leading-relaxed">
              Returns are <strong>complimentary</strong> within 7 days of delivery, with a prepaid return label included in every order.
            </p>
          </div>
        </div>
        <div className="flex justify-between">
          <span className="flex gap-x-1 items-center uppercase">Taxes</span>
          <span data-testid="cart-taxes" data-value={tax_total || 0}>
            {isCalculatingTax ? (
              <span className="italic">Calculating...</span>
            ) : hasAddress ? (
              convertToLocale({ amount: tax_total ?? 0, currency_code })
            ) : (
              <span className="italic">
                {isCheckoutPage ? "Enter shipping address" : "Calculated at checkout"}
              </span>
            )}
          </span>
        </div>
        {!!gift_card_total && (
          <div className="flex items-center justify-between">
            <span>Gift card</span>
            <span
              className="text-ui-fg-interactive"
              data-testid="cart-gift-card-amount"
              data-value={gift_card_total || 0}
            >
              -{" "}
              {convertToLocale({ amount: gift_card_total ?? 0, currency_code })}
            </span>
          </div>
        )}
      </div>
      <div className="h-px w-full border-b border-gray-200 my-4" />
      <div className="flex items-center justify-between text-ui-fg-base txt-medium uppercase">
        <span>{forceFinalLabel || (isCheckoutPage && hasAddress) ? "Order Total" : "Estimated Order Total"}</span>
        <span
          className="txt-xlarge-plus"
          data-testid="cart-total"
          data-value={total || 0}
        >
          {convertToLocale({ amount: total ?? 0, currency_code })}
        </span>
      </div>
    </div>
  )
}

export default CartTotals
