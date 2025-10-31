import { useEffect, useState } from "react"
import { useElements } from "@stripe/react-stripe-js"
import { PAYMENT_METHODS, PaymentMethodConfig } from "./payment-methods-config"

interface PaymentMethodAvailability {
  applePay: boolean
  googlePay: boolean
}

export const useAvailablePaymentMethods = () => {
  const elements = useElements()
  const [availability, setAvailability] = useState<PaymentMethodAvailability>({
    applePay: false,
    googlePay: false,
  })
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkWalletAvailability = async () => {
      if (!elements) {
        setIsChecking(false)
        return
      }

      try {
        // Create a hidden Express Checkout Element to check availability
        // This uses Stripe's internal availability checking
        const expressCheckoutElement = elements.create('expressCheckout', {
          paymentMethods: {
            applePay: 'auto',
            googlePay: 'auto',
            link: 'never',
            paypal: 'never',
            amazonPay: 'never',
          },
        })

        // Listen for the ready event to get available payment methods
        expressCheckoutElement.on('ready', (event: any) => {
          const availablePaymentMethods = event.availablePaymentMethods || {}

          setAvailability({
            applePay: availablePaymentMethods.applePay || false,
            googlePay: availablePaymentMethods.googlePay || false,
          })

          console.log('Express Checkout available payment methods:', availablePaymentMethods)
          setIsChecking(false)

          // Cleanup: destroy the hidden element after checking
          expressCheckoutElement.destroy()
        })

        // Mount to a temporary hidden container to trigger the ready event
        const tempDiv = document.createElement('div')
        tempDiv.style.display = 'none'
        document.body.appendChild(tempDiv)
        expressCheckoutElement.mount(tempDiv)

        // Cleanup on unmount
        return () => {
          try {
            expressCheckoutElement.destroy()
          } catch (e) {
            // Element may already be destroyed
          }
          if (tempDiv.parentNode) {
            tempDiv.parentNode.removeChild(tempDiv)
          }
        }
      } catch (error) {
        console.error('Error checking payment method availability:', error)
        setIsChecking(false)
      }
    }

    checkWalletAvailability()
  }, [elements])

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
