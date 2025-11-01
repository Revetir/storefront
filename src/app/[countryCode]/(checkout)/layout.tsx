import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full bg-white relative lg:min-h-screen">
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
      <div className="relative pt-16" data-testid="checkout-container">{children}</div>
    </div>
  )
}
