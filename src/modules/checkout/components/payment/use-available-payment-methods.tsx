import { useEffect, useState } from "react"
import { useStripe } from "@stripe/react-stripe-js"
import { PAYMENT_METHODS, PaymentMethodConfig } from "./payment-methods-config"

interface PaymentMethodAvailability {
  applePay: boolean
  googlePay: boolean
}

export const useAvailablePaymentMethods = (cartTotal: number, currency: string) => {
  const stripe = useStripe()
  const [availability, setAvailability] = useState<PaymentMethodAvailability>({
    applePay: false,
    googlePay: false,
  })
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkWalletAvailability = async () => {
      if (!stripe) {
        setIsChecking(false)
        return
      }

      try {
        // Create a PaymentRequest to check device capabilities
        const paymentRequest = stripe.paymentRequest({
          country: 'US',
          currency: currency.toLowerCase(),
          total: {
            label: 'Total',
            amount: cartTotal,
          },
          requestPayerName: true,
          requestPayerEmail: true,
        })

        // Check if Apple Pay or Google Pay can be used
        const result = await paymentRequest.canMakePayment()

        if (result) {
          setAvailability({
            applePay: result.applePay || false,
            googlePay: result.googlePay || false,
          })
        }
      } catch (error) {
        console.error('Error checking payment method availability:', error)
      } finally {
        setIsChecking(false)
      }
    }

    checkWalletAvailability()
  }, [stripe, cartTotal, currency])

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
