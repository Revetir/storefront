import { Heading } from "@medusajs/ui"
import { cookies as nextCookies } from "next/headers"

import CartTotals from "@modules/common/components/cart-totals"
import Help from "@modules/order/components/help"
import Items from "@modules/order/components/items"
import OnboardingCta from "@modules/order/components/onboarding-cta"
import OrderDetails from "@modules/order/components/order-details"
import MetaPixelPurchase from "@modules/order/components/meta-pixel-purchase"
import { HttpTypes } from "@medusajs/types"
import { getPaymentDisplayFromOrder } from "@lib/util/format-payment-method"

type OrderCompletedTemplateProps = {
  order: HttpTypes.StoreOrder
}

export default async function OrderCompletedTemplate({
  order,
}: OrderCompletedTemplateProps) {
  const cookies = await nextCookies()

  const isOnboarding = cookies.get("_medusa_onboarding")?.value === "true"
  const paymentDisplay = getPaymentDisplayFromOrder(order)

  return (
    <div className="py-6 min-h-[calc(100vh-64px)]">
      <MetaPixelPurchase order={order} />
      <div className="content-container flex flex-col justify-center items-center gap-y-10 max-w-4xl h-full w-full">
        {isOnboarding && <OnboardingCta orderId={order.id} />}
        <div
          className="flex flex-col gap-6 max-w-4xl h-full bg-white w-full py-12 px-4 sm:px-10"
          data-testid="order-complete-container"
        >
          <Heading
            level="h1"
            className="flex flex-col items-center text-center gap-y-4 text-ui-fg-base mb-6"
          >
            <span className="text-4xl sm:text-5xl md:text-6xl leading-none uppercase">
              THANK YOU
            </span>
            <span className="text-xs sm:text-sm uppercase text-gray-700">
              Your order was placed successfully.
            </span>
          </Heading>

          <div className="hidden sm:flex justify-end mb-2">
            <button
              type="button"
              onClick={() => typeof window !== "undefined" && window.print()}
              className="text-xs underline uppercase text-gray-900"
            >
              Print
            </button>
          </div>
          <div className="space-y-6">
            <OrderDetails order={order} />

            {/* Shipping method, payment method, shipping & billing address - mirrored from account order details layout */}
            <div className="flex flex-col gap-y-4 border-b border-gray-200 pb-4">
              {/* Mobile: 2x2 grid */}
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
                      {order.shipping_address.address_2 && (
                        <p>{order.shipping_address.address_2}</p>
                      )}
                      <p>
                        {order.shipping_address.city}, {order.shipping_address.province}{" "}
                        {order.shipping_address.postal_code}
                      </p>
                      <p>{order.shipping_address.country_code?.toUpperCase()}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="uppercase text-gray-700">Payment Method</p>
                  <p className="text-gray-900">{paymentDisplay}</p>
                </div>

                <div className="space-y-1">
                  <p className="uppercase text-gray-700">Billing Address</p>
                  {order.billing_address && (
                    <div className="text-gray-900 space-y-0.5">
                      <p>
                        {order.billing_address.first_name} {order.billing_address.last_name}
                      </p>
                      <p>{order.billing_address.address_1}</p>
                      {order.billing_address.address_2 && (
                        <p>{order.billing_address.address_2}</p>
                      )}
                      <p>
                        {order.billing_address.city}, {order.billing_address.province}{" "}
                        {order.billing_address.postal_code}
                      </p>
                      <p>{order.billing_address.country_code?.toUpperCase()}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Desktop: 3-column layout */}
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
                    <p className="text-gray-900">{paymentDisplay}</p>
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
                      {order.shipping_address.address_2 && (
                        <p>{order.shipping_address.address_2}</p>
                      )}
                      <p>
                        {order.shipping_address.city}, {order.shipping_address.province}{" "}
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
                      {order.billing_address.address_2 && (
                        <p>{order.billing_address.address_2}</p>
                      )}
                      <p>
                        {order.billing_address.city}, {order.billing_address.province}{" "}
                        {order.billing_address.postal_code}
                      </p>
                      <p>{order.billing_address.country_code?.toUpperCase()}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Heading level="h2" className="flex flex-row text-xl font-medium uppercase mt-4">
            Summary
          </Heading>
          <Items order={order} />
          <CartTotals totals={order} forceFinalLabel />
          <Help />
        </div>
      </div>
    </div>
  )
}
