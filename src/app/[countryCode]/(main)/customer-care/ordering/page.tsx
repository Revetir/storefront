import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Ordering | REVETIR",
  description: "Learn how to place orders on REVETIR.",
}

export default function OrderingPage() {
  return (
    <div className="content-container py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Placing an Order</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 leading-relaxed mb-6">
            You can either create an account or proceed using our guest checkout.
          </p>
          
          <p className="text-gray-600 leading-relaxed mb-6">
            Creating an account provides you with the ability to:
          </p>
          
          <ul className="list-disc pl-6 mb-6 text-gray-600 leading-relaxed">
          <li>Keep track of current orders and view previous purchases</li>
          <li>Request a return directly from your account</li>
          <li>Place orders with greater ease; all of your billing and shipping information is kept on file</li>
                        <li>Use exclusive promotional codes for members only</li>
          </ul>
          
          <p className="text-gray-600 leading-relaxed mb-6">
            All orders are subject to acceptance and availability. By placing an order, you agree that you are at least 18 years old, that all details you provide to REVETIR are true and accurate, that you are an authorized user of the method of payment used to place your order and that there are sufficient funds in your method of payment to cover the cost of the order.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4 mt-8">Order Confirmation</h2>
          
          <p className="text-gray-600 leading-relaxed mb-6">
            Once your order has been placed, we will confirm receipt of your order by sending acknowledgment to the e-mail address provided at checkout. The order confirmation acts as an invoice and includes your order number and all relevant details.
          </p>
          
          <p className="text-gray-600 leading-relaxed mb-6">
            Please note that this is not an acceptance of your order, but a confirmation that it has been received only.
          </p>
          
          <p className="text-gray-600 leading-relaxed mb-6">
                         When we dispatch your goods, we will send a confirmation to your e-mail address which will be our acceptance of your order creating a legally binding sales contract between you and REVETIR subject to and in accordance with our <LocalizedClientLink href="/terms-conditions" className="hover:text-black hover:underline">Terms & Conditions</LocalizedClientLink>. If we dispatch your goods separately, we may send you a confirmation, and there will be a separate contract, for each. If your order is cancelled for any reasons, including if we cannot accept your order, then any payment you made for ordered goods will be refunded and there will be no contract between you and REVETIR.
          </p>
          
          <p className="text-gray-600 leading-relaxed mb-6">
                         Please note that at all times, we reserve the right to limit quantities per order and/or customer, as well as cancel any orders at our sole discretion as set forth in our <LocalizedClientLink href="/terms-conditions" className="hover:text-black hover:underline">Terms & Conditions</LocalizedClientLink>.
          </p>
          
          <p className="text-gray-600 leading-relaxed mb-6">
            If you have received your order confirmation and have any concerns, please contact us and we will be happy to help you make modifications where and to the extent possible.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4 mt-8">Order Processing</h2>
          
          <p className="text-gray-600 leading-relaxed mb-6 font-bold">
            Once your order is placed, a standard processing time of up to 5 business days is required before the order is shipped out.
          </p>
          
          <p className="text-gray-600 leading-relaxed mb-6">
            Orders placed before 6:00 PM (Eastern Time) begin processing that day, and orders placed on weekends and holidays begin processing the following business day starting at 8:00 AM (Eastern Time).
          </p>
          
          <h2 className="text-2xl font-semibold mb-4 mt-8">Modifying or Cancelling Your Order</h2>
          
          <p className="text-gray-600 leading-relaxed mb-6">
            Modifying or canceling an order is possible so long as the merchandise has not yet entered the processing or shipment phase, usually within 3 hours after placing the order, or as otherwise permitted by applicable consumer protection laws.
          </p>
          
          <p className="text-gray-600 leading-relaxed mb-6">
                         To modify or cancel your order, please <LocalizedClientLink href="/customer-care/contact-us" className="hover:text-black hover:underline">contact our customer care team</LocalizedClientLink> as soon as possible.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4 mt-8">Checking Your Order Status</h2>
          
          <p className="text-gray-600 leading-relaxed mb-6">
            To verify an order's status:
          </p>
          
          <ol className="list-decimal pl-6 mb-6 text-gray-600 leading-relaxed">
            <li>Log in to your REVETIR account.</li>
            <li>Click on the Orders tab on the left-hand side and see details for the relevant order.</li>
            <li>Next to Status, the order will be marked as either Placed, Processing or Shipped.</li>
          </ol>
          
          <p className="text-gray-600 leading-relaxed mb-6">
            Please note: the status of your order will be updated throughout your order's progress.
          </p>
          
          <p className="text-gray-600 leading-relaxed mb-4">
            Here are the definitions of each stage*:
          </p>
          
          <ul className="list-disc pl-6 mb-6 text-gray-600 leading-relaxed">
            <li><strong>Received:</strong> You have successfully placed an order and it will be processed soon.</li>
            <li><strong>Processing:</strong> Your payment has been verified, and your order will be packed and prepared for shipment as soon as possible.</li>
            <li><strong>Shipped:</strong> We have packaged your order and it has been assigned a tracking number. From this point on, you will be able to see your package's progress as it makes its way to you.</li>
          </ul>
          
          <p className="text-gray-600 leading-relaxed mb-6">
            *Orders with multiple items may have a 'partial' status for items processed separately
          </p>
        </div>
      </div>
    </div>
  )
} 