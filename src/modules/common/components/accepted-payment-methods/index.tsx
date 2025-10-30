import Visa from "@modules/common/icons/visa"
import Mastercard from "@modules/common/icons/mastercard"
import Amex from "@modules/common/icons/amex"
import Discover from "@modules/common/icons/discover"
import ApplePay from "@modules/common/icons/apple-pay"
import GooglePay from "@modules/common/icons/google-pay"
import Affirm from "@modules/common/icons/affirm"
import Cashapp from "@modules/common/icons/cashapp"
import Klarna from "@modules/common/icons/klarna"
import Lock from "@modules/common/icons/lock"

const AcceptedPaymentMethods = () => {
  return (
    <div className="flex flex-col lg:flex-row items-center gap-2 mt-4">
      {/* SECURE PAYMENT text with lock icon */}
      <div className="flex items-center gap-1.5">
        <Lock />
        <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">
          Secure Payment
        </span>
      </div>

      {/* Payment method icons */}
      <div className="flex items-center gap-1.5 flex-wrap justify-center lg:justify-start">
        <Visa />
        <Mastercard />
        <Amex />
        <Discover />
        <ApplePay />
        <GooglePay />
        <Affirm />
        <Cashapp />
        <Klarna />
      </div>
    </div>
  )
}

export default AcceptedPaymentMethods
