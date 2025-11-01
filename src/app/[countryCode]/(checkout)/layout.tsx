import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full bg-white relative lg:min-h-screen flex flex-col">
      <div className="h-16 bg-white fixed top-0 left-0 right-0 z-50">
        <nav className="flex h-full items-center content-container justify-center">
          <LocalizedClientLink
            href="/"
            className="block"
            data-testid="store-link"
          >
            <Image
              src="/images/logo_transparent.svg"
              alt="REVETIR"
              width={120}
              height={24}
              className="h-6 w-auto"
              priority
            />
          </LocalizedClientLink>
        </nav>
      </div>
      <div className="relative pt-16 flex-1" data-testid="checkout-container">{children}</div>
      <footer className="w-full bg-white py-4 lg:mt-6">
        <div className="flex flex-col items-center gap-y-2">
          <div className="text-black text-xs text-center">
            REVETIR, 2 Park Avenue, 20th Floor, New York, NY 10016
          </div>
          <div className="flex flex-wrap justify-center items-center text-gray-400 text-xs gap-x-4">
            <LocalizedClientLink href="/terms-conditions" className="hover:text-ui-fg-base">
              Terms & Conditions
            </LocalizedClientLink>
            <LocalizedClientLink href="/privacy-policy" className="hover:text-ui-fg-base">
              Privacy Policy
            </LocalizedClientLink>
          </div>
        </div>
      </footer>
    </div>
  )
}
