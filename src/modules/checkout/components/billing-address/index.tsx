import { HttpTypes } from "@medusajs/types"
import React, { useEffect, useMemo, useState, useCallback } from "react"
import AddressAutocomplete, {
  RadarAddress,
} from "../address-autocomplete"
import { US_STATES } from "../../utils/us-states"
import { setAddresses } from "@lib/data/cart"
import { debounce } from "lodash"

const BillingAddress = ({ cart }: { cart: HttpTypes.StoreCart | null }) => {
  const [formData, setFormData] = useState<any>({
    "billing_address.first_name": cart?.billing_address?.first_name || "",
    "billing_address.last_name": cart?.billing_address?.last_name || "",
    "billing_address.address_1": cart?.billing_address?.address_1 || "",
    "billing_address.address_2": cart?.billing_address?.address_2 || "",
    "billing_address.company": cart?.billing_address?.company || "",
    "billing_address.postal_code": cart?.billing_address?.postal_code || "",
    "billing_address.city": cart?.billing_address?.city || "",
    "billing_address.country_code": cart?.billing_address?.country_code || "",
    "billing_address.province": cart?.billing_address?.province || "",
    "billing_address.phone": cart?.billing_address?.phone || "",
  })

  const [hasUserEdited, setHasUserEdited] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const countriesInRegion = useMemo(
    () => cart?.region?.countries?.map((c) => c.iso_2).filter((code): code is string => !!code),
    [cart?.region]
  )

  // Debug logging to track formData changes
  useEffect(() => {
    console.log("BillingAddress - formData updated:", formData)
  }, [formData])

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLInputElement | HTMLSelectElement
    >
  ) => {
    setHasUserEdited(true)
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: "" }))
    }
  }

  const handleInvalid = (e: React.FormEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.preventDefault()
    const target = e.target as HTMLInputElement | HTMLSelectElement

    const fieldName = target.name.replace("billing_address.", "")
    const label = fieldName.replace("_", " ")
    setErrors(prev => ({ ...prev, [target.name]: `Please enter your ${label}` }))
  }

  // Auto-save address data on blur with debounce
  const debouncedSaveAddress = useCallback(
    debounce(async (data: Record<string, any>) => {
      try {
        // Create FormData to match the setAddresses server action signature
        const formDataObj = new FormData()

        Object.keys(data).forEach(key => {
          if (data[key]) {
            formDataObj.append(key, data[key])
          }
        })

        // Auto-save to cart (silently, don't block user)
        await setAddresses(null, formDataObj)
      } catch (error) {
        // Silent error - don't interrupt user flow
        console.error("Auto-save billing address failed:", error)
      }
    }, 500),
    []
  )

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    // Trigger auto-save on blur
    debouncedSaveAddress(formData)
  }

  const handleAddressSelect = (address: RadarAddress) => {
    console.log("BillingAddress - handleAddressSelect called with:", address)

    setHasUserEdited(true)

    // Transform state code to Medusa format: {countryCode}-{stateCode}
    const countryCode = address.countryCode?.toLowerCase() || ""
    const stateCode = address.stateCode?.toLowerCase() || ""
    const provinceValue = countryCode && stateCode ? `${countryCode}-${stateCode}` : ""

    const updatedFields = {
      "billing_address.address_1": `${address.number || ""} ${
        address.street || ""
      }`.trim(),
      "billing_address.address_2": address.unit || "",
      "billing_address.city": address.city || "",
      "billing_address.province": provinceValue,
      "billing_address.postal_code": address.postalCode || "",
      "billing_address.country_code": countryCode,
    }

    console.log("BillingAddress - updating form fields:", JSON.stringify(updatedFields, null, 2))

    // Force a new object reference to ensure React detects the change
    setFormData((prevState: any) => {
      const newState = {
        ...prevState,
        ...updatedFields,
      }
      console.log("BillingAddress - new formData state:", JSON.stringify(newState, null, 2))
      return newState
    })
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="billing_address.first_name" className="block text-sm font-medium text-gray-700 mb-1">
            First Name<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="billing_address.first_name"
            name="billing_address.first_name"
            autoComplete="given-name"
            value={formData["billing_address.first_name"]}
            onChange={handleChange}
            onBlur={handleBlur}
            onInvalid={handleInvalid}
            required
            data-testid="billing-first-name-input"
            className={`w-full px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
              errors["billing_address.first_name"] ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors["billing_address.first_name"] && (
            <p className="text-red-500 text-xs mt-1">{errors["billing_address.first_name"]}</p>
          )}
        </div>
        <div>
          <label htmlFor="billing_address.last_name" className="block text-sm font-medium text-gray-700 mb-1">
            Last Name<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="billing_address.last_name"
            name="billing_address.last_name"
            autoComplete="family-name"
            value={formData["billing_address.last_name"]}
            onChange={handleChange}
            onBlur={handleBlur}
            onInvalid={handleInvalid}
            required
            data-testid="billing-last-name-input"
            className={`w-full px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
              errors["billing_address.last_name"] ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors["billing_address.last_name"] && (
            <p className="text-red-500 text-xs mt-1">{errors["billing_address.last_name"]}</p>
          )}
        </div>
        <div>
          <label htmlFor="billing_address.address_1" className="block text-sm font-medium text-gray-700 mb-1">
            Street Address<span className="text-red-500">*</span>
          </label>
          <div className={errors["billing_address.address_1"] ? 'border-red-500 border' : ''}>
            <AddressAutocomplete
              label=""
              name="billing_address.address_1"
              autoComplete="address-line1"
              value={formData["billing_address.address_1"]}
              onChange={handleChange}
              onAddressSelect={handleAddressSelect}
              countryCodes={countriesInRegion}
              required
              data-testid="billing-address-input"
            />
          </div>
          {errors["billing_address.address_1"] && (
            <p className="text-red-500 text-xs mt-1">{errors["billing_address.address_1"]}</p>
          )}
        </div>
        <div className="flex gap-4">
          <div className="w-2/5">
            <label htmlFor="billing_address.address_2" className="block text-sm font-medium text-gray-700 mb-1">
              Apt. / Unit #
            </label>
            <input
              type="text"
              id="billing_address.address_2"
              name="billing_address.address_2"
              autoComplete="address-line2"
              value={formData["billing_address.address_2"]}
              onChange={handleChange}
              onBlur={handleBlur}
              data-testid="billing-address-2-input"
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
          <div className="w-3/5">
            <label htmlFor="billing_address.company" className="block text-sm font-medium text-gray-700 mb-1">
              Company
            </label>
            <input
              type="text"
              id="billing_address.company"
              name="billing_address.company"
              value={formData["billing_address.company"]}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="organization"
              data-testid="billing-company-input"
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
        </div>
        <div>
          <label htmlFor="billing_address.city" className="block text-sm font-medium text-gray-700 mb-1">
            City<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="billing_address.city"
            name="billing_address.city"
            autoComplete="address-level2"
            value={formData["billing_address.city"]}
            onChange={handleChange}
            onBlur={handleBlur}
            onInvalid={handleInvalid}
            required
            data-testid="billing-city-input"
            className={`w-full px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
              errors["billing_address.city"] ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors["billing_address.city"] && (
            <p className="text-red-500 text-xs mt-1">{errors["billing_address.city"]}</p>
          )}
        </div>
        <div className="flex gap-4">
          <div className="w-3/5">
            <label htmlFor="billing_address.province" className="block text-sm font-medium text-gray-700 mb-1">
              State<span className="text-red-500">*</span>
            </label>
            <select
              id="billing_address.province"
              name="billing_address.province"
              autoComplete="address-level1"
              value={formData["billing_address.province"]}
              onChange={handleChange}
              onBlur={handleBlur}
              onInvalid={handleInvalid}
              required
              data-testid="billing-province-input"
              className={`w-full px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                errors["billing_address.province"] ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a state</option>
              {US_STATES.map((state) => (
                <option key={state.code} value={`us-${state.code.toLowerCase()}`}>
                  {state.name}
                </option>
              ))}
            </select>
            {errors["billing_address.province"] && (
              <p className="text-red-500 text-xs mt-1">{errors["billing_address.province"]}</p>
            )}
          </div>
          <div className="w-2/5">
            <label htmlFor="billing_address.postal_code" className="block text-sm font-medium text-gray-700 mb-1">
              Zip Code<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="billing_address.postal_code"
              name="billing_address.postal_code"
              autoComplete="postal-code"
              value={formData["billing_address.postal_code"]}
              onChange={handleChange}
              onBlur={handleBlur}
              onInvalid={handleInvalid}
              required
              data-testid="billing-postal-input"
              className={`w-full px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                errors["billing_address.postal_code"] ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors["billing_address.postal_code"] && (
              <p className="text-red-500 text-xs mt-1">{errors["billing_address.postal_code"]}</p>
            )}
          </div>
        </div>
        <div>
          <label htmlFor="billing_address.country_code" className="block text-sm font-medium text-gray-700 mb-1">
            Country<span className="text-red-500">*</span>
          </label>
          <select
            id="billing_address.country_code"
            name="billing_address.country_code"
            autoComplete="country"
            value={formData["billing_address.country_code"]}
            onChange={handleChange}
            onBlur={handleBlur}
            onInvalid={handleInvalid}
            required
            data-testid="billing-country-select"
            className={`w-full px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
              errors["billing_address.country_code"] ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select a country</option>
            {cart?.region?.countries?.map((country) => (
              <option key={country.iso_2} value={country.iso_2}>
                {country.display_name}
              </option>
            ))}
          </select>
          {errors["billing_address.country_code"] && (
            <p className="text-red-500 text-xs mt-1">{errors["billing_address.country_code"]}</p>
          )}
        </div>
        <div className="w-3/5">
          <label htmlFor="billing_address.phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="tel"
            id="billing_address.phone"
            name="billing_address.phone"
            autoComplete="tel"
            value={formData["billing_address.phone"]}
            onChange={handleChange}
            onBlur={handleBlur}
            data-testid="billing-phone-input"
            className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>
      </div>
    </>
  )
}

export default BillingAddress
