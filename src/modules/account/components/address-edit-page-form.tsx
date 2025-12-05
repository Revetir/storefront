"use client"

import { useState, useEffect, useActionState } from "react"
import { useRouter } from "next/navigation"

import Input from "@modules/common/components/input"
import CountrySelect from "@modules/checkout/components/country-select"
import Checkbox from "@modules/common/components/checkbox"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { US_STATES } from "@modules/checkout/utils/us-states"
import { HttpTypes } from "@medusajs/types"
import { updateCustomerAddress } from "@lib/data/customer"

type Props = {
  address: HttpTypes.StoreCustomerAddress
  region: HttpTypes.StoreRegion
}

const AddressEditPageForm = ({ address, region }: Props) => {
  const router = useRouter()

  const [isDefaultBilling, setIsDefaultBilling] = useState(
    !!address.is_default_billing
  )
  const [isDefaultShipping, setIsDefaultShipping] = useState(
    !!address.is_default_shipping
  )

  const [formState, formAction] = useActionState(updateCustomerAddress, {
    success: false,
    error: null,
    addressId: address.id,
  })

  useEffect(() => {
    if (formState.success) {
      router.push("/account/addresses")
    }
  }, [formState.success, router])

  const handleCancel = () => {
    router.back()
  }

  return (
    <form
      action={formAction}
      className="w-full max-w-2xl"
      data-testid="edit-address-form"
    >
      <input type="hidden" name="addressId" value={address.id} />

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="First name"
            name="first_name"
            required
            autoComplete="given-name"
            defaultValue={address.first_name || undefined}
            data-testid="first-name-input"
          />
          <Input
            label="Last name"
            name="last_name"
            required
            autoComplete="family-name"
            defaultValue={address.last_name || undefined}
            data-testid="last-name-input"
          />
        </div>

        <Input
          label="Company"
          name="company"
          autoComplete="organization"
          defaultValue={address.company || undefined}
          data-testid="company-input"
        />

        <Input
          label="Street Address"
          name="address_1"
          required
          autoComplete="address-line1"
          defaultValue={address.address_1 || undefined}
          data-testid="address-1-input"
        />

        <Input
          label="Apartment, suite, etc."
          name="address_2"
          autoComplete="address-line2"
          defaultValue={address.address_2 || undefined}
          data-testid="address-2-input"
        />

        <Input
          label="City"
          name="city"
          required
          autoComplete="locality"
          defaultValue={address.city || undefined}
          data-testid="city-input"
        />

        <div className="grid grid-cols-[1fr_144px] gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <select
              name="province"
              defaultValue={address.province || ""}
              autoComplete="address-level1"
              data-testid="state-input"
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="">Select a state</option>
              {US_STATES.map((state) => (
                <option
                  key={state.code}
                  value={`us-${state.code.toLowerCase()}`}
                >
                  {state.name}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Zip Code"
            name="postal_code"
            required
            autoComplete="postal-code"
            defaultValue={address.postal_code || undefined}
            data-testid="postal-code-input"
          />
        </div>

        <CountrySelect
          name="country_code"
          region={region}
          required
          autoComplete="country"
          defaultValue={address.country_code || undefined}
          data-testid="country-select"
        />

        <Input
          label="Phone"
          name="phone"
          autoComplete="phone"
          defaultValue={address.phone || undefined}
          data-testid="phone-input"
        />

        <div className="mt-4 space-y-2">
          <Checkbox
            label="Set as default billing address"
            name="is_default_billing"
            checked={isDefaultBilling}
            onChange={() => setIsDefaultBilling((prev) => !prev)}
            data-testid="default-billing-checkbox"
          />
          <Checkbox
            label="Set as default shipping address"
            name="is_default_shipping"
            checked={isDefaultShipping}
            onChange={() => setIsDefaultShipping((prev) => !prev)}
            data-testid="default-shipping-checkbox"
          />
          <input
            type="hidden"
            name="is_default_billing_value"
            value={isDefaultBilling ? "true" : "false"}
          />
          <input
            type="hidden"
            name="is_default_shipping_value"
            value={isDefaultShipping ? "true" : "false"}
          />
        </div>

        {formState.error && (
          <div className="text-xs text-red-600" data-testid="edit-address-error">
            {String(formState.error)}
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <button
          type="button"
          onClick={handleCancel}
          className="min-w-[160px] px-10 py-3 text-xs tracking-[0.15em] uppercase border border-black bg-white text-black"
        >
          Cancel
        </button>
        <SubmitButton className="min-w-[160px] px-10 py-3 text-xs tracking-[0.15em] uppercase bg-black text-white">
          Save
        </SubmitButton>
      </div>
    </form>
  )
}

export default AddressEditPageForm
