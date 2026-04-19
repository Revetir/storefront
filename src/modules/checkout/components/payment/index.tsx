"use client"

import { isPaypal, isSquare } from "@lib/constants"
import { Heading } from "@medusajs/ui"
import ErrorMessage from "@modules/checkout/components/error-message"
import Divider from "@modules/common/components/divider"
import PayPalCartPayment from "./paypal-payment"
import SquareCartPayment from "./square-payment"

const Payment = ({
  cart,
  availablePaymentMethods,
}: {
  cart: any
  availablePaymentMethods: any[]
}) => {
  const squareProviderId = availablePaymentMethods?.find((provider: any) =>
    isSquare(provider.id)
  )?.id
  const paypalProviderId = availablePaymentMethods?.find((provider: any) =>
    isPaypal(provider.id)
  )?.id

  if (squareProviderId) {
    return <SquareCartPayment cart={cart} squareProviderId={squareProviderId} />
  }

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
        error="Square isn't enabled for this region yet. Please contact support."
        data-testid="square-provider-missing-message"
      />
    </div>
  )
}

export default Payment
