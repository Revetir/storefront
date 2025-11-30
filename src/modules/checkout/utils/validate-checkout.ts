import { HttpTypes } from "@medusajs/types"

/**
 * Validates required checkout fields
 * Returns array of field names that are missing or invalid
 */
export function validateCheckout(cart: HttpTypes.StoreCart | null): string[] {
  if (!cart) return ["cart"]

  const errors: string[] = []

  // Shipping address validation
  if (!cart.shipping_address?.first_name) {
    errors.push("shipping_address.first_name")
  }
  if (!cart.shipping_address?.last_name) {
    errors.push("shipping_address.last_name")
  }
  if (!cart.shipping_address?.address_1) {
    errors.push("shipping_address.address_1")
  }
  if (!cart.shipping_address?.city) {
    errors.push("shipping_address.city")
  }
  if (!cart.shipping_address?.province) {
    errors.push("shipping_address.province")
  }
  if (!cart.shipping_address?.postal_code) {
    errors.push("shipping_address.postal_code")
  }
  if (!cart.shipping_address?.country_code) {
    errors.push("shipping_address.country_code")
  }
  if (!cart.shipping_address?.phone) {
    errors.push("shipping_address.phone")
  }

  // Email validation
  if (!cart.email) {
    errors.push("email")
  }

  // Billing address validation
  if (!cart.billing_address) {
    errors.push("billing_address")
  } else {
    if (!cart.billing_address.first_name) errors.push("billing_address.first_name")
    if (!cart.billing_address.last_name) errors.push("billing_address.last_name")
    if (!cart.billing_address.address_1) errors.push("billing_address.address_1")
    if (!cart.billing_address.city) errors.push("billing_address.city")
    if (!cart.billing_address.province) errors.push("billing_address.province")
    if (!cart.billing_address.postal_code) errors.push("billing_address.postal_code")
    if (!cart.billing_address.country_code) errors.push("billing_address.country_code")
  }

  return errors
}

/**
 * Triggers HTML5 validation errors on specified fields
 * Shows native browser validation messages
 */
export function triggerFieldErrors(fieldNames: string[]): void {
  if (typeof window === "undefined") return

  fieldNames.forEach((name) => {
    const field = document.querySelector(
      `[name="${name}"]`
    ) as HTMLInputElement | HTMLSelectElement | null

    if (field) {
      // Trigger HTML5 validation by calling reportValidity
      // This will show the native error message
      field.reportValidity()

      // Focus the first invalid field
      if (fieldNames[0] === name) {
        field.focus()
      }
    }
  })
}

/**
 * Scrolls to the top of the page smoothly
 */
export function scrollToTop(): void {
  if (typeof window === "undefined") return
  window.scrollTo({ top: 0, behavior: "smooth" })
}
