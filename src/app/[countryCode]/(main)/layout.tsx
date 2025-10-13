import { Metadata } from "next"
import dynamic from "next/dynamic"

import { listCartOptions, retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { getBaseURL } from "@lib/util/env"
import { StoreCartShippingOption } from "@medusajs/types"
import { PrivacyChoicesProvider } from "@lib/context/privacy-choices-context"
import Nav from "@modules/layout/templates/nav"
import ScrollToTopOnRoute from "@modules/common/components/scroll-to-top-on-route"

// Dynamic imports for components that aren't immediately critical
const CartMismatchBanner = dynamic(() => import("@modules/layout/components/cart-mismatch-banner"))
const Footer = dynamic(() => import("@modules/layout/templates/footer"))
const FreeShippingPriceNudge = dynamic(() => import("@modules/shipping/components/free-shipping-price-nudge"))

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: {
    default: "Luxury Fashion & Independent Designers",
    template: "%s | REVETIR"
  },
  description: "Discover curated designer fashion from luxury brands and emerging labels. Shop clothing, shoes, and accessories on sale with free U.S. shipping and returns.",
  authors: [{ name: "REVETIR" }],
  creator: "REVETIR",
  publisher: "REVETIR",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://revetir.com",
    siteName: "REVETIR",
    title: "REVETIR — Designer Clothing, Shoes and Accessories",
    description: "Discover curated designer fashion from luxury brands and emerging labels. Shop clothing, shoes, and accessories on sale with free U.S. shipping and returns.",
  },
  twitter: {
    card: "summary_large_image",
    site: "@revetir",
    creator: "@revetir",
    title: "Luxury Fashion & Independent Designers",
    description: "Discover curated designer fashion from luxury brands and emerging labels. Shop clothing, shoes, and accessories on sale with free U.S. shipping and returns.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default async function PageLayout(props: { children: React.ReactNode }) {
  const customer = await retrieveCustomer()
  const cart = await retrieveCart()
  let shippingOptions: StoreCartShippingOption[] = []

  if (cart) {
    const { shipping_options } = await listCartOptions()

    shippingOptions = shipping_options
  }

  return (
    <PrivacyChoicesProvider>
      <div className="min-h-screen flex flex-col">
        <Nav />
        <ScrollToTopOnRoute />
        {customer && cart && (
          <CartMismatchBanner customer={customer} cart={cart} />
        )}

        {cart && (
          <FreeShippingPriceNudge
            variant="popup"
            cart={cart}
            shippingOptions={shippingOptions}
          />
        )}
        <main className="flex-1">
          {props.children}
        </main>
        <Footer />
      </div>
    </PrivacyChoicesProvider>
  )
}
