export const checkWalletAvailability = () => {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
  const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
  const isMacOS = navigator.platform.toUpperCase().indexOf('MAC') >= 0

  const applePay = (isIOS || (isMacOS && isSafari)) && 'ApplePaySession' in window
  const googlePay = isChrome && !isIOS && 'PaymentRequest' in window

  return { applePay, googlePay }
}
