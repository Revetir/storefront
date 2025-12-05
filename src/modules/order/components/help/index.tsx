import { Heading } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import React from "react"

const Help = () => {
  return (
    <div className="mt-6 text-sm sm:text-base">
      <Heading className="text-base-semi mb-1">Need help?</Heading>
      <p>
        Need help?{" "}
        <LocalizedClientLink
          href="/customer-care/contact-us"
          className="underline"
        >
          Contact Customer Care
        </LocalizedClientLink>
      </p>
    </div>
  )
}

export default Help
