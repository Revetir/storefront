import { Heading } from "@medusajs/ui"

import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import DiscountCode from "@modules/checkout/components/discount-code"
import Review from "@modules/checkout/components/review"
import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const CheckoutSummary = ({ cart }: { cart: any }) => {
  return (
    <div className="sticky top-0 flex flex-col-reverse lg:flex-col gap-y-8 py-8 lg:py-0 ">
      <div className="w-full bg-white flex flex-col">
        <Heading
          level="h2"
          className="flex flex-row text-xl items-baseline uppercase mb-4"
        >
          Review
        </Heading>
        <Divider className="mb-6" />
        <div className="[&_table]:border-b-0 [&_table_tbody]:border-b-0 [&_table_tbody_tr]:border-b-0">
          <ItemsPreviewTemplate cart={cart} />
        </div>
        <Divider className="my-4" />
        <CartTotals totals={cart} isCheckoutPage={true} />
        <div className="my-6">
          <DiscountCode cart={cart} />
        </div>
        {/* Review button - shown in summary column (both mobile and desktop) */}
        <Review cart={cart} />
        <Divider className="my-6" />
        <footer className="w-full bg-white pb-4">
          <div className="flex flex-col items-center gap-y-2">
            <div className="text-gray-400 text-xs text-center">
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
      </div>
    </div>
  )
}

export default CheckoutSummary
