import { Metadata } from "next"
import { notFound } from "next/navigation"

import { retrieveCustomer } from "@lib/data/customer"
import { getRegion } from "@lib/data/regions"
import AddressEditPageForm from "@modules/account/components/address-edit-page-form"

export const metadata: Metadata = {
  title: "Addresses",
  description: "View and edit your addresses.",
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
      <AddressEditPageForm address={address} region={region} />
    </div>
  )
}
