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
    default: "REVETIR - Curated Luxury Fashion",
    template: "%s | REVETIR"
  },
  description: "Discover luxury fashion and independent Asian designers. Free shipping & returns in the US.",
  keywords: ["luxury fashion", "Asian designers", "independent fashion", "curated fashion", "REVETIR"],
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
    title: "REVETIR - Curated Luxury Fashion",
    description: "Discover luxury fashion and independent Asian designers. Free shipping & returns in the US.",
    images: [
      {
        url: "/images/open_graph_image.png",
        width: 1200,
        height: 630,
        alt: "REVETIR - Curated Luxury Fashion",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@revetir",
    creator: "@revetir",
    title: "REVETIR - Curated Luxury Fashion",
    description: "Discover luxury fashion and independent Asian designers. Free shipping & returns in the US.",
    images: ["/images/open_graph_image.png"],
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
