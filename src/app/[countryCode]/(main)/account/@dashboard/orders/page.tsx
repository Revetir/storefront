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

export default async function Orders() {
  const orders = await listOrders()

  if (!orders) {
    notFound()
  }

  const hasOrders = orders.length > 0

  return (
    <div className="w-full" data-testid="orders-page-wrapper">
      <div className="mb-6">
        <h1 className="text-2xl-semi tracking-[0.25em] uppercase">Orders</h1>

        <div className="mt-6 border-b border-gray-200">
          <div className="flex gap-x-8 text-sm">
            <button
              type="button"
              className="pb-3 font-semibold border-b-2 border-black uppercase tracking-[0.15em] text-black"
            >
              Orders
            </button>
            <span className="pb-3 text-gray-400 uppercase tracking-[0.15em] cursor-default">
              Returns
            </span>
          </div>
        </div>
      </div>

      {!hasOrders ? (
        <div className="w-full flex items-center justify-center py-16 text-base-regular text-gray-500">
          No orders yet
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {orders.map((order) => {
            const firstItem = order.items?.[0]

            return (
              <div
                key={order.id}
                className="flex flex-col md:flex-row md:items-stretch justify-between gap-6 py-8"
                data-testid="order-wrapper"
              >
                <div className="flex-1 text-sm space-y-1 max-w-xl">
                  <div className="uppercase text-xs tracking-[0.18em] text-gray-600">
                    {new Date(order.created_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                  <div className="uppercase text-xs tracking-[0.18em] text-gray-800">
                    {(order.fulfillment_status || order.status || "").toUpperCase()}
                  </div>
                  <div className="mt-3 space-y-1">
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

                  {shouldShowTrackLink(order) && (
                    <div className="mt-4">
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

                <div className="flex flex-col items-end gap-4 min-w-[120px]">
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

      <Divider className="my-16" />
      <TransferRequestForm />
    </div>
  )
}
