import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { Text, clx } from "@medusajs/ui"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import PrivacyChoicesTrigger from "@modules/common/components/privacy-choices-trigger"

export default async function Footer() {
  const { collections } = await listCollections({
    fields: "*products",
  })
  const productCategories = await listCategories()

  return (
    <footer className="no-border w-full bg-white pt-8 pb-4 mt-5">
      <div className="content-container flex flex-col w-full">
        {/* Top basic links section */}
        <div className="no-border pt-6 pb-1 hidden md:block">
          <nav className="flex flex-nowrap justify-between text-black txt-xsmall uppercase text-center">
            <LocalizedClientLink href="/customer-care/contact-us" className="hover:text-ui-fg-base">
              Customer Care
            </LocalizedClientLink>
            <LocalizedClientLink href="/customer-care/promotions" className="hover:text-ui-fg-base">
              Promotions
            </LocalizedClientLink>
            <LocalizedClientLink href="/customer-care/about-us" className="hover:text-ui-fg-base">
              About Us
            </LocalizedClientLink>
            <LocalizedClientLink href="/partnerships" className="hover:text-ui-fg-base">
              Partnerships
            </LocalizedClientLink>
            <a
              href="https://instagram.com/youcouldbewearingthis"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ui-fg-base"
            >
              Instagram
            </a>
            <a
              href="https://tiktok.com/@youcouldbewearingthis"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ui-fg-base"
            >
              TikTok
            </a>
            <LocalizedClientLink href="/editorial/archive" className="hover:text-ui-fg-base">
              Editorial Archive
            </LocalizedClientLink>
          </nav>
        </div>

        {/* Bottom footer text and copyright on same line with normal case */}
        <div className="flex flex-wrap justify-center items-center text-gray-400 text-xs no-border py-2 mt-0 gap-x-6 gap-y-2">
          <span className="whitespace-nowrap">© 2025 REVETIR</span>
          <LocalizedClientLink href="/terms-conditions" className="hover:text-ui-fg-base">
            Terms & Conditions
          </LocalizedClientLink>
          <LocalizedClientLink href="/privacy-policy" className="hover:text-ui-fg-base">
            Privacy Policy
          </LocalizedClientLink>
          <PrivacyChoicesTrigger className="hover:text-ui-fg-base">
            Your Privacy Choices
          </PrivacyChoicesTrigger>
          <LocalizedClientLink href="/customer-care/accessibility" className="hover:text-ui-fg-base">
            Accessibility
          </LocalizedClientLink>
        </div>
      </div>
    </footer>
  )
}

