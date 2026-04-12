const PAYPAL_PP_ASSET_URL =
  "https://www.paypalobjects.com/webstatic/mktg/Logo/pp-logo-100px.png"

const PayPalPPIcon = () => {
  return (
    <img
      src={PAYPAL_PP_ASSET_URL}
      alt="PayPal"
      width={28}
      height={20}
      className="h-5 w-auto object-contain"
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
    />
  )
}

export default PayPalPPIcon
