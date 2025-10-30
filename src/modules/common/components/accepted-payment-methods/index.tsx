import Visa from "@modules/common/icons/visa"
import Mastercard from "@modules/common/icons/mastercard"
import Amex from "@modules/common/icons/amex"
import Discover from "@modules/common/icons/discover"
import ApplePay from "@modules/common/icons/apple-pay"
import Klarna from "@modules/common/icons/klarna"
import Lock from "@modules/common/icons/lock"

const AcceptedPaymentMethods = () => {
  return (
    <div className="flex items-center gap-1.5 mt-4">
      {/* SECURE PAYMENT text with lock icon */}
      <div className="flex items-center gap-1">
        <Lock />
        <span className="text-[10px] font-medium text-gray-600 uppercase tracking-wide whitespace-nowrap">
          Secure Payment
        </span>
      </div>

      {/* Payment method icons */}
      <div className="flex items-center gap-1">
        <Visa />
        <Mastercard />
        <Amex />
        <Discover />
        <ApplePay />
        <Klarna />
      </div>
    </div>
  )
}

export default AcceptedPaymentMethods
