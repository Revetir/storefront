"use client"

import { useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import PrivacyChoicesTrigger from "@modules/common/components/privacy-choices-trigger"
import Divider from "@modules/common/components/divider"
import NewsletterSignup from "@modules/common/components/newsletter-signup"
import SocialIcons from "@modules/common/components/social-icons"
import { trackSocialClick } from "@lib/util/analytics"

export default function Footer() {
  const [isNewsletterModalOpen, setIsNewsletterModalOpen] = useState(false)

  return (
    <footer className="no-border w-full bg-white pt-4 pb-4">
      <div className="content-container flex flex-col w-full">
        {/* Top basic links section */}
        <div className="no-border pt-6 pb-1 hidden lg:block">
          <nav className="flex flex-nowrap justify-between lg:flex-wrap lg:justify-center lg:gap-x-9 gap-y-4 text-black txt-xsmall uppercase text-center">
            <LocalizedClientLink href="/customer-care/contact-us" className="hover:text-ui-fg-base">
              Customer Care
            </LocalizedClientLink>
            <LocalizedClientLink href="/customer-care/promotions" className="hover:text-ui-fg-base">
              Promotions
            </LocalizedClientLink>
            <LocalizedClientLink href="/customer-care/about-us" className="hover:text-ui-fg-base">
              About Us
            </LocalizedClientLink>
            <button
              onClick={() => setIsNewsletterModalOpen(true)}
              className="hover:text-ui-fg-base cursor-pointer"
            >
              EMAIL SIGNUP
            </button>
            <LocalizedClientLink href="/partnerships" className="hover:text-ui-fg-base">
              Partnerships
            </LocalizedClientLink>
            <a
              href="https://instagram.com/shoprevetir"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ui-fg-base"
              onClick={() => trackSocialClick({ platform: 'instagram' })}
            >
              Instagram
            </a>
            <a
              href="https://tiktok.com/@shoprevetir"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ui-fg-base"
              onClick={() => trackSocialClick({ platform: 'tiktok' })}
            >
              TikTok
            </a>
            <LocalizedClientLink href="/editorial/archive" className="hover:text-ui-fg-base">
              Editorial Archive
            </LocalizedClientLink>
          </nav>
        </div>

        {/* Newsletter modal - desktop only */}
        <NewsletterSignup
          variant="modal"
          isOpen={isNewsletterModalOpen}
          close={() => setIsNewsletterModalOpen(false)}
        />

        {/* Divider above email signup and footer group - mobile only */}
        <Divider className="mt-6 mb-3 lg:hidden" />

        {/* Newsletter signup - mobile only, inline version */}
        <div className="lg:hidden">
          <NewsletterSignup variant="inline" />
        </div>

        {/* Social media icons - mobile only */}
        <div className="lg:hidden pb-3">
          <SocialIcons />
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
