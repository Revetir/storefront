import { Metadata } from "next"

import { notFound } from "next/navigation"
import { listOrders } from "@lib/data/orders"
import Divider from "@modules/common/components/divider"
import TransferRequestForm from "@modules/account/components/transfer-request-form"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

export const metadata: Metadata = {
  title: "Orders",
  description: "Overview of your previous orders.",
}

const shouldShowTrackLink = (order: HttpTypes.StoreOrder) => {
  const status = (order.fulfillment_status || "").toLowerCase()
  return status === "shipped" || status === "delivered" || status === "fulfilled"
}

const formatStatusLabel = (status?: string | null) => {
  if (!status) return ""
  return status.replace(/_/g, " ").toUpperCase()
}

export default async function Orders() {
  const orders = await listOrders()

  if (!orders) {
    notFound()
  }

  const hasOrders = orders.length > 0

  return (
    <div className="w-full" data-testid="orders-page-wrapper">
      <div className="mb-3 sm:mb-4">
        <h1 className="text-xl-semi sm:text-2xl-semi uppercase">Orders</h1>

        <div className="mt-3 sm:mt-4">
          <div className="flex gap-x-6 text-xs sm:text-sm overflow-x-auto">
            <button
              type="button"
              className="pb-3 font-semibold uppercase underline text-black"
            >
              Orders
            </button>
            <span className="pb-3 text-gray-400 uppercase cursor-default">
              Returns
            </span>
          </div>
        </div>
      </div>

      {!hasOrders ? (
        <div className="w-full flex items-center justify-center py-12 sm:py-16 text-base-regular text-gray-500 text-center px-4">
          No orders yet
        </div>
      ) : (
        <div className="mt-3 sm:mt-4 border-t border-gray-200 divide-y divide-gray-200">
          {orders.map((order) => {
            const firstItem = order.items?.[0]

            return (
              <div
                key={order.id}
                className="flex flex-row items-center md:items-stretch justify-between gap-4 sm:gap-5 md:gap-6 py-4 sm:py-5 md:py-6"
                data-testid="order-wrapper"
              >
                <div className="flex-1 text-sm max-w-xl">
                  {/* Group 1: Date + fulfillment status */}
                  <div className="space-y-1">
                    <div className="uppercase text-xs text-gray-600">
                      {new Date(order.created_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                    <div className="uppercase text-xs text-gray-800">
                      {formatStatusLabel(order.fulfillment_status || order.status || "")}
                    </div>
                  </div>

                  {/* Group 2: Order number + total */}
                  <div className="mt-3 sm:mt-4 space-y-1">
                    <div className="text-sm">
                      <span className="font-semibold">Order </span>
                      <span>#{order.display_id}</span>
                    </div>
                    <div className="text-sm" data-testid="order-amount">
                      {convertToLocale({
                        amount: order.total,
                        currency_code: order.currency_code,
                      })}
                    </div>
                  </div>

                  {/* Group 3: Track Order CTA */}
                  {shouldShowTrackLink(order) && (
                    <div className="mt-3 sm:mt-4">
                      {/* TODO: Wire up tracking once dedicated tracking route is finalized */}
                      <button
                        type="button"
                        className="text-xs underline tracking-[0.15em] uppercase text-black"
                      >
                        Track Order
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center md:items-end gap-3 sm:gap-4 min-w-[110px] sm:min-w-[120px]">
                  <LocalizedClientLink
                    href={`/account/orders/details/${order.id}`}
                    className="text-xs underline tracking-[0.15em] uppercase"
                  >
                    View Details
                  </LocalizedClientLink>

                  {firstItem && (
                    <LocalizedClientLink
                      href={`/account/orders/details/${order.id}`}
                      className="block w-24 md:w-28 lg:w-32"
                    >
                      <Thumbnail
                        thumbnail={firstItem.thumbnail}
                        images={[]}
                        size="full"
                        product={{
                          type: { value: "Product" },
                          title: firstItem.title || "",
                        } as any}
                      />
                    </LocalizedClientLink>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
