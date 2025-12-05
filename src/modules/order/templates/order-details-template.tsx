"use client"

import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Items from "@modules/order/components/items"
import OrderSummary from "@modules/order/components/order-summary"
import React from "react"

type OrderDetailsTemplateProps = {
  order: HttpTypes.StoreOrder
}

const formatStatusLabel = (fulfillmentStatus?: string | null, orderStatus?: string | null) => {
  const overall = (orderStatus || "").toLowerCase()
  if (overall === "canceled") {
    return "CANCELED"
  }

  const normalized = (fulfillmentStatus || "").toLowerCase()

  let mapped: string
  if (normalized === "fulfilled" || normalized === "partially_fulfilled") {
    mapped = "processing"
  } else if (normalized === "not_fulfilled") {
    mapped = "received"
  } else {
    mapped = fulfillmentStatus || orderStatus || ""
  }

  if (!mapped) return ""
  return mapped.replace(/_/g, " ").toUpperCase()
}

const formatOrderDateEST = (dateInput: string | Date | undefined) => {
  if (!dateInput) return ""
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
  })
}

const getPaymentDisplay = (order: HttpTypes.StoreOrder): string | null => {
  const payment = (order as any).payment_collections?.[0]?.payments?.[0]
  const source =
    payment?.data?.latest_charge_expanded ??
    payment?.data?.payment_method_expanded ??
    payment?.data?.payment_intent ??
    payment?.data

  if (!source) return null

  // Fallbacks for common shapes (card / wallet / PayPal)
  const pm = source.payment_method ?? source

  if (pm?.object === "payment_method" || pm?.type === "card") {
    const card = pm.card || pm.payment_method_details?.card
    if (card) {
      const brand = card.brand
        ? card.brand.charAt(0).toUpperCase() + card.brand.slice(1)
        : "Card"
      return `${brand} **** ${card.last4}`
    }
  }

  if (pm?.payment_method_details?.paypal) {
    return "PayPal"
  }

  if (typeof pm === "string") {
    return "Card payment"
  }

  return null
}

const shouldShowTrackLink = (order: HttpTypes.StoreOrder) => {
  const status = (order.fulfillment_status || "").toLowerCase()
  return status === "shipped" || status === "delivered"
}

const OrderDetailsTemplate: React.FC<OrderDetailsTemplateProps> = ({ order }) => {
  const orderStatus = formatStatusLabel(order.fulfillment_status, order.status)
  const orderId = order.display_id ?? order.id
  const orderDateLabel = formatOrderDateEST(order.created_at || new Date())
  const paymentDisplay = getPaymentDisplay(order)

  return (
    <div className="flex flex-col gap-y-6" data-testid="order-details-container">
      {/* Top: Order meta + print + methods/addresses */}
      <div className="flex flex-col gap-y-4 border-b border-gray-200 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs sm:text-md uppercase text-black">ORDER {orderId}</p>
            <p className="text-xs sm:text-sm text-black">{orderDateLabel} EST</p>
          </div>
          <button
            type="button"
            onClick={() => typeof window !== "undefined" && window.print()}
            className="text-xs underline tracking-[0.15em] uppercase text-gray-900"
          >
            Print
          </button>
        </div>

        {/* Mobile: 2x2 grid (Shipping/Payment methods & addresses) */}
        <div className="mt-2 grid grid-cols-2 gap-6 text-xs sm:text-sm md:hidden">
          <div className="space-y-1">
            <p className="uppercase text-gray-700">Shipping Method</p>
            {(order as any).shipping_methods?.map((method: any) => (
              <p key={method.id} className="text-gray-900">
                {method.name}
              </p>
            ))}
          </div>

          <div className="space-y-1">
            <p className="uppercase text-gray-700">Shipping Address</p>
            {order.shipping_address && (
              <div className="text-gray-900 space-y-0.5">
                <p>
                  {order.shipping_address.first_name} {order.shipping_address.last_name}
                </p>
                <p>{order.shipping_address.address_1}</p>
                {order.shipping_address.address_2 && <p>{order.shipping_address.address_2}</p>}
                <p>
                  {order.shipping_address.city}, {order.shipping_address.province} {" "}
                  {order.shipping_address.postal_code}
                </p>
                <p>{order.shipping_address.country_code?.toUpperCase()}</p>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <p className="uppercase text-gray-700">Payment Method</p>
            <p className="text-gray-900">{paymentDisplay || "Card"}</p>
          </div>

          <div className="space-y-1">
            <p className="uppercase text-gray-700">Billing Address</p>
            {order.billing_address && (
              <div className="text-gray-900 space-y-0.5">
                <p>
                  {order.billing_address.first_name} {order.billing_address.last_name}
                </p>
                <p>{order.billing_address.address_1}</p>
                {order.billing_address.address_2 && <p>{order.billing_address.address_2}</p>}
                <p>
                  {order.billing_address.city}, {order.billing_address.province} {" "}
                  {order.billing_address.postal_code}
                </p>
                <p>{order.billing_address.country_code?.toUpperCase()}</p>
              </div>
            )}
          </div>
        </div>

        {/* Desktop: SSENSE-style 3-column layout */}
        <div className="mt-2 hidden md:grid md:grid-cols-3 md:gap-8 text-xs sm:text-sm">
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="uppercase text-gray-700">Shipping Method</p>
              {(order as any).shipping_methods?.map((method: any) => (
                <p key={method.id} className="text-gray-900">
                  {method.name}
                </p>
              ))}
            </div>

            <div className="space-y-1">
              <p className="uppercase text-gray-700">Payment Method</p>
              <p className="text-gray-900">{paymentDisplay || "Card"}</p>
            </div>
          </div>

          <div className="space-y-1">
            <p className="uppercase text-gray-700">Shipping Address</p>
            {order.shipping_address && (
              <div className="text-gray-900 space-y-0.5">
                <p>
                  {order.shipping_address.first_name} {order.shipping_address.last_name}
                </p>
                <p>{order.shipping_address.address_1}</p>
                {order.shipping_address.address_2 && <p>{order.shipping_address.address_2}</p>}
                <p>
                  {order.shipping_address.city}, {order.shipping_address.province} {" "}
                  {order.shipping_address.postal_code}
                </p>
                <p>{order.shipping_address.country_code?.toUpperCase()}</p>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <p className="uppercase text-gray-700">Billing Address</p>
            {order.billing_address && (
              <div className="text-gray-900 space-y-0.5">
                <p>
                  {order.billing_address.first_name} {order.billing_address.last_name}
                </p>
                <p>{order.billing_address.address_1}</p>
                {order.billing_address.address_2 && <p>{order.billing_address.address_2}</p>}
                <p>
                  {order.billing_address.city}, {order.billing_address.province} {" "}
                  {order.billing_address.postal_code}
                </p>
                <p>{order.billing_address.country_code?.toUpperCase()}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Middle: status + track order + items */}
      <div className="flex flex-col gap-y-4 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs uppercase text-gray-700">
            <span className="text-gray-900">{orderStatus}</span>
          </p>
          {shouldShowTrackLink(order) && (
            <LocalizedClientLink
              href="#"
              className="inline-flex items-center justify-center px-6 py-2 border border-gray-900 text-gray-900 text-xs sm:text-sm tracking-[0.15em] uppercase hover:bg-gray-900 hover:text-white transition-colors"
            >
              Track Order
            </LocalizedClientLink>
          )}
        </div>

        <Items order={order} />
      </div>

      {/* Bottom: summary + navigation */}
      <div className="flex flex-col gap-y-4 pt-2">
        <OrderSummary order={order} />

        <div className="flex justify-center mt-2">
          <LocalizedClientLink href="/account/orders" className="min-w-[220px] max-w-xs w-full">
            <button className="w-full px-6 py-3 border border-gray-300 text-gray-900 text-xs sm:text-sm font-medium tracking-[0.15em] uppercase hover:border-gray-900 hover:text-black transition-colors">
              Back to Orders
            </button>
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}

export default OrderDetailsTemplate
