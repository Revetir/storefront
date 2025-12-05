import { Metadata } from "next"
import { notFound } from "next/navigation"
import { retrieveCustomer } from "@lib/data/customer"
import AccountDetailsForm from "@modules/account/components/account-details-form"

export const metadata: Metadata = {
  title: "Account Details",
  description: "View and edit your account details.",
}

export default async function AccountDetailsPage() {
  const customer = await retrieveCustomer()

  if (!customer) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="account-details-page-wrapper">
      <div className="mb-3 sm:mb-4">
        <h1 className="text-xl-semi sm:text-2xl-semi">Account Details</h1>
      </div>

      <div className="mt-4">
        <AccountDetailsForm customer={customer} />
      </div>
    </div>
  )
}
