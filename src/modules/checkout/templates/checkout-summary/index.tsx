import { Heading } from "@medusajs/ui"

import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import DiscountCode from "@modules/checkout/components/discount-code"
import Review from "@modules/checkout/components/review"
import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"

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
        <div className="[&_table_tbody_tr]:border-b-0">
          <ItemsPreviewTemplate cart={cart} />
        </div>
        <Divider className="my-4" />
        <CartTotals totals={cart} isCheckoutPage={true} />
        <div className="my-6">
          <DiscountCode cart={cart} />
        </div>
        {/* Review button - shown in summary column (both mobile and desktop) */}
        <Review cart={cart} />
      </div>
    </div>
  )
}

export default CheckoutSummary
