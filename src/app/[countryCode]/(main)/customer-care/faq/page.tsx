"use client"

import { useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

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
        answer: "We offer a wide variety of payment methods through Stripe, including major credit and debit cards (Visa, Mastercard, American Express, Discover), digital wallets like Apple Pay and Google Pay, and buy now, pay later through Klarna."
      },
      {
        question: "Do I need to make an account to place an order?",
        answer: "No, all you need is an email to place and receive updates for your order. To checkout faster, easily view and manage orders online, and gain access to exclusive discounts and sales, we recommend creating a Revetir account."
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
            Yes, we offer free returns on most orders within 7 days of delivery for items in their original condition and packaging. For more information, consult our return policy{" "}
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
            We understand that every body is unique and 'standard' sizes can vary drastically. As a general guide, we recommend following our sizing information available{" "}
            <LocalizedClientLink href="/customer-care/product-information" className="text-gray-900 hover:text-black font-semibold underline">
              here
            </LocalizedClientLink>{" "}
            or contacting us{" "}
            <LocalizedClientLink href="/customer-care/contact-us" className="text-gray-900 hover:text-black font-semibold underline">
              here
            </LocalizedClientLink>{" "}
            for any product's specific measurements.
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
              You can reach our customer care team via email at support@revetir.com or through our contact form{" "}
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
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())

  const toggleItem = (categoryIndex: number, itemIndex: number) => {
    const key = `${categoryIndex}-${itemIndex}`
    const newOpenItems = new Set(openItems)
    
    if (newOpenItems.has(key)) {
      newOpenItems.delete(key)
    } else {
      newOpenItems.add(key)
    }
    
    setOpenItems(newOpenItems)
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-10">Frequently Asked Questions</h1>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {faqData.map((category, categoryIndex) => (
            <div key={categoryIndex} id={`category-${categoryIndex}`}>
              <h2 className="text-2xl font-semibold mb-6 text-gray-900 border-b border-gray-200 pb-2">
                {category.title}
              </h2>
              
              <div className="space-y-4">
                {category.items.map((item, itemIndex) => {
                  const key = `${categoryIndex}-${itemIndex}`
                  const isOpen = openItems.has(key)
                  
                  return (
                    <div
                      key={itemIndex}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => toggleItem(categoryIndex, itemIndex)}
                        className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-inset transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium text-gray-900 pr-4">
                            {item.question}
                          </h3>
                          <svg
                            className={`w-5 h-5 text-gray-500 transform transition-transform ${
                              isOpen ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </button>
                      
                      {isOpen && (
                        <div className="px-6 pb-4 bg-gray-50">
                          <p className="text-gray-700 leading-relaxed">
                            {item.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
    </>
  )
} 