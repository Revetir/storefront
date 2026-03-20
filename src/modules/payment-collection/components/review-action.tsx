"use client"

import { Button } from "@medusajs/ui"
import AfterpayButton from "@modules/checkout/components/afterpay-button"
import { PaymentMethodType } from "@modules/checkout/components/payment/payment-methods-config"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useEffect, useState } from "react"
import {
  PAYMENT_COLLECTION_STATUS_EVENT,
  PAYMENT_COLLECTION_SUBMIT_EVENT,
} from "@modules/payment-collection/constants/events"

type PaymentCollectionStatusDetail = {
  submitting?: boolean
  canSubmit?: boolean
  selectedMethod?: PaymentMethodType | null
}

const getButtonText = (paymentMethod: PaymentMethodType | null): string => {
  switch (paymentMethod) {
    case "afterpay_clearpay":
      return "Pay with Afterpay"
    default:
      return "Place Order"
  }
}

const PaymentCollectionReviewAction = () => {
  const [submitting, setSubmitting] = useState(false)
  const [canSubmit, setCanSubmit] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType | null>(null)

  useEffect(() => {
    const handleStatusUpdate = (event: Event) => {
      const detail = (event as CustomEvent<PaymentCollectionStatusDetail>).detail || {}
      setSubmitting(Boolean(detail.submitting))
      setCanSubmit(Boolean(detail.canSubmit))
      setSelectedMethod((detail.selectedMethod as PaymentMethodType | null) || null)
    }

    window.addEventListener(
      PAYMENT_COLLECTION_STATUS_EVENT,
      handleStatusUpdate as EventListener
    )

    return () => {
      window.removeEventListener(
        PAYMENT_COLLECTION_STATUS_EVENT,
        handleStatusUpdate as EventListener
      )
    }
  }, [])

  const isExpressCheckoutMethod =
    selectedMethod === "apple_pay" ||
    selectedMethod === "google_pay" ||
    selectedMethod === "klarna"

  return (
    <>
      {isExpressCheckoutMethod ? (
        <div className="w-full">
          <div id="payment-collection-express-button-slot" />
          {!canSubmit && (
            <div className="py-4 text-sm text-gray-500">
              Initializing payment method...
            </div>
          )}
        </div>
      ) : selectedMethod === "afterpay_clearpay" ? (
        <AfterpayButton
          onClick={() => window.dispatchEvent(new Event(PAYMENT_COLLECTION_SUBMIT_EVENT))}
          disabled={!canSubmit || submitting}
          isLoading={submitting}
        />
      ) : (
        <Button
          onClick={() => window.dispatchEvent(new Event(PAYMENT_COLLECTION_SUBMIT_EVENT))}
          disabled={!canSubmit || submitting}
          isLoading={submitting}
          className="w-full h-10 uppercase !rounded-none !bg-black !text-white hover:!bg-neutral-900 transition-colors duration-200 cursor-pointer"
        >
          {getButtonText(selectedMethod)}
        </Button>
      )}
      <footer className="w-full bg-white pt-6 pb-4">
        <div className="flex flex-col items-center gap-y-2">
          <div className="text-black text-xs text-center">
            REVETIR, 2 Park Avenue, 20th Floor, New York, NY 10016
          </div>
          <div className="flex flex-wrap justify-center items-center text-gray-400 text-xs gap-x-4">
            <LocalizedClientLink href="/terms-conditions" className="hover:text-ui-fg-base">
              Terms & Conditions
            </LocalizedClientLink>
            <LocalizedClientLink href="/privacy-policy" className="hover:text-ui-fg-base">
              Privacy Policy
            </LocalizedClientLink>
          </div>
        </div>
      </footer>
    </>
  )
}

export default PaymentCollectionReviewAction
