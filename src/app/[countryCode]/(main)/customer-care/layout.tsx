"use client"

import { usePathname } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const shoppingPages = [
  {
    title: "Ordering",
    href: "/customer-care/ordering",
    description: "How to place orders"
  },
  {
    title: "How to Shop",
    href: "/customer-care/how-to-shop",
    description: "Shopping guide"
  },
  {
    title: "Product Information",
    href: "/customer-care/product-information",
    description: "Product details and specifications"
  },
  {
    title: "Payment Information",
    href: "/customer-care/payment-information",
    description: "Payment methods and security"
  },
  {
    title: "Shipping & Handling",
    href: "/customer-care/shipping",
    description: "Shipping options and policies"
  },
  {
    title: "Return Policy",
    href: "/customer-care/return-policy",
    description: "Returns and exchanges"
  },
  {
    title: "Promotions",
    href: "/customer-care/promotions",
    description: "Current promotions and special offers"
  }
]

const customerCarePages = [
  {
    title: "Contact Us",
    href: "/customer-care/contact-us",
    description: "Send us a message"
  },
  {
    title: "FAQ",
    href: "/customer-care/faq",
    description: "Frequently asked questions"
  },
  {
    title: "Account Management",
    href: "/customer-care/account-management",
    description: "Account management"
  },
  {
    title: "Accessibility",
    href: "/customer-care/accessibility",
    description: "Our commitment to accessibility"
  }
]

const revetirPages = [
  {
    title: "About Us",
    href: "/customer-care/about-us",
    description: "Learn about Revetir"
  },
  {
    title: "Editorial Archive",
    href: "/editorial/archive",
    description: "Browse our editorial content"
  },
  {
    title: "Partnerships",
    href: "/partnerships",
    description: "Partner with us"
  }
]

export default function CustomerCareLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const renderNavSection = (pages: typeof shoppingPages, title: string) => (
    <div className="mb-6">
      <h3 className="text-md font-semibold mb-3 text-gray-800">{title}</h3>
      <nav className="space-y-1">
        {pages.map((page) => {
          const isActive = pathname.endsWith(page.href)
          return (
            <LocalizedClientLink
              key={page.href}
              href={page.href}
              className={`block text-sm transition-colors ${
                isActive
                  ? "font-bold underline text-black"
                  : "text-gray-700 hover:text-black"
              }`}
            >
              {page.title}
            </LocalizedClientLink>
          )
        })}
      </nav>
    </div>
  )

  return (
    <div className="py-8 relative">
      {/* Left Sidebar - Navigation */}
      <div className="hidden lg:block fixed left-8 top-32 w-48">
        {renderNavSection(customerCarePages, "Help")}
        {renderNavSection(shoppingPages, "Shopping")}
        {renderNavSection(revetirPages, "REVETIR")}
      </div>

      {/* Right Sidebar - Contact Information */}
      <div className="hidden lg:block fixed right-8 top-32 w-48">
        <h3 className="text-lg font-semibold mb-4">Customer Care</h3>
        <div className="space-y-1 text-sm">
          <div>
            <span className="font-medium">Email:</span> support@revetir.com
          </div>
            <div>
              <span className="italic">Monday to Saturday, 9 AM to 11 PM (EST)</span>
            </div>
            <div>
            <span className="font-medium">Live Chat:</span> <em>Coming Soon</em>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:mx-96 px-4 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  )
} 