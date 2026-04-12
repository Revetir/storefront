const PAYPAL_PP_ASSET_URL = "/images/PayPal-Monogram-FullColor-RGB.png"

const PayPalPPIcon = () => {
  return (
    <img
      src={PAYPAL_PP_ASSET_URL}
      alt="PayPal"
      width={20}
      height={20}
      className="h-5 w-5 object-contain"
      loading="lazy"
      decoding="async"
    />
  )
}

export default PayPalPPIcon
