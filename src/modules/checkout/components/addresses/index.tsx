"use client"

import compareAddresses from "@lib/util/compare-addresses"
import { HttpTypes } from "@medusajs/types"
import { Heading, useToggleState } from "@medusajs/ui"
import Divider from "@modules/common/components/divider"
import BillingAddress from "../billing_address"
import ShippingAddress from "../shipping-address"

const Addresses = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  const { state: sameAsBilling, toggle: toggleSameAsBilling } = useToggleState(
    cart?.shipping_address && cart?.billing_address
      ? compareAddresses(cart?.shipping_address, cart?.billing_address)
      : true
  )

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-4">
        <Heading
          level="h2"
          className="flex flex-row text-xl gap-x-2 items-baseline uppercase"
        >
          Shipping Address
        </Heading>
      </div>
      <Divider className="mb-6" />
      <div className="pb-8">
        <ShippingAddress
          customer={customer}
          checked={sameAsBilling}
          onChange={toggleSameAsBilling}
          cart={cart}
        />

        {!sameAsBilling && (
          <div>
            <Heading
              level="h2"
              className="text-xl gap-x-4 pb-4 pt-8 uppercase"
            >
              Billing address
            </Heading>
            <Divider className="mb-6" />

            <BillingAddress cart={cart} />
          </div>
        )}
      </div>
    </div>
  )
}

export default Addresses
