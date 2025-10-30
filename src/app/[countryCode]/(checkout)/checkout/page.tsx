import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import dynamic from "next/dynamic"

// Dynamic imports for heavy checkout components
const PaymentWrapper = dynamic(() => import("@modules/checkout/components/payment-wrapper"))
const CheckoutForm = dynamic(() => import("@modules/checkout/templates/checkout-form"))
const CheckoutSummary = dynamic(() => import("@modules/checkout/templates/checkout-summary"))
const CheckoutWrapper = dynamic(() => import("@modules/checkout/components/checkout-wrapper"))

export const metadata: Metadata = {
  title: "Checkout",
}

export default async function Checkout() {
  const cart = await retrieveCart()

  if (!cart) {
    return notFound()
  }

  const customer = await retrieveCustomer()

  return (
    <CheckoutWrapper>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_416px] content-container gap-x-40 py-12">
        <PaymentWrapper cart={cart}>
          <CheckoutForm cart={cart} customer={customer} />
        </PaymentWrapper>
        <CheckoutSummary cart={cart} />
      </div>
    </CheckoutWrapper>
  )
}
