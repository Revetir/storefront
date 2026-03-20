import { retrievePaymentCollectionCheckoutContext } from "@lib/data/payment-collection"
import { isStripe } from "@lib/constants"
import { listCartPaymentMethods } from "@lib/data/payment"
import { Heading, Text } from "@medusajs/ui"
import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import PaymentForm from "@modules/payment-collection/components/payment-form"
import { notFound, redirect } from "next/navigation"

const ReadOnlyAddressSection = ({
  title,
  address,
}: {
  title: string
  address: any
}) => {
  const fields = [
    { label: "First Name", value: address?.first_name || "" },
    { label: "Last Name", value: address?.last_name || "" },
    { label: "Street Address", value: address?.address_1 || "" },
    { label: "Apt. / Unit #", value: address?.address_2 || "" },
    { label: "Company", value: address?.company || "" },
    { label: "City", value: address?.city || "" },
    { label: "State", value: address?.province || "" },
    { label: "Zip Code", value: address?.postal_code || "" },
    {
      label: "Country",
      value: address?.country_code ? String(address.country_code).toUpperCase() : "",
    },
    { label: "Phone", value: address?.phone || "" },
  ]

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-4">
        <Heading level="h2" className="flex flex-row text-xl gap-x-2 items-baseline uppercase">
          {title}
        </Heading>
      </div>
      <Divider className="mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field) => (
          <div key={`${title}-${field.label}`}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            <input
              value={field.value}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 bg-gray-50 text-gray-700"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

const ReadOnlyShippingMethod = ({ order }: { order: any }) => {
  const shippingMethod = order?.shipping_methods?.[0]

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-4">
        <Heading level="h2" className="flex flex-row text-xl gap-x-2 items-baseline uppercase">
          Shipping Method
        </Heading>
      </div>
      <Divider className="mb-6" />
      <div className="pb-8 md:pt-0 pt-2">
        <div className="flex items-center gap-x-4 text-small-regular py-1.5">
          <div className="w-4 h-4 rounded-full border-2 border-black flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-black" />
          </div>
          <div className="flex flex-col flex-1">
            <span className="text-base-regular">
              {shippingMethod ? shippingMethod.name || "Standard" : "Standard"}
            </span>
          </div>
          <span className="text-ui-fg-base">
            {shippingMethod?.amount === 0 ? "Free" : `$${Number(shippingMethod?.amount || 0).toFixed(2)}`}
          </span>
        </div>
      </div>
    </div>
  )
}

export default async function PaymentCollectionCheckoutTemplate({
  countryCode,
  paymentCollectionId,
}: {
  countryCode: string
  paymentCollectionId: string
}) {
  const context = await retrievePaymentCollectionCheckoutContext(paymentCollectionId)

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
  const stripeProviderId =
    paymentMethods?.find((provider) => isStripe(provider.id))?.id || null
  const stripeEnabled = Boolean(stripeProviderId)

  const summaryLikeCart = {
    ...context.order,
    items: context.order.items || [],
    currency_code: context.order.currency_code,
  }

  return (
    <div className="content-container py-6 grid grid-cols-1 lg:grid-cols-[1fr_416px] gap-x-40 gap-y-8">
      <div className="w-full grid grid-cols-1 gap-y-8">
        <div className="mb-4">
          <Heading level="h1" className="uppercase text-xl">
            Complete Payment
          </Heading>
          <Text className="text-ui-fg-subtle mt-1">
            Order #{context.order.custom_display_id || context.order.display_id || context.order.id}
          </Text>
        </div>

        <ReadOnlyAddressSection title="Shipping Address" address={context.order.shipping_address} />
        <ReadOnlyAddressSection title="Billing Address" address={context.order.billing_address} />
        <ReadOnlyShippingMethod order={context.order} />

        <PaymentForm
          paymentCollectionId={context.payment_collection.id}
          paymentCollection={context.payment_collection}
          order={context.order}
          countryCode={context.country_code || countryCode || "us"}
          stripeEnabled={stripeEnabled}
          stripeProviderId={stripeProviderId}
        />
      </div>

      <div className="lg:sticky lg:top-20 lg:self-start">
        <div className="w-full bg-white flex flex-col gap-y-6">
          <div>
            <Heading level="h2" className="text-xl uppercase mb-4">
              Review
            </Heading>
            <Divider className="mb-4" />
            <div className="[&_table]:border-b-0 [&_table_tbody]:border-b-0 [&_table_tbody_tr]:border-b-0">
              <ItemsPreviewTemplate cart={summaryLikeCart as any} />
            </div>
            <Divider className="my-4" />
            <CartTotals totals={summaryLikeCart as any} forceFinalLabel />
          </div>
        </div>
      </div>
    </div>
  )
}

