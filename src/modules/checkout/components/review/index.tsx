"use client"

import { Heading, Text } from "@medusajs/ui"

import PaymentButton from "../payment-button"
import { usePaymentContext } from "../payment/payment-context"

const Review = ({ cart }: { cart: any }) => {
  const { selectedPaymentMethod } = usePaymentContext()

  // Express Checkout methods handle payment with their own buttons
  // No need to show the traditional "Place Order" button for these
  const isExpressCheckoutMethod =
    selectedPaymentMethod === 'apple_pay' ||
    selectedPaymentMethod === 'google_pay' ||
    selectedPaymentMethod === 'klarna'

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className="flex flex-row text-xl gap-x-2 items-baseline uppercase"
        >
          Review
        </Heading>
      </div>
      <div className="flex items-start gap-x-1 w-full mb-6">
        <div className="w-full">
          <Text className="txt-medium-plus text-ui-fg-base mb-1">
            {isExpressCheckoutMethod
              ? "By clicking the payment button above, you acknowledge that you have understood and accepted our Terms of Sale."
              : "By clicking Place Order, you acknowledge that you have understood and accepted our Terms of Sale."
            }
          </Text>
        </div>
      </div>
      {!isExpressCheckoutMethod && (
        <PaymentButton cart={cart} data-testid="submit-order-button" />
      )}
    </div>
  )
}

export default Review
