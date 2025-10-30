import { HttpTypes } from "@medusajs/types"
import Input from "@modules/common/components/input"
import React, { useEffect, useMemo, useState } from "react"
import CountrySelect from "../country-select"
import AddressAutocomplete, {
  RadarAddress,
} from "../address-autocomplete"

const BillingAddress = ({ cart }: { cart: HttpTypes.StoreCart | null }) => {
  const [formData, setFormData] = useState<any>({
    "billing_address.first_name": cart?.billing_address?.first_name || "",
    "billing_address.last_name": cart?.billing_address?.last_name || "",
    "billing_address.address_1": cart?.billing_address?.address_1 || "",
    "billing_address.company": cart?.billing_address?.company || "",
    "billing_address.postal_code": cart?.billing_address?.postal_code || "",
    "billing_address.city": cart?.billing_address?.city || "",
    "billing_address.country_code": cart?.billing_address?.country_code || "",
    "billing_address.province": cart?.billing_address?.province || "",
    "billing_address.phone": cart?.billing_address?.phone || "",
  })

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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleAddressSelect = (address: RadarAddress) => {
    console.log("BillingAddress - handleAddressSelect called with:", address)

    const updatedFields = {
      "billing_address.address_1": `${address.number || ""} ${
        address.street || ""
      }${address.unit ? " " + address.unit : ""}`.trim(),
      "billing_address.city": address.city || "",
      "billing_address.province":
        address.stateCode || address.state || "",
      "billing_address.postal_code": address.postalCode || "",
      "billing_address.country_code":
        address.countryCode?.toLowerCase() || "",
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
        <Input
          label="First name"
          name="billing_address.first_name"
          autoComplete="given-name"
          value={formData["billing_address.first_name"]}
          onChange={handleChange}
          required
          data-testid="billing-first-name-input"
        />
        <Input
          label="Last name"
          name="billing_address.last_name"
          autoComplete="family-name"
          value={formData["billing_address.last_name"]}
          onChange={handleChange}
          required
          data-testid="billing-last-name-input"
        />
        <AddressAutocomplete
          label="Address"
          name="billing_address.address_1"
          autoComplete="address-line1"
          value={formData["billing_address.address_1"]}
          onChange={handleChange}
          onAddressSelect={handleAddressSelect}
          countryCodes={countriesInRegion}
          required
          data-testid="billing-address-input"
        />
        <Input
          label="Company"
          name="billing_address.company"
          value={formData["billing_address.company"]}
          onChange={handleChange}
          autoComplete="organization"
          data-testid="billing-company-input"
        />
        <Input
          label="City"
          name="billing_address.city"
          autoComplete="address-level2"
          value={formData["billing_address.city"]}
          onChange={handleChange}
          required
          data-testid="billing-city-input"
        />
        <div className="w-3/5">
          <Input
            label="Postal code"
            name="billing_address.postal_code"
            autoComplete="postal-code"
            value={formData["billing_address.postal_code"]}
            onChange={handleChange}
            required
            data-testid="billing-postal-input"
          />
        </div>
        <CountrySelect
          name="billing_address.country_code"
          autoComplete="country"
          region={cart?.region}
          value={formData["billing_address.country_code"]}
          onChange={handleChange}
          required
          data-testid="billing-country-select"
        />
        <div className="w-3/5">
          <Input
            label="State / Province"
            name="billing_address.province"
            autoComplete="address-level1"
            value={formData["billing_address.province"]}
            onChange={handleChange}
            data-testid="billing-province-input"
          />
        </div>
        <div className="w-3/5">
          <Input
            label="Phone"
            name="billing_address.phone"
            autoComplete="tel"
            value={formData["billing_address.phone"]}
            onChange={handleChange}
            data-testid="billing-phone-input"
          />
        </div>
      </div>
    </>
  )
}

export default BillingAddress
