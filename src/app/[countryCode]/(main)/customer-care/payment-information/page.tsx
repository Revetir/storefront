import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Payment Information",
  description: "Learn about payment methods and security on REVETIR.",
}

export default function PaymentInformationPage() {
  return (
    <div className="content-container py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Payment Information</h1>

        <div className="prose prose-lg max-w-none">
          <h2 className="text-2xl font-bold mb-6 mt-8">Pricing and Currency</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            Item prices may vary depending on the country and region the order is being shipped to, as well as the
            currency item prices are in. In order to ensure the most accurate pricing, including taxes and delivery
            fees, while browsing, please ensure your desired shipping country is properly selected.
          </p>

          <h2 className="text-2xl font-bold mb-6 mt-8">Payment Method</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            We accept PayPal checkout options, including PayPal wallet payments, eligible funding methods shown by
            PayPal at checkout, and direct credit/debit card payments processed through PayPal secure card fields. All
            card transactions are handled through encrypted payment gateways that meet industry standards for data
            protection and security.
          </p>

          <p className="text-gray-600 leading-relaxed mb-6">
            Available payment methods can vary by region, device, and customer eligibility. PayPal automatically
            displays eligible local and wallet options during checkout.
          </p>

          <p className="text-gray-600 leading-relaxed mb-6">
            Please note: only one method of payment will be accepted per transaction.
          </p>

          <h2 className="text-2xl font-bold mb-6 mt-8">Payment Security</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            Your payment security is our top priority. Payment transactions are processed through PayPal and associated
            secure payment infrastructure. REVETIR does not store full card details and receives only the payment
            results needed to complete your order.
          </p>

          <p className="text-gray-600 leading-relaxed">
            We also apply anti-fraud controls and payment risk checks to help prevent abuse. REVETIR takes payment
            disputes very seriously; please contact us as soon as possible if you believe there to be an issue with
            your payment.
          </p>
        </div>
      </div>
    </div>
  )
}
