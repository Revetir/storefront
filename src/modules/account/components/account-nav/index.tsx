"use client"

import { clx } from "@medusajs/ui"
import { useParams, usePathname } from "next/navigation"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import { signout } from "@lib/data/customer"

const AccountNav = ({
  customer,
}: {
  customer: HttpTypes.StoreCustomer | null
}) => {
  const route = usePathname()
  const { countryCode } = useParams() as { countryCode: string }

  const handleLogout = async () => {
    await signout(countryCode)
  }

  return (
    <div data-testid="account-nav">
      <div>
        <div className="mb-3">
          <h3 className="text-medium font-semibold text-gray-800">Account</h3>
        </div>
        <nav className="text-base-regular">
          <ul className="space-y-1">
            <li>
              <AccountNavLink
                href="/account/orders"
                route={route!}
                data-testid="overview-link"
              >
                Order History
              </AccountNavLink>
            </li>
            <li>
              <AccountNavLink
                href="/account/details"
                route={route!}
                data-testid="profile-link"
              >
                Account Details
              </AccountNavLink>
            </li>
            <li>
              <AccountNavLink
                href="/account/addresses"
                route={route!}
                data-testid="addresses-link"
              >
                Addresses
              </AccountNavLink>
            </li>
            <li>
              <button
                type="button"
                onClick={handleLogout}
                data-testid="logout-button"
                className={clx(
                  "block text-sm transition-colors w-full text-left",
                  "text-gray-700 hover:text-black hover:underline"
                )}
              >
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}

type AccountNavLinkProps = {
  href: string
  route: string
  children: React.ReactNode
  "data-testid"?: string
}

const AccountNavLink = ({
  href,
  route,
  children,
  "data-testid": dataTestId,
}: AccountNavLinkProps) => {
  const { countryCode }: { countryCode: string } = useParams()

  const pathAfterCountry = route.split(countryCode)[1] || ""
  const isBaseMatch = pathAfterCountry === href
  const isNestedMatch = pathAfterCountry.startsWith(`${href}/`)
  const active = isBaseMatch || isNestedMatch
  return (
    <LocalizedClientLink
      href={href}
      className={clx(
        "block text-sm transition-colors",
        active
          ? "font-bold underline text-black hover:underline"
          : "text-gray-700 hover:text-black hover:underline"
      )}
      data-testid={dataTestId}
    >
      {children}
    </LocalizedClientLink>
  )
}

export default AccountNav
