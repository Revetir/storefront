"use client"

import { Button } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useEffect, useState } from "react"
import {
  PAYMENT_COLLECTION_STATUS_EVENT,
  PAYMENT_COLLECTION_SUBMIT_EVENT,
} from "@modules/payment-collection/constants/events"

type PaymentCollectionStatusDetail = {
  submitting?: boolean
  canSubmit?: boolean
}

const PaymentCollectionReviewAction = () => {
  const [submitting, setSubmitting] = useState(false)
  const [canSubmit, setCanSubmit] = useState(false)

  useEffect(() => {
    const handleStatusUpdate = (event: Event) => {
      const detail = (event as CustomEvent<PaymentCollectionStatusDetail>).detail || {}
      setSubmitting(Boolean(detail.submitting))
      setCanSubmit(Boolean(detail.canSubmit))
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

  return (
    <>
      <Button
        onClick={() => window.dispatchEvent(new Event(PAYMENT_COLLECTION_SUBMIT_EVENT))}
        disabled={!canSubmit || submitting}
        isLoading={submitting}
        className="w-full h-10 uppercase !rounded-none !bg-black !text-white hover:!bg-neutral-900 transition-colors duration-200 cursor-pointer"
      >
        Place Order
      </Button>
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
