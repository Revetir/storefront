"use client"

import React, { useEffect, useState, useActionState } from "react"
import { PencilSquare as Edit, Trash } from "@medusajs/icons"
import { Button, Heading, Text, clx } from "@medusajs/ui"

import useToggleState from "@lib/hooks/use-toggle-state"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CountrySelect from "@modules/checkout/components/country-select"
import Input from "@modules/common/components/input"
import Modal from "@modules/common/components/modal"
import Checkbox from "@modules/common/components/checkbox"
import { US_STATES } from "../../../checkout/utils/us-states"
import Spinner from "@modules/common/icons/spinner"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { HttpTypes } from "@medusajs/types"
import {
  deleteCustomerAddress,
  updateCustomerAddress,
} from "@lib/data/customer"

type EditAddressProps = {
  region: HttpTypes.StoreRegion
  address: HttpTypes.StoreCustomerAddress
  isActive?: boolean
}

const EditAddress: React.FC<EditAddressProps> = ({
  region,
  address,
  isActive = false,
}) => {
  const [removing, setRemoving] = useState(false)
  const [successState, setSuccessState] = useState(false)
  const { state, open, close: closeModal } = useToggleState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

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

  const close = () => {
    setSuccessState(false)
    closeModal()
  }

  useEffect(() => {
    if (successState) {
      close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [successState])

  useEffect(() => {
    if (formState.success) {
      setSuccessState(true)
    }
  }, [formState])

  const removeAddress = async () => {
    setRemoving(true)
    await deleteCustomerAddress(address.id)
    setRemoving(false)
    setIsDeleteOpen(false)
  }

  return (
    <>
      <div
        className={clx(
          "flex flex-col items-start text-sm leading-relaxed",
          {
            "font-semibold": isActive,
          }
        )}
        data-testid="address-container"
      >
        <div className="whitespace-pre-line text-center sm:text-left">
          <div className="font-semibold" data-testid="address-name">
            {address.first_name} {address.last_name}
          </div>
          {address.company && (
            <div className="" data-testid="address-company">
              {address.company}
            </div>
          )}
          <div data-testid="address-address">
            {address.address_1}
          </div>
          {address.address_2 && (
            <div>{address.address_2}</div>
          )}
          <div data-testid="address-postal-city">
            {address.city}, {address.province} {address.postal_code}
          </div>
          <div data-testid="address-province-country">
            {address.country_code?.toUpperCase()}
          </div>
          {address.phone && (
            <div className="mt-1">{address.phone}</div>
          )}
        </div>
        <div className="mt-3 flex gap-4 text-xs">
          <LocalizedClientLink
            href={`/account/addresses/${address.id}`}
            className="text-xs tracking-[0.15em] uppercase text-black hover:underline"
            data-testid="address-edit-button"
          >
            Edit
          </LocalizedClientLink>
          <button
            type="button"
            className="text-xs tracking-[0.15em] uppercase text-black hover:underline"
            onClick={() => setIsDeleteOpen(true)}
            data-testid="address-delete-button"
          >
            Delete
          </button>
        </div>
      </div>

      <Modal isOpen={state} close={close} data-testid="edit-address-modal">
        <Modal.Title>
          <Heading className="mb-2">Edit address</Heading>
        </Modal.Title>
        <form action={formAction}>
          <input type="hidden" name="addressId" value={address.id} />
          <Modal.Body>
            <div className="grid grid-cols-1 gap-y-2">
              <div className="grid grid-cols-2 gap-x-2">
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
                label="Address"
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
              <div className="grid grid-cols-[1fr_144px] gap-x-2">
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
            </div>
            {formState.error && (
              <div className="text-rose-500 text-small-regular py-2">
                {formState.error}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <div className="flex gap-3 mt-6">
              <Button
                type="reset"
                variant="secondary"
                onClick={close}
                className="h-10"
                data-testid="cancel-button"
              >
                Cancel
              </Button>
              <SubmitButton data-testid="save-button">Save</SubmitButton>
            </div>
          </Modal.Footer>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteOpen}
        close={() => setIsDeleteOpen(false)}
        size="large"
        panelClassName="lg:max-w-md lg:h-auto lg:max-h-none"
        data-testid="delete-address-modal"
      >
        <Modal.Body>
          <div className="relative flex flex-col w-full h-full">
            {/* Desktop X close button */}
            <button
              type="button"
              onClick={() => setIsDeleteOpen(false)}
              className="hidden sm:flex absolute right-5 top-5 text-black"
            >
              ×
            </button>
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 text-center gap-4">
              <div className="text-sm leading-relaxed whitespace-pre-line">
                <div className="font-semibold">
                  {address.first_name} {address.last_name}
                </div>
                {address.company && <div>{address.company}</div>}
                <div>{address.address_1}</div>
                {address.address_2 && <div>{address.address_2}</div>}
                <div>
                  {address.city}, {address.province} {address.postal_code}
                </div>
                <div>{address.country_code?.toUpperCase()}</div>
                {address.phone && <div className="mt-1">{address.phone}</div>}
              </div>

              <div className="mt-4 space-y-2 max-w-sm w-full">
                <p className="text-sm">Are you sure you want to delete this address?</p>
                <p className="text-xs text-gray-600">This action cannot be reverted.</p>
              </div>

              <div className="mt-4 w-full max-w-sm">
                <button
                  type="button"
                  onClick={removeAddress}
                  disabled={removing}
                  className="w-full px-10 py-3 text-xs tracking-[0.15em] uppercase bg-black text-white"
                >
                  {removing ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsDeleteOpen(false)}
              className="block w-full border-t border-gray-200 px-6 py-4 text-xs tracking-[0.15em] uppercase bg-white text-black sm:hidden"
            >
              Cancel
            </button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  )
}

export default EditAddress
