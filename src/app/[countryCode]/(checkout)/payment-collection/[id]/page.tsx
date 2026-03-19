import { retrievePaymentCollectionCheckoutContext } from "@lib/data/payment-collection"
import { listCartPaymentMethods } from "@lib/data/payment"
import { Heading, Text } from "@medusajs/ui"
import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import Items from "@modules/order/components/items"
import PaymentForm from "@modules/payment-collection/components/payment-form"
import { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

type PageProps = {
  params: Promise<{ countryCode: string; id: string }>
}

export const metadata: Metadata = {
  title: "Payment Collection Checkout",
}

export default async function PaymentCollectionCheckoutPage({ params }: PageProps) {
  const { countryCode, id } = await params
  const context = await retrievePaymentCollectionCheckoutContext(id)

  if (!context?.order || !context?.payment_collection) {
    return notFound()
  }

  const paymentStatus = String(context.order.payment_status || "").toLowerCase()
  if (
    paymentStatus === "authorized" ||
    paymentStatus === "captured" ||
    paymentStatus === "partially_authorized" ||
    paymentStatus === "partially_captured"
  ) {
    redirect(`/${countryCode}/order/${context.order.id}/confirmed`)
  }

  const paymentMethods = await listCartPaymentMethods(context.order.region_id || "")
  const stripeEnabled = Boolean(
    paymentMethods?.some((provider) => provider.id === "pp_stripe_stripe")
  )

  return (
    <div className="content-container py-6 grid grid-cols-1 lg:grid-cols-[1fr_416px] gap-x-40 gap-y-8">
      <div className="w-full">
        <div className="mb-4">
          <Heading level="h1" className="uppercase text-xl">
            Complete Payment
          </Heading>
          <Text className="text-ui-fg-subtle mt-1">
            Order #{context.order.display_id || context.order.custom_display_id || context.order.id}
          </Text>
        </div>
        <Divider className="mb-4" />
        <Items order={context.order} />
      </div>

      <div className="lg:sticky lg:top-20 lg:self-start">
        <div className="w-full bg-white flex flex-col gap-y-6">
          <div>
            <Heading level="h2" className="text-xl uppercase mb-4">
              Review
            </Heading>
            <Divider className="mb-4" />
            <CartTotals totals={context.order} forceFinalLabel />
          </div>

          <PaymentForm
            paymentCollectionId={context.payment_collection.id}
            paymentCollection={context.payment_collection}
            order={context.order}
            countryCode={context.country_code || countryCode || "us"}
            stripeEnabled={stripeEnabled}
          />
        </div>
      </div>
    </div>
  )
}
