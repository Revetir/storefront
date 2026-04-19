import { HttpTypes } from "@medusajs/types"
import { Container } from "@medusajs/ui"
import Checkbox from "@modules/common/components/checkbox"
import { mapKeys, debounce } from "lodash"
import React, { useEffect, useMemo, useState, useCallback } from "react"
import AddressSelect from "../address-select"
import AddressAutocomplete, {
  RadarAddress,
} from "../address-autocomplete"
import { US_STATES } from "../../utils/us-states"
import { setAddresses } from "@lib/data/cart"
import { useCheckoutContext } from "../checkout-context"
import { CHECKOUT_VALIDATION_ERRORS_EVENT } from "../../utils/validate-checkout"

const ShippingAddress = ({
  customer,
  cart,
  checked,
  onChange,
}: {
  customer: HttpTypes.StoreCustomer | null
  cart: HttpTypes.StoreCart | null
  checked: boolean
  onChange: () => void
}) => {
  const { setLocalAddressComplete, setIsCalculatingTax } = useCheckoutContext()

  // Initialize formData - restore from sessionStorage if user was editing, otherwise use cart data
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    // Check if we have persisted form data from before redirect
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("checkout_user_edited_address")
      const storedFormData = sessionStorage.getItem("checkout_address_form_data")

      if (stored === "true" && storedFormData) {
        try {
          const parsed = JSON.parse(storedFormData)
          console.log("ShippingAddress - restoring form data from sessionStorage:", parsed)
          return parsed
        } catch (e) {
          console.error("Failed to parse stored form data:", e)
        }
      }
    }

    // Default: initialize from cart prop
    return {
      "shipping_address.first_name": cart?.shipping_address?.first_name || "",
      "shipping_address.last_name": cart?.shipping_address?.last_name || "",
      "shipping_address.address_1": cart?.shipping_address?.address_1 || "",
      "shipping_address.address_2": cart?.shipping_address?.address_2 || "",
      "shipping_address.company": cart?.shipping_address?.company || "",
      "shipping_address.postal_code": cart?.shipping_address?.postal_code || "",
      "shipping_address.city": cart?.shipping_address?.city || "",
      "shipping_address.country_code": cart?.shipping_address?.country_code || "",
      "shipping_address.province": cart?.shipping_address?.province || "",
      "shipping_address.phone": cart?.shipping_address?.phone || "",
      email: cart?.email || "",
    }
  })

  // Initialize hasUserEdited from sessionStorage to persist across redirects
  const [hasUserEdited, setHasUserEdited] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("checkout_user_edited_address")
      if (stored === "true") {
        console.log("ShippingAddress - restoring hasUserEdited from sessionStorage")
        return true
      }
    }
    return false
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const getRequiredFieldError = useCallback((fieldName: string) => {
    if (fieldName === "email") {
      return "Please enter your email"
    }

    const label = fieldName
      .replace("shipping_address.", "")
      .replace(/_/g, " ")

    return `Please enter your ${label}`
  }, [])

  const getRequiredInputClassName = (hasError: boolean) =>
    `w-full px-3 py-2 border focus:outline-none focus:ring-0 ${
      hasError
        ? "border-red-500 focus:border-red-500"
        : "border-gray-300 focus:border-black"
    }`

  // Persist formData to sessionStorage when user is editing
  useEffect(() => {
    if (hasUserEdited && typeof window !== "undefined") {
      sessionStorage.setItem("checkout_address_form_data", JSON.stringify(formData))
    }
  }, [formData, hasUserEdited])

  // Cleanup sessionStorage on unmount (when user leaves checkout)
  useEffect(() => {
    return () => {
      // Only clear if navigating away from checkout entirely
      // The redirect within checkout will preserve the state
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname
        if (!currentPath.includes('/checkout')) {
          sessionStorage.removeItem("checkout_user_edited_address")
          sessionStorage.removeItem("checkout_address_form_data")
        }
      }
    }
  }, [])

  // Check if address is complete for tax calculation
  useEffect(() => {
    const isComplete = !!(
      formData["shipping_address.address_1"] &&
      formData["shipping_address.city"] &&
      formData["shipping_address.province"] &&
      formData["shipping_address.postal_code"] &&
      formData["shipping_address.country_code"]
    )

    setLocalAddressComplete(isComplete)
  }, [formData, setLocalAddressComplete])

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\d{8,13}$/
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
  }

  const createAddressFormPayload = (
    values: Record<string, any>,
    sameAsBilling: boolean
  ) => {
    const formDataObj = new FormData()

    Object.keys(values).forEach((key) => {
      const value = values[key]
      formDataObj.append(key, value === undefined || value === null ? "" : String(value))
    })

    formDataObj.append("same_as_billing", sameAsBilling ? "on" : "off")
    return formDataObj
  }

  const countriesInRegion = useMemo(
    () => cart?.region?.countries?.map((c) => c.iso_2).filter((code): code is string => !!code),
    [cart?.region]
  )

  // check if customer has saved addresses that are in the current region
  const addressesInRegion = useMemo(
    () =>
      customer?.addresses.filter(
        (a) => a.country_code && countriesInRegion?.includes(a.country_code)
      ),
    [customer?.addresses, countriesInRegion]
  )

  const setFormAddress = (
    address?: HttpTypes.StoreCartAddress,
    email?: string
  ) => {
    address &&
      setFormData((prevState: Record<string, any>) => ({
        ...prevState,
        "shipping_address.first_name": address?.first_name || "",
        "shipping_address.last_name": address?.last_name || "",
        "shipping_address.address_1": address?.address_1 || "",
        "shipping_address.address_2": address?.address_2 || "",
        "shipping_address.company": address?.company || "",
        "shipping_address.postal_code": address?.postal_code || "",
        "shipping_address.city": address?.city || "",
        "shipping_address.country_code": address?.country_code || "",
        "shipping_address.province": address?.province || "",
        "shipping_address.phone": address?.phone || "",
      }))

    email &&
      setFormData((prevState: Record<string, any>) => ({
        ...prevState,
        email: email,
      }))
  }

  useEffect(() => {
    // Only initialize form data from cart if user hasn't manually edited yet
    if (hasUserEdited) {
      console.log("ShippingAddress - skipping cart sync, user has edited form")
      return
    }

    // Ensure cart is not null and has a shipping_address before setting form data
    if (cart && cart.shipping_address) {
      setFormAddress(cart?.shipping_address, cart?.email)
    }

    if (cart && !cart.email && customer?.email) {
      setFormAddress(undefined, customer.email)
    }
  }, [cart, hasUserEdited]) // Add hasUserEdited as a dependency

  // Debug logging to track formData changes
  useEffect(() => {
    console.log("ShippingAddress - formData updated:", formData)
  }, [formData])

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLInputElement | HTMLSelectElement
    >
  ) => {
    setHasUserEdited(true)
    // Persist to sessionStorage to survive redirect
    if (typeof window !== "undefined") {
      sessionStorage.setItem("checkout_user_edited_address", "true")
    }
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: "" }))
    }
  }

  // Auto-save address data on blur with debounce
  const debouncedSaveAddress = useCallback(
    debounce(async (formDataObj: FormData) => {
      try {
        // Auto-save to cart silently as the user fills checkout.
        await setAddresses(null, formDataObj)
        setIsCalculatingTax(false)
      } catch (error: any) {
        console.error("Auto-save failed:", error)
        setIsCalculatingTax(false)
      }
    }, 500),
    [setIsCalculatingTax]
  )

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const cancelPendingAutoSave = () => {
      debouncedSaveAddress.cancel()
    }

    window.addEventListener("checkout:submit-intent", cancelPendingAutoSave)
    return () => {
      window.removeEventListener("checkout:submit-intent", cancelPendingAutoSave)
    }
  }, [debouncedSaveAddress])

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const handleValidationErrors = (event: Event) => {
      const detail = (event as CustomEvent<{ fieldNames?: string[] }>).detail
      const fieldNames = detail?.fieldNames || []

      const nextErrors: Record<string, string> = {}
      fieldNames.forEach((name) => {
        if (name === "email" || name.startsWith("shipping_address.")) {
          nextErrors[name] = getRequiredFieldError(name)
        }
      })

      if (Object.keys(nextErrors).length > 0) {
        setErrors((prev) => ({ ...prev, ...nextErrors }))
      }
    }

    window.addEventListener(
      CHECKOUT_VALIDATION_ERRORS_EVENT,
      handleValidationErrors as EventListener
    )

    return () => {
      window.removeEventListener(
        CHECKOUT_VALIDATION_ERRORS_EVENT,
        handleValidationErrors as EventListener
      )
    }
  }, [getRequiredFieldError])

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    // Validate email on blur
    if (name === "email" && value) {
      if (!validateEmail(value)) {
        setErrors(prev => ({ ...prev, [name]: "Please enter a valid email" }))
      }
    }

    // Validate phone on blur
    if (name === "shipping_address.phone" && value) {
      if (!validatePhone(value)) {
        setErrors(prev => ({ ...prev, [name]: "Please enter a valid phone" }))
      }
    }

    // Track tax calculation only when address details needed for tax are complete.
    const isAddressCompleteForTax = !!(
      formData["shipping_address.address_1"] &&
      formData["shipping_address.city"] &&
      formData["shipping_address.province"] &&
      formData["shipping_address.postal_code"]
    )

    if (isAddressCompleteForTax) {
      // Set calculating state BEFORE triggering debounced save to prevent $0.00 flash
      // This ensures "Calculating..." shows immediately when address becomes complete
      if (typeof window !== "undefined") {
        const calculationId = Date.now()
        // Store the address we're calculating for, not just the tax amount
        // This allows us to detect completion even when tax stays the same (same jurisdiction)
        sessionStorage.setItem("checkout_tax_snapshot", JSON.stringify({
          oldTax: cart?.tax_total ?? null,
          timestamp: calculationId,
          calculationId: calculationId,
          targetAddress: {
            address_1: formData["shipping_address.address_1"],
            city: formData["shipping_address.city"],
            province: formData["shipping_address.province"],
            postal_code: formData["shipping_address.postal_code"],
          }
        }))
        console.log(`ShippingAddress - Starting tax calculation ${calculationId}, oldTax: ${cart?.tax_total}`)
      }
      setIsCalculatingTax(true)
    }

    // Always persist latest form state on blur so required fields can't be left unsaved.
    debouncedSaveAddress(createAddressFormPayload(formData, checked))
  }

  const handleInvalid = (e: React.FormEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.preventDefault()
    const target = e.target as HTMLInputElement | HTMLSelectElement

    if (target.name === "email") {
      if (!target.value) {
        setErrors(prev => ({ ...prev, [target.name]: "Please enter your email" }))
      } else if (!validateEmail(target.value)) {
        setErrors(prev => ({ ...prev, [target.name]: "Please enter a valid email" }))
      }
    } else if (target.name === "shipping_address.phone") {
      if (!target.value) {
        setErrors(prev => ({ ...prev, [target.name]: "Please enter your phone" }))
      } else if (!validatePhone(target.value)) {
        setErrors(prev => ({ ...prev, [target.name]: "Please enter a valid phone" }))
      }
    } else {
      const fieldName = target.name.replace("shipping_address.", "")
      const label = fieldName.replace("_", " ")
      setErrors(prev => ({ ...prev, [target.name]: `Please enter your ${label}` }))
    }
  }

  const handleAddressSelect = (address: RadarAddress) => {
    console.log("ShippingAddress - handleAddressSelect called with:", address)

    setHasUserEdited(true)
    // Persist to sessionStorage to survive redirect
    if (typeof window !== "undefined") {
      sessionStorage.setItem("checkout_user_edited_address", "true")
    }

    // Transform state code to Medusa format: {countryCode}-{stateCode}
    const countryCode = address.countryCode?.toLowerCase() || ""
    const stateCode = address.stateCode?.toLowerCase() || ""
    const provinceValue = countryCode && stateCode ? `${countryCode}-${stateCode}` : ""

    const updatedFields = {
      "shipping_address.address_1": `${address.number || ""} ${
        address.street || ""
      }`.trim(),
      "shipping_address.address_2": address.unit || "",
      "shipping_address.city": address.city || "",
      "shipping_address.province": provinceValue,
      "shipping_address.postal_code": address.postalCode || "",
      "shipping_address.country_code": countryCode,
    }

    console.log("ShippingAddress - updating form fields:", JSON.stringify(updatedFields, null, 2))

    // Force a new object reference to ensure React detects the change
    setFormData((prevState: Record<string, any>) => {
      const newState = {
        ...prevState,
        ...updatedFields,
      }
      console.log("ShippingAddress - new formData state:", JSON.stringify(newState, null, 2))
      return newState
    })

    // Set calculating state BEFORE triggering debounced save to prevent $0.00 flash
    // Autocomplete fills all fields at once, so address is always complete here
    if (typeof window !== "undefined") {
      const calculationId = Date.now()
      // Store the address we're calculating for, not just the tax amount
      // This allows us to detect completion even when tax stays the same (same jurisdiction)
      sessionStorage.setItem("checkout_tax_snapshot", JSON.stringify({
        oldTax: cart?.tax_total ?? null,
        timestamp: calculationId,
        calculationId: calculationId,
        targetAddress: {
          address_1: updatedFields["shipping_address.address_1"],
          city: updatedFields["shipping_address.city"],
          province: updatedFields["shipping_address.province"],
          postal_code: updatedFields["shipping_address.postal_code"],
        }
      }))
      console.log(`ShippingAddress - Starting tax calculation ${calculationId}, oldTax: ${cart?.tax_total}`)
    }
    setIsCalculatingTax(true)

    // Trigger auto-save with the updated data
    // Merge current formData with updatedFields for the save
    const mergedData = {
      ...formData,
      ...updatedFields,
    }
    debouncedSaveAddress(createAddressFormPayload(mergedData, checked))
  }

  return (
    <>
      {customer && (addressesInRegion?.length || 0) > 0 && (
        <Container className="mb-6 flex flex-col gap-y-4 p-5 rounded-none">
          <p className="text-small-regular">
            {`Hi ${customer.first_name}, would you like to use a saved address?`}
          </p>
          <AddressSelect
            addresses={customer.addresses}
            addressInput={
              mapKeys(formData, (_, key) =>
                key.replace("shipping_address.", "")
              ) as HttpTypes.StoreCartAddress
            }
            onSelect={setFormAddress}
          />
        </Container>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="shipping_address.first_name" className="block text-sm font-medium text-gray-700 mb-1">
            First Name<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="shipping_address.first_name"
            name="shipping_address.first_name"
            autoComplete="given-name"
            value={formData["shipping_address.first_name"]}
            onChange={handleChange}
            onBlur={handleBlur}
            onInvalid={handleInvalid}
            required
            data-testid="shipping-first-name-input"
            className={getRequiredInputClassName(Boolean(errors["shipping_address.first_name"]))}
          />
          {errors["shipping_address.first_name"] && (
            <p className="text-red-500 text-xs mt-1">{errors["shipping_address.first_name"]}</p>
          )}
        </div>
        <div>
          <label htmlFor="shipping_address.last_name" className="block text-sm font-medium text-gray-700 mb-1">
            Last Name<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="shipping_address.last_name"
            name="shipping_address.last_name"
            autoComplete="family-name"
            value={formData["shipping_address.last_name"]}
            onChange={handleChange}
            onBlur={handleBlur}
            onInvalid={handleInvalid}
            required
            data-testid="shipping-last-name-input"
            className={getRequiredInputClassName(Boolean(errors["shipping_address.last_name"]))}
          />
          {errors["shipping_address.last_name"] && (
            <p className="text-red-500 text-xs mt-1">{errors["shipping_address.last_name"]}</p>
          )}
        </div>
        <div>
          <label htmlFor="shipping_address.address_1" className="block text-sm font-medium text-gray-700 mb-1">
            Street Address<span className="text-red-500">*</span>
          </label>
          <AddressAutocomplete
            label=""
            name="shipping_address.address_1"
            autoComplete="address-line1"
            value={formData["shipping_address.address_1"]}
            onChange={handleChange}
            onBlur={handleBlur}
            onAddressSelect={handleAddressSelect}
            countryCodes={countriesInRegion}
            required
            hasError={Boolean(errors["shipping_address.address_1"])}
            data-testid="shipping-address-input"
          />
          {errors["shipping_address.address_1"] && (
            <p className="text-red-500 text-xs mt-1">{errors["shipping_address.address_1"]}</p>
          )}
        </div>
        <div className="flex gap-4">
          <div className="w-2/5">
            <label htmlFor="shipping_address.address_2" className="block text-sm font-medium text-gray-700 mb-1">
              Apt. / Unit #
            </label>
            <input
              type="text"
              id="shipping_address.address_2"
              name="shipping_address.address_2"
              autoComplete="address-line2"
              value={formData["shipping_address.address_2"]}
              onChange={handleChange}
              data-testid="shipping-address-2-input"
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-0 focus:border-black"
            />
          </div>
          <div className="w-3/5">
            <label htmlFor="shipping_address.company" className="block text-sm font-medium text-gray-700 mb-1">
              Company
            </label>
            <input
              type="text"
              id="shipping_address.company"
              name="shipping_address.company"
              value={formData["shipping_address.company"]}
              onChange={handleChange}
              autoComplete="organization"
              data-testid="shipping-company-input"
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-0 focus:border-black"
            />
          </div>
        </div>
        <div>
          <label htmlFor="shipping_address.city" className="block text-sm font-medium text-gray-700 mb-1">
            City<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="shipping_address.city"
            name="shipping_address.city"
            autoComplete="address-level2"
            value={formData["shipping_address.city"]}
            onChange={handleChange}
            onBlur={handleBlur}
            onInvalid={handleInvalid}
            required
            data-testid="shipping-city-input"
            className={getRequiredInputClassName(Boolean(errors["shipping_address.city"]))}
          />
          {errors["shipping_address.city"] && (
            <p className="text-red-500 text-xs mt-1">{errors["shipping_address.city"]}</p>
          )}
        </div>
        <div className="flex gap-4">
          <div className="w-3/5">
            <label htmlFor="shipping_address.province" className="block text-sm font-medium text-gray-700 mb-1">
              State<span className="text-red-500">*</span>
            </label>
            <select
              id="shipping_address.province"
              name="shipping_address.province"
              autoComplete="address-level1"
              value={formData["shipping_address.province"]}
              onChange={handleChange}
              onBlur={handleBlur}
              onInvalid={handleInvalid}
              required
              data-testid="shipping-province-input"
              className={getRequiredInputClassName(Boolean(errors["shipping_address.province"]))}
            >
              <option value="">Select a state</option>
              {US_STATES.map((state) => (
                <option key={state.code} value={`us-${state.code.toLowerCase()}`}>
                  {state.name}
                </option>
              ))}
            </select>
            {errors["shipping_address.province"] && (
              <p className="text-red-500 text-xs mt-1">{errors["shipping_address.province"]}</p>
            )}
          </div>
          <div className="w-2/5">
            <label htmlFor="shipping_address.postal_code" className="block text-sm font-medium text-gray-700 mb-1">
              Zip Code<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="shipping_address.postal_code"
              name="shipping_address.postal_code"
              autoComplete="postal-code"
              value={formData["shipping_address.postal_code"]}
              onChange={handleChange}
              onBlur={handleBlur}
              onInvalid={handleInvalid}
              required
              data-testid="shipping-postal-code-input"
              className={getRequiredInputClassName(Boolean(errors["shipping_address.postal_code"]))}
            />
            {errors["shipping_address.postal_code"] && (
              <p className="text-red-500 text-xs mt-1">{errors["shipping_address.postal_code"]}</p>
            )}
          </div>
        </div>
        <div>
          <label htmlFor="shipping_address.country_code" className="block text-sm font-medium text-gray-700 mb-1">
            Country<span className="text-red-500">*</span>
          </label>
          <select
            id="shipping_address.country_code"
            name="shipping_address.country_code"
            autoComplete="country"
            value={formData["shipping_address.country_code"]}
            onChange={handleChange}
            onBlur={handleBlur}
            onInvalid={handleInvalid}
            required
            data-testid="shipping-country-select"
            className={getRequiredInputClassName(Boolean(errors["shipping_address.country_code"]))}
          >
            <option value="">Select a country</option>
            {cart?.region?.countries?.map((country) => (
              <option key={country.iso_2} value={country.iso_2}>
                {country.display_name}
              </option>
            ))}
          </select>
          {errors["shipping_address.country_code"] && (
            <p className="text-red-500 text-xs mt-1">{errors["shipping_address.country_code"]}</p>
          )}
        </div>
      </div>
      <div className="my-8">
        <Checkbox
          label="Billing address same as shipping address"
          name="same_as_billing"
          checked={checked}
          onChange={onChange}
          data-testid="billing-address-checkbox"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email<span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            title="Enter a valid email address."
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            onInvalid={handleInvalid}
            required
            data-testid="shipping-email-input"
            className={getRequiredInputClassName(Boolean(errors["email"]))}
          />
          {errors["email"] && (
            <p className="text-red-500 text-xs mt-1">{errors["email"]}</p>
          )}
        </div>
        <div className="w-3/5">
          <label htmlFor="shipping_address.phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone<span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="shipping_address.phone"
            name="shipping_address.phone"
            autoComplete="tel"
            value={formData["shipping_address.phone"]}
            onChange={handleChange}
            onBlur={handleBlur}
            onInvalid={handleInvalid}
            required
            data-testid="shipping-phone-input"
            className={getRequiredInputClassName(Boolean(errors["shipping_address.phone"]))}
          />
          {errors["shipping_address.phone"] && (
            <p className="text-red-500 text-xs mt-1">{errors["shipping_address.phone"]}</p>
          )}
        </div>
      </div>
    </>
  )
}

export default ShippingAddress
