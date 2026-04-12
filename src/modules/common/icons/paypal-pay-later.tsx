const PAYPAL_PAY_LATER_ASSET_URL =
  "https://www.paypalobjects.com/dev-studio-space/pay-later.png"

const PayPalPayLater = () => {
  return (
    <img
      src={PAYPAL_PAY_LATER_ASSET_URL}
      alt="PayPal Pay Later"
      width={110}
      height={20}
      className="h-5 w-auto object-contain"
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
    />
  )
}

export default PayPalPayLater
