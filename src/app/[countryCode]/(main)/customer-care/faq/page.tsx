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
    title: "Orders & Shipping",
    items: [
      {
        question: "What payment methods do you accept?",
        answer: "We offer a wide variety of payment methods through Stripe, including major credit and debit cards (Visa, Mastercard, American Express, Discover), digital wallets like Apple Pay and Google Pay, and buy now, pay later through Klarna, Affirm, and Afterpay."
      },
      {
        question: "Do I need to make an account to place an order?",
        answer: "No, all you need is an email to place and receive updates for your order. To checkout faster, easily view and manage orders online, and gain access to exclusive discounts and sales, we recommend creating a REVETIR account."
      },
      {
        question: "Can I cancel or modify my order?",
        answer: (
          <>
            Modifying or canceling an order is possible so long as the merchandise has not yet entered the processing or shipment phase, usually within 3 hours after placing the order — contact us{" "}
            <LocalizedClientLink href="/customer-care/contact-us" className="text-gray-900 hover:text-black font-semibold underline">
              here
            </LocalizedClientLink>{" "}
            as soon as possible.
          </>
        )
      },
      {
        question: "What are your shipping options?",
        answer: "We offer complimentary standard shipping (10-15 days*) on most orders and express shipping (5-10 days*) for an additional charge. *Shipping times are subject to customs delays"
      },
      {
        question: "When will I receive my order?",
        answer: "Once your order has been shipped, you will receive an e-mail with with your shipment’s tracking information, allowing you to monitor the progress of your delivery."
      },
      {
        question: "Will I need to pay duties and taxes?",
        answer: "No, we ship all orders on a Delivery Duties Paid (DDP) basis, meaning you will never pay anything in addition to your order total."
      }
    ]
  },
  {
    title: "Returns & Refunds",
    items: [
      {
        question: "Do you accept returns?",
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
        question: "How long will it take to process my refund?",
        answer: "Once we receive your return and confirm items are in their original state, we issue your refund immediately. Refunds are processed through Stripe and can take anywhere from 5-10 business days, depending on your bank."
      },
      {
        question: "What items can't be returned?",
        answer: "Face masks and items marked as final sale cannot be returned. Swimwear and undergarments must have the hygiene seal intact."
      }
    ]
  },
  {
    title: "Product Information",
    items: [
      {
        question: "How do I find the right size?",
        answer: (
          <>
            Item-specific measurements can be found by clicking the Size Guide link on each product page. If measurements aren't listed or you would like additional guidance, please contact us{" "}
            <LocalizedClientLink href="/customer-care/contact-us" className="text-gray-900 hover:text-black font-semibold underline">
              here
            </LocalizedClientLink>. You can also refer to our general size chart{" "}
            <LocalizedClientLink href="/customer-care/product-information" className="text-gray-900 hover:text-black font-semibold underline">
              here
            </LocalizedClientLink>{" "}
            for standardized sizing guidelines across categories.
          </>
        )
      },
      {
        question: "Are your products authentic?",
        answer: "Our offering is expertly curated and directly supplied by brands, department stores, and manufacturers — all our items are guaranteed authentic or your money back. "
      },
      {
        question: "Can I request more product photos or details?",
        answer: (
          <>
            Yes, we would be happy to provide more precise information about any of our products — please contact us{" "}
            <LocalizedClientLink href="/customer-care/contact-us" className="text-gray-900 hover:text-black font-semibold underline">
              here.
            </LocalizedClientLink>{" "}
          </>
        )
      },
      {
        question: "How do I care for my products?",
        answer: (
          <>
            Specific care instructions for your product can be found on the product's interior care label or inside the packaging in the care manual, while general care guidelines for all products can be found{" "}
            <LocalizedClientLink href="/customer-care/product-information" className="text-gray-900 hover:text-black font-semibold underline">
              here
            </LocalizedClientLink>.
          </>
        )
      }
    ]
  },
  {
    title: "Account & Rewards",
    items: [
      {
        question: "How do I create an account?",
        answer: "You can create an account during checkout or by clicking 'Log In' in the top navigation. You'll need to provide your email address and create a password."
      },
      {
        question: "What are the benefits of having an account?",
        answer: "Members can check out faster, easily view and manage orders online, and gain access to exclusive discounts and sales."
      },
      {
        question: "How do I reset my password?",
        answer: "The functionality to reset your password will be available very soon."
      },
      {
        question: "Can I delete my account?",
        answer: (
          <>
            Yes, though we're sorry to see you go — please contact us{" "}
            <LocalizedClientLink href="/customer-care/product-information" className="text-gray-900 hover:text-black font-semibold underline">
              here
            </LocalizedClientLink>.
          </>
        )
      },
      {
        question: "Do you give discounts?",
        answer: (
          <>
            Please visit our promotions page{" "}
            <LocalizedClientLink href="/customer-care/promotions" className="text-gray-900 hover:text-black font-semibold underline">
              here
            </LocalizedClientLink>{" "}
            for our latest (member-only) promotions.
          </>
        )
      }
    ]
  },
  {
    title: "Customer Service",
    items: [
              {
          question: "How can I contact customer service?",
          answer: (
            <>
              You can reach our customer care team via email at care@revetir.com or through our contact form{" "}
              <LocalizedClientLink href="/customer-care/contact-us" className="text-gray-900 hover:text-black font-semibold underline">
                here
              </LocalizedClientLink>. We're available Monday-Saturday, 9AM-11PM EST.
            </>
          )
        },
      {
        question: "When can I expect a response to my inquiry?",
        answer: "We typically respond to all inquiries within minutes, though certain requests may take up to 48 hours for a response."
      },
      {
        question: "Where can I find reviews from your customers?",
        answer: (
          <>
            We're on TrustPilot! Click{" "}
            <a 
              href="https://www.trustpilot.com/review/www.revetir.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-900 hover:text-black font-semibold underline"
            >
              here
            </a>{" "}
            to see what our customers are saying.
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
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-black">FAQ</p>
            <h1 className="mt-4 max-w-[16ch] text-[clamp(2.15rem,7vw,3.25rem)] font-medium leading-[0.94] tracking-[-0.03em] text-black lg:mt-6">
              Answers to our most frequently asked questions
            </h1>

            <div className="mt-10 hidden w-full border-t border-neutral-300 pt-4 text-sm leading-relaxed text-neutral-700 lg:block">
              Need help beyond the FAQ?{" "}
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
            Need help beyond the FAQ?{" "}
            <LocalizedClientLink href="/customer-care/contact-us" className="underline hover:text-black">
              Contact Customer Care
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </div>
  )
} 
