import { useEffect, useState } from "react"
import { PAYMENT_METHODS, PaymentMethodConfig } from "./payment-methods-config"
import { checkWalletAvailability } from "@lib/util/wallet-availability"

interface PaymentMethodAvailability {
  applePay: boolean
  googlePay: boolean
}

export const useAvailablePaymentMethods = () => {
  const [availability, setAvailability] = useState<PaymentMethodAvailability>({
    applePay: false,
    googlePay: false,
  })
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Use browser-based wallet detection
    const walletAvailability = checkWalletAvailability()

    setAvailability({
      applePay: walletAvailability.applePay,
      googlePay: walletAvailability.googlePay,
    })

    setIsChecking(false)
  }, [])

  // Filter payment methods based on device support
  const availableMethods: PaymentMethodConfig[] = PAYMENT_METHODS.filter((method) => {
    if (!method.requiresDeviceSupport) {
      return true // Always show methods that don't require device support
    }

    if (method.id === 'apple_pay') {
      return availability.applePay
    }

    if (method.id === 'google_pay') {
      return availability.googlePay
    }

    return false
  })

  return {
    availableMethods,
    isChecking,
    availability,
  }
}
