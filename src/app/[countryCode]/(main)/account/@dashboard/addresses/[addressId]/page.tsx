import { Metadata } from "next"
import { notFound } from "next/navigation"

import { retrieveCustomer } from "@lib/data/customer"
import { getRegion } from "@lib/data/regions"
import AddressEditPageForm from "@modules/account/components/address-edit-page-form"

export const metadata: Metadata = {
  title: "Edit Address",
  description: "Edit your saved address.",
}

export default async function EditAddressPage(props: {
  params: Promise<{ countryCode: string; addressId: string }>
}) {
  const params = await props.params
  const { countryCode, addressId } = params

  const customer = await retrieveCustomer()
  const region = await getRegion(countryCode)

  if (!customer || !region) {
    notFound()
  }

  const address = customer.addresses.find((a) => a.id === addressId)

  if (!address) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="edit-address-page-wrapper">
      <div className="mb-3 sm:mb-4">
        <h1 className="text-xl-semi sm:text-2xl-semi">Edit Address</h1>
        <p className="mt-3 text-sm text-gray-700 max-w-2xl">
          Update your saved address details below.
        </p>
      </div>

      <div className="mt-6">
        <AddressEditPageForm address={address} region={region} />
      </div>
    </div>
  )
}
