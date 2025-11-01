import Visa from "@modules/common/icons/visa"
import Mastercard from "@modules/common/icons/mastercard"
import Amex from "@modules/common/icons/amex"
import Discover from "@modules/common/icons/discover"
import ApplePay from "@modules/common/icons/apple-pay"
import GooglePay from "@modules/common/icons/google-pay"
import Cashapp from "@modules/common/icons/cashapp"
import Klarna from "@modules/common/icons/klarna"

export type PaymentMethodType =
  | 'card'
  | 'apple_pay'
  | 'google_pay'
  | 'afterpay_clearpay'
  | 'klarna'

export interface PaymentMethodConfig {
  id: PaymentMethodType
  label: string
  icons: React.ComponentType[]
  requiresElement: boolean
  requiresDeviceSupport: boolean
}

export const PAYMENT_METHODS: PaymentMethodConfig[] = [
  {
    id: 'card',
    label: 'Pay with credit or debit card',
    icons: [Visa, Mastercard, Amex, Discover],
    requiresElement: true,
    requiresDeviceSupport: false,
  },
  {
    id: 'apple_pay',
    label: 'Pay with Apple Pay',
    icons: [ApplePay],
    requiresElement: false,
    requiresDeviceSupport: true,
  },
  {
    id: 'google_pay',
    label: 'Pay with Google Pay',
    icons: [GooglePay],
    requiresElement: false,
    requiresDeviceSupport: true,
  },
  {
    id: 'afterpay_clearpay',
    label: 'Pay with Afterpay',
    icons: [Cashapp],
    requiresElement: false,
    requiresDeviceSupport: false,
  },
  {
    id: 'klarna',
    label: 'Pay with Klarna',
    icons: [Klarna],
    requiresElement: false,
    requiresDeviceSupport: false,
  },
]
