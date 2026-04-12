const PAYPAL_PAY_LATER_ASSET_URL =
  "https://www.paypalobjects.com/dev-studio-space/pay-later.png"

const PayPalPayLater = () => {
  return (
    <span className="inline-flex h-5 w-[94px] items-center overflow-hidden">
      <img
        src={PAYPAL_PAY_LATER_ASSET_URL}
        alt="PayPal Pay Later"
        width={94}
        height={20}
        className="h-full w-full object-cover object-bottom"
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
      />
    </span>
  )
}

export default PayPalPayLater
