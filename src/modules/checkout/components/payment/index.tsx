"use client"

import { isPaypal } from "@lib/constants"
import { Heading } from "@medusajs/ui"
import ErrorMessage from "@modules/checkout/components/error-message"
import Divider from "@modules/common/components/divider"
import PayPalCartPayment from "./paypal-payment"

const Payment = ({
  cart,
  availablePaymentMethods,
}: {
  cart: any
  availablePaymentMethods: any[]
}) => {
  const paypalProviderId = availablePaymentMethods?.find((provider: any) =>
    isPaypal(provider.id)
  )?.id

  if (paypalProviderId) {
    return <PayPalCartPayment cart={cart} paypalProviderId={paypalProviderId} />
  }

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center gap-x-2 justify-left mb-4">
        <Heading level="h2" className="text-xl gap-x-2 items-baseline uppercase">
          Payment Method
        </Heading>
      </div>
      <Divider className="mb-6" />
      <ErrorMessage
        error="PayPal isn't enabled for this region yet. Please contact support."
        data-testid="paypal-provider-missing-message"
      />
    </div>
  )
}

export default Payment
