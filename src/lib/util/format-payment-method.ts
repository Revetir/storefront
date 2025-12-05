/**
 * Formats payment method information for customer-facing displays.
 * Accepts a Stripe Charge (with payment_method_details), PaymentIntent, or PaymentMethod
 * and drills into the right object to extract brand/last4.
 */
export function formatPaymentMethod(charge: any): string {
  if (!charge) {
    return "Card"
  }

  // If a PaymentMethod object was provided directly
  if (charge.object === "payment_method") {
    const pm = charge
    if (pm.type === "card" && pm.card) {
      const brand = pm.card.brand
        ? pm.card.brand.charAt(0).toUpperCase() + pm.card.brand.slice(1)
        : "Card"
      return `${brand} · ${pm.card.last4}`
    }
    return `${pm.type.replace(/_/g, " ")} payment`
  }

  // If we were given a PaymentIntent, drill into its charges
  if (charge.object === "payment_intent" || charge?.charges?.data?.length) {
    const intentCharge =
      charge.latest_charge && typeof charge.latest_charge === "object"
        ? charge.latest_charge
        : charge.charges?.data?.[0]

    if (intentCharge) {
      return formatPaymentMethod(intentCharge)
    }

    // If no charges yet, but a payment_method is present, try to use it
    if (charge.payment_method && typeof charge.payment_method === "object") {
      return formatPaymentMethod(charge.payment_method)
    }
  }

  // If latest_charge is attached directly, use it
  if (charge?.latest_charge && typeof charge.latest_charge === "object") {
    return formatPaymentMethod(charge.latest_charge)
  }

  // If we only have an ID string, we can't derive details here
  if (typeof charge === "string") {
    return "Card"
  }

  if (!charge?.payment_method_details) {
    return "Card"
  }

  const { type } = charge.payment_method_details

  switch (type) {
    case "card": {
      const card = charge.payment_method_details.card
      if (!card) return "Card"
      const brand = card.brand
        ? card.brand.charAt(0).toUpperCase() + card.brand.slice(1)
        : "Card"

      // Check for digital wallet (Apple Pay, Google Pay, etc.)
      if (card.wallet) {
        const walletType = card.wallet.type
        if (walletType === "apple_pay") {
          return `Apple Pay (${brand} · ${card.last4})`
        }
        if (walletType === "google_pay") {
          return `Google Pay (${brand} · ${card.last4})`
        }
        if (walletType === "samsung_pay") {
          return `Samsung Pay (${brand} · ${card.last4})`
        }
      }

      // Regular card
      return `${brand} · ${card.last4}`
    }

    case "klarna": {
      const category = charge.payment_method_details.klarna?.payment_method_category
      const categoryMap: Record<string, string> = {
        pay_later: "Pay Later",
        pay_now: "Pay Now",
        pay_in_installments: "Pay in 4",
        pay_with_financing: "Financing",
      }
      return `Klarna - ${categoryMap[category] || "Payment"}`
    }

    case "afterpay_clearpay":
      return "Afterpay"

    case "paypal": {
      const email = charge.payment_method_details.paypal?.payer_email
      if (email) {
        const maskedEmail = email.replace(/(.{3})(.*)(@.*)/, "$1***$3")
        return `PayPal (${maskedEmail})`
      }
      return "PayPal"
    }

    case "us_bank_account": {
      const bank = charge.payment_method_details.us_bank_account
      if (!bank) return "US Bank Account"
      return `${bank.bank_name} · ${bank.last4}`
    }

    case "sepa_debit": {
      const sepa = charge.payment_method_details.sepa_debit
      if (!sepa) return "SEPA Direct Debit"
      return `SEPA · ${sepa.last4}`
    }

    case "link":
      return "Link"

    case "cashapp":
      return "Cash App Pay"

    default:
      return `${type.replace(/_/g, " ")} payment`
  }
}

/**
 * Extracts payment source from order and formats it for display.
 * This is a convenience wrapper that handles the common order shape.
 */
export function getPaymentDisplayFromOrder(order: any): string {
  const payment = order?.payment_collections?.[0]?.payments?.[0]
  const source =
    payment?.data?.latest_charge_expanded ??
    payment?.data?.payment_method_expanded ??
    payment?.data?.payment_intent ??
    payment?.data

  return formatPaymentMethod(source)
}
