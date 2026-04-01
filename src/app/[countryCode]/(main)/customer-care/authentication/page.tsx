import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import AuthenticationCountdown from "./authentication-countdown"

export const metadata: Metadata = {
  title: "Authentication",
  description: "Learn about REVETIR's authentication standards.",
}

export default function AuthenticationPage() {
  return (
    <div className="bg-white text-black">
      <div className="mx-auto w-full max-w-3xl lg:max-w-5xl">
        <section className="border-y border-neutral-300 py-12 lg:py-16">
          <p className="text-[12px] font-medium uppercase text-black">Customer Care</p>
          <h1 className="mt-4 text-[clamp(2rem,5vw,3rem)] font-medium leading-[0.94] tracking-[-0.03em] text-black">
            Authentication
          </h1>
          <p className="mt-6 max-w-2xl text-[0.95rem] leading-relaxed text-neutral-700">
            A new look is coming to this page. Please check back in <AuthenticationCountdown />.
          </p>
          <p className="mt-8 text-sm leading-relaxed text-neutral-700">
            Need immediate assistance?{" "}
            <LocalizedClientLink href="/customer-care/contact-us" className="underline hover:text-black">
              Contact Customer Care
            </LocalizedClientLink>
            .
          </p>
        </section>
      </div>
    </div>
  )
}
