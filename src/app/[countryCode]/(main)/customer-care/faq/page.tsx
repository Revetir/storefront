"use client"

import { useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ChevronDown from "@modules/common/icons/chevron-down"

interface FAQItem {
  question: string
  answer: string | React.ReactNode
}

interface FAQCategory {
  title: string
  items: FAQItem[]
}

const faqData: FAQCategory[] = [
  {
    title: "",
    items: [
      {
        question: "Are your products authentic?",
        answer: (
          <>
            All items sold by REVETIR are sourced directly from brands or trusted vendors. You can read about our authentication process{" "}
            <LocalizedClientLink href="/customer-care/authentication" className="text-gray-900 hover:text-black font-semibold underline">
              here
            </LocalizedClientLink>.
          </>
        )
      },
      {
        question: "Why are your prices different from other retailers?",
        answer:
          "Our inventory is aggregated from a wide network of partners and global marketplaces, allowing us to surface the most competitive pricing for each item. While pricing may vary, every item is held to consistent quality and verification standards."
      },
      {
        question: "Do you have customer reviews?",
        answer: (
          <>
            You can find independent customer reviews on Trustpilot{" "}
            <a
              href="https://www.trustpilot.com/review/www.revetir.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-900 hover:text-black font-semibold underline"
            >
              here
            </a>
            .
          </>
        )
      },
      {
        question: "Are your items new or pre-owned?",
        answer: "Our selection includes new and pre-owned items in pristine condition."
      },
      {
        question: "Can I request more item photos or details?",
        answer: (
          <>
            Yes, we would be happy to provide more precise information about any of our items — please contact us{" "}
            <LocalizedClientLink href="/customer-care/contact-us" className="text-gray-900 hover:text-black font-semibold underline">
              here
            </LocalizedClientLink>.
          </>
        )
      },
      {
        question: "Can I request an item that isn't listed?",
        answer: (
          <>
            Yes — if you're looking for a specific item that isn't currently listed, feel free to contact us{" "}
            <LocalizedClientLink href="/customer-care/contact-us" className="text-gray-900 hover:text-black font-semibold underline">
              here
            </LocalizedClientLink>{" "}
            with details and we will check availability across our network.
          </>
        )
      },
      {
        question: "When will I receive my order?",
        answer:
          "Most orders arrive within 2-3 weeks from the time they are placed. Once your order has been shipped, you will receive an e-mail with your shipment's tracking information, allowing you to monitor the progress of your delivery."
      },
      {
        question: "Why hasn't my order shipped yet?",
        answer: (
          <>
            Orders may take time to prepare before shipment, as fulfillment can vary depending on the items in your order. For detailed status updates, feel free to contact us with your order number{" "}
            <LocalizedClientLink href="/customer-care/contact-us" className="text-gray-900 hover:text-black font-semibold underline">
              here
            </LocalizedClientLink>{" "}
            at any time.
          </>
        )
      },
      {
        question: "Where will my order ship from?",
        answer:
          "Orders may ship directly from a partner vendor or one of our international distribution centers, depending on where items in your order are held. Whenever possible, we aim to reduce our global footprint by prioritizing fulfillment from the nearest available inventory location to minimize distance and transit time."
      },
      {
        question: "Will I have to pay duties or import fees?",
        answer: "No, we ship all orders on a Delivery Duties Paid (DDP) basis, meaning you will never pay anything in addition to your order total."
      },
      {
        question: "Do you offer free returns?",
        answer: (
          <>
            Yes, we offer free returns on most orders within 7 days of delivery for items in their original condition and packaging. For more information, please consult our return policy{" "}
            <LocalizedClientLink href="/customer-care/return-policy" className="text-gray-900 hover:text-black font-semibold underline">
              here
            </LocalizedClientLink>.
          </>
        )
      },
      {
        question: "What if I receive a damaged or incorrect item?",
        answer: (
          <>
            If there is an issue with any items you receive, please contact us{" "}
            <LocalizedClientLink href="/customer-care/contact-us" className="text-gray-900 hover:text-black font-semibold underline">
              here
            </LocalizedClientLink>{" "}
            to request a free return. We will review the issue promptly and arrange a replacement or full refund at no cost to you.
          </>
        )
      },
      {
        question: "When will I receive my refund?",
        answer:
          "Once we receive your return and confirm items are in their original state, we issue your refund immediately. Refunds are processed through Stripe back to your original payment method and can take anywhere from 5-10 business days, depending on your bank."
      },
      {
        question: "Can I modify or cancel my order after placing it?",
        answer: (
          <>
            Orders may be modified or canceled before they are processed for shipment. Please contact us{" "}
            <LocalizedClientLink href="/customer-care/contact-us" className="text-gray-900 hover:text-black font-semibold underline">
              here
            </LocalizedClientLink>{" "}
            as soon as possible with your request.
          </>
        )
      },
      {
        question: "What payment methods do you accept?",
        answer:
          "We offer a wide variety of payment methods through Stripe, including major credit and debit cards (Visa, Mastercard, American Express, Discover), digital wallets like Apple Pay and Google Pay, and buy now, pay later through Afterpay and Klarna."
      },
      {
        question: "Do I need to make an account to place an order?",
        answer:
          "No, all you need is an email and phone number to place and receive updates for your order. To checkout faster, easily view and manage orders online, and gain access to exclusive discounts and sales, we recommend creating a REVETIR account."
      },
      {
        question: "Do you offer loyalty programs or incentives?",
        answer: (
          <>
            We periodically offer promotions and incentives to our customers. You can visit our promotions page{" "}
            <LocalizedClientLink href="/customer-care/promotions" className="text-gray-900 hover:text-black font-semibold underline">
              here
            </LocalizedClientLink>{" "}
            for current offers, and returning customers may receive access to select, limited releases over time.
          </>
        )
      },
      {
        question: "Can I delete my account?",
        answer: (
          <>
            Yes, though we're sorry to see you go - please contact us{" "}
            <LocalizedClientLink href="/customer-care/contact-us" className="text-gray-900 hover:text-black font-semibold underline">
              here
            </LocalizedClientLink>.
          </>
        )
      }
    ]
  }
]
export default function FAQPage() {
  const [openItem, setOpenItem] = useState<string | null>(null)
  const flattenedItems = faqData.flatMap((category) => category.items)

  const toggleItem = (itemKey: string) => {
    setOpenItem((currentOpenItem) => (currentOpenItem === itemKey ? null : itemKey))
  }

  return (
    <div className="bg-white text-black">
      <div className="mx-auto w-full max-w-3xl lg:max-w-5xl">
        <div className="lg:grid lg:grid-cols-12 lg:gap-16 xl:gap-20">
          <header className="flex flex-col items-center pb-10 text-center lg:col-span-5 lg:items-start lg:py-16 lg:text-left">
            <p className="text-[12px] font-medium uppercase text-black">FAQ</p>
            <h1 className="mt-4 max-w-[16ch] text-[clamp(2.15rem,7vw,3.25rem)] font-medium leading-[0.94] tracking-[-0.03em] text-black lg:mt-6">
              Answers to our most frequently asked questions
            </h1>

            <div className="mt-10 hidden w-full border-t border-neutral-300 pt-4 text-sm leading-relaxed text-neutral-700 lg:block">
              Need more help?{" "}
              <LocalizedClientLink href="/customer-care/contact-us" className="underline hover:text-black">
                Contact Customer Care
              </LocalizedClientLink>
            </div>
          </header>

          <section aria-label="Frequently asked questions" className="border-t border-neutral-300 lg:col-span-7 lg:border-t-0 lg:py-16">
            <div className="border-y border-neutral-300">
              {flattenedItems.map((item, itemIndex) => {
                const itemKey = `faq-item-${itemIndex}`
                const answerId = `${itemKey}-answer`
                const isOpen = openItem === itemKey

                return (
                  <div key={itemKey} className="border-b border-neutral-300 last:border-b-0">
                    <button
                      type="button"
                      onClick={() => toggleItem(itemKey)}
                      aria-expanded={isOpen}
                      aria-controls={answerId}
                      className="group flex w-full items-start justify-between gap-6 px-0 py-6 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black focus-visible:ring-offset-2"
                    >
                      <h2 className="pr-2 text-[clamp(1.2rem,2.2vw,1.8rem)] font-medium leading-[1.02] tracking-[-0.02em] text-black">
                        {item.question}
                      </h2>
                      <ChevronDown
                        size={18}
                        className={`mt-1 shrink-0 text-neutral-700 transition-transform duration-300 ease-out motion-reduce:transition-none ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <div
                      id={answerId}
                      aria-hidden={!isOpen}
                      className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out motion-reduce:transition-none ${
                        isOpen ? "max-h-[48rem] opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="pb-6 pr-8 text-[0.94rem] leading-relaxed text-neutral-700">{item.answer}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <div className="mt-8 w-full text-center text-sm leading-relaxed text-neutral-700 lg:hidden">
            Need more help?{" "}
            <LocalizedClientLink href="/customer-care/contact-us" className="underline hover:text-black">
              Contact Customer Care
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </div>
  )
} 
