const PAYPAL_PAY_LATER_ASSET_URL = "/images/paypal-pay-later-cropped.png"

const PayPalPayLater = () => {
  return (
    <img
      src={PAYPAL_PAY_LATER_ASSET_URL}
      alt="PayPal Pay Later"
      width={94}
      height={20}
      className="h-5 w-[94px] object-contain"
      loading="lazy"
      decoding="async"
    />
  )
}

export default PayPalPayLater
