import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Payment Information | Revetir",
  description: "Learn about payment methods and security on Revetir.",
}

export default function PaymentInformationPage() {
  return (
    <div className="content-container py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Payment Information</h1>
        
        <div className="prose prose-lg max-w-none">
          <h2 className="text-2xl font-bold mb-6 mt-8">Pricing and Currency</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
          Item prices may vary depending on the country and region the order is being shipped to, as well as the currency item prices are in.
          In order to ensure the most accurate pricing, including taxes and delivery fees, while browsing, please ensure your desired shipping country is properly selected.
          </p>
          
          <h2 className="text-2xl font-bold mb-6 mt-8">Payment Method</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
          We accept a wide variety of payment methods through Stripe, including major credit and debit cards (Visa, Mastercard, American Express, Discover), digital wallets like Apple Pay and Google Pay, and buy now, pay later through Klarna. All credit card transactions are processed through secure, encrypted payment gateways that meet industry standards for data protection and security.
          </p>
          
          <p className="text-gray-600 leading-relaxed mb-6">
            For customers in certain regions, we may also offer local payment methods such as digital wallets and bank transfers. These options are displayed during checkout by Stripe based on your location and provide secure, convenient payment alternatives.
          </p>
          
          <p className="text-gray-600 leading-relaxed mb-6">
          Please note: only one method of payment will be accepted per transaction.
          </p>

          <h2 className="text-2xl font-bold mb-6 mt-8">Payment Security</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
          Your payment security is our top priority. All transactions on our site are processed through Stripe, a certified PCI Service Provider Level 1—the most stringent level of certification available in the payments industry. Revetir never sees any sensitive payment information, only that payment has been made — Stripe directly handles your sensitive information, using advanced encryption and secure tokenization to ensure your card information is always secure.
          </p>
          
          <p className="text-gray-600 leading-relaxed">
            We also employ anti-fraud prevention measures through Stripe Radar to prevent payment fraud and abuse. Revetir takes payment disputes very seriously — please contact us as soon as possible if you believe there to be an issue with your payment. 
          </p>
        </div>
      </div>
    </div>
  )
} 