import { Metadata } from "next"

import { listCartOptions, retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { getBaseURL } from "@lib/util/env"
import { StoreCartShippingOption } from "@medusajs/types"
import { PrivacyChoicesProvider } from "@lib/context/privacy-choices-context"
import CartMismatchBanner from "@modules/layout/components/cart-mismatch-banner"
import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"
import FreeShippingPriceNudge from "@modules/shipping/components/free-shipping-price-nudge"
import ScrollToTopOnRoute from "@modules/common/components/scroll-to-top-on-route"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: {
    default: "Luxury Fashion & Independent Designers",
    template: "%s | REVETIR"
  },
  description: "Discover curated designer clothing, shoes and accessories for men and women on sale. Free shipping & returns in the US.",
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
    description: "Discover curated designer fashion for men and women on sale. Free shipping & returns in the US.",
  },
  twitter: {
    card: "summary_large_image",
    site: "@revetir",
    creator: "@revetir",
    title: "Luxury Fashion & Independent Designers",
    description: "Discover curated designer fashion for men and women on sale. Free shipping & returns in the US.",
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
