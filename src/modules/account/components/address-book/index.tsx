import React from "react"

import AddAddress from "../address-card/add-address"
import EditAddress from "../address-card/edit-address-modal"
import { HttpTypes } from "@medusajs/types"

type AddressBookProps = {
  customer: HttpTypes.StoreCustomer
  region: HttpTypes.StoreRegion
}

const AddressBook: React.FC<AddressBookProps> = ({ customer, region }) => {
  const { addresses } = customer
  return (
    <div className="w-full">
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-8 flex-1">
        {addresses.map((address) => {
          return (
            <EditAddress region={region} address={address} key={address.id} />
          )
        })}
      </div>

      <div className="mt-10">
        <AddAddress region={region} addresses={addresses} />
      </div>
    </div>
  )
}

export default AddressBook
