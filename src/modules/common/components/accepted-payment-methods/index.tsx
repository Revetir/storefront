import Visa from "@modules/common/icons/visa"
import Mastercard from "@modules/common/icons/mastercard"
import Amex from "@modules/common/icons/amex"
import Discover from "@modules/common/icons/discover"
import ApplePay from "@modules/common/icons/apple-pay"
import GooglePay from "@modules/common/icons/google-pay"
import Cashapp from "@modules/common/icons/cashapp"
import Klarna from "@modules/common/icons/klarna"
import Lock from "@modules/common/icons/lock"

const AcceptedPaymentMethods = () => {
  return (
    <div className="flex items-center justify-center gap-1.5 mt-4">
      {/* SECURE PAYMENT text with lock icon */}
      <div className="flex items-center gap-1">
        <div className="flex items-center">
          <Lock />
        </div>
        <span className="text-[10px] font-medium text-gray-600 uppercase tracking-wide mr-1 whitespace-nowrap leading-none">
          Secure Payment
        </span>
      </div>

      {/* Payment method icons */}
      <div className="flex items-center gap-1">
        <div className="flex items-center"><Visa /></div>
        <div className="flex items-center"><Mastercard /></div>
        <div className="flex items-center"><Amex /></div>
        <div className="flex items-center"><Discover /></div>
        <div className="flex items-center"><ApplePay /></div>
        <div className="flex items-center"><GooglePay /></div>
        <div className="flex items-center"><Cashapp /></div>
        <div className="flex items-center"><Klarna /></div>
      </div>
    </div>
  )
}

export default AcceptedPaymentMethods
