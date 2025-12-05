import React from "react"

import UnderlineLink from "@modules/common/components/interactive-link"

import AccountNav from "../components/account-nav"
import { HttpTypes } from "@medusajs/types"

interface AccountLayoutProps {
  customer: HttpTypes.StoreCustomer | null
  children: React.ReactNode
}

const AccountLayout: React.FC<AccountLayoutProps> = ({
  customer,
  children,
}) => {
  return (
    <div className="py-8 relative" data-testid="account-page">
      {/* Fixed left sidebar on xl, mirroring customer-care layout */}
      {customer && (
        <div className="hidden xl:block fixed left-8 top-32 w-48">
          <AccountNav customer={customer} />
        </div>
      )}

      <div className="xl:mx-96 px-4">
        {/* Mobile / tablet nav above content */}
        {customer && (
          <div className="xl:hidden mb-6">
            <AccountNav customer={customer} />
          </div>
        )}

        <div className="max-w-3xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  )
}

export default AccountLayout
