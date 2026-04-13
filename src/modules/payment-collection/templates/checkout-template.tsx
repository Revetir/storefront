import { retrievePaymentCollectionCheckoutContext } from "@lib/data/payment-collection"
import { isPaypal } from "@lib/constants"
import { listCartPaymentMethods } from "@lib/data/payment"
import { Heading, Text } from "@medusajs/ui"
import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import PayPalPaymentCollectionForm from "@modules/payment-collection/components/paypal-payment-form"
import { US_STATES } from "@modules/checkout/utils/us-states"
import { notFound, redirect } from "next/navigation"

const ReadOnlyAddressSection = ({
  title,
  address,
}: {
  title: string
  address: any
}) => {
  const resolveCountryName = (countryCode: string | undefined) => {
    if (!countryCode) {
      return ""
    }

    try {
      const displayNames = new Intl.DisplayNames(["en"], { type: "region" })
      return displayNames.of(countryCode.toUpperCase()) || countryCode.toUpperCase()
    } catch {
      return countryCode.toUpperCase()
    }
  }

  const resolveStateName = (
    province: string | undefined,
    countryCode: string | undefined
  ) => {
    if (!province) {
      return ""
    }

    const country = (countryCode || "").toLowerCase()
    const normalized = province.trim().toLowerCase()

    if (country === "us") {
      const stateCode = normalized.startsWith("us-")
        ? normalized.slice(3)
        : normalized
      const state = US_STATES.find((entry) => entry.code.toLowerCase() === stateCode)
      if (state) {
        return state.name
      }
    }

    return province
  }

  const fields = [
    { label: "First Name", value: address?.first_name || "" },
    { label: "Last Name", value: address?.last_name || "" },
    { label: "Street Address", value: address?.address_1 || "" },
    { label: "Apt. / Unit #", value: address?.address_2 || "" },
    { label: "Company", value: address?.company || "" },
    { label: "City", value: address?.city || "" },
    {
      label: "State",
      value: resolveStateName(address?.province, address?.country_code),
    },
    { label: "Zip Code", value: address?.postal_code || "" },
    {
      label: "Country",
      value: resolveCountryName(address?.country_code),
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
            <label className="block text-xs uppercase tracking-wide text-ui-fg-subtle mb-1.5">
              {field.label}
            </label>
            <div className="w-full px-3 py-2 border border-ui-border-base bg-ui-bg-subtle text-ui-fg-base min-h-[42px] cursor-default select-text">
              {field.value || "\u2014"}
            </div>
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
  const paypalProviderId =
    paymentMethods?.find((provider) => isPaypal(provider.id))?.id ||
    "pp_paypal_paypal"
  const paypalEnabled = Boolean(paymentMethods?.some((provider) => isPaypal(provider.id)))

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

        {paypalEnabled ? (
          <PayPalPaymentCollectionForm
            paymentCollectionId={context.payment_collection.id}
            paymentCollection={context.payment_collection}
            order={context.order}
            countryCode={context.country_code || countryCode || "us"}
            paypalProviderId={paypalProviderId}
          />
        ) : (
          <div className="bg-white">
            <div className="flex flex-row items-center justify-between mb-4">
              <Heading level="h2" className="flex flex-row text-xl gap-x-2 items-baseline uppercase">
                Payment Method
              </Heading>
            </div>
            <Divider className="mb-6" />
            <Text className="text-ui-fg-subtle">
              PayPal isn&apos;t enabled for this region yet. Please contact support.
            </Text>
          </div>
        )}
      </div>

      <div className="lg:sticky lg:top-20 lg:self-start">
        <div className="w-full bg-white flex flex-col">
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
            {paypalEnabled && (
              <div className="mt-4">
                <div id="payment-collection-review-payment-action-slot" className="w-full" />
              </div>
            )}
            <Divider className="my-6" />
            <footer className="w-full bg-white pb-4">
              <div className="flex flex-col items-center gap-y-2">
                <div className="text-black text-xs text-center">
                  REVETIR, 2 Park Avenue, 20th Floor, New York, NY 10016
                </div>
                <div className="flex flex-wrap justify-center items-center text-gray-400 text-xs gap-x-4">
                  <LocalizedClientLink href="/terms-conditions" className="hover:text-ui-fg-base">
                    Terms &amp; Conditions
                  </LocalizedClientLink>
                  <LocalizedClientLink href="/privacy-policy" className="hover:text-ui-fg-base">
                    Privacy Policy
                  </LocalizedClientLink>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  )
}
