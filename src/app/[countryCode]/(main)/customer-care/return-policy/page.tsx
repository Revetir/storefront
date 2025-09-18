import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Return Policy",
  description: "Learn about returns and exchanges on REVETIR.",
}

export default function ReturnPolicyPage() {
  return (
    <div className="content-container py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Return Policy</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 leading-relaxed mb-6">
            REVETIR offers <strong>free returns</strong> for most orders.* The following criteria must be met for a return:
          </p>
          <p className="text-gray-600 leading-relaxed mb-8">
            <strong>Return window:</strong> The return must be requested within 7 calendar days of the delivery date.
            <br></br>
            <strong>Original condition:</strong> The item must be in original condition and cannot be used, altered, washed, marked, or damaged.
            <br></br>
            <strong>Original packaging:</strong> The item must be returned with all original packaging intact, which may include the shoe box, dust bag(s), brand tag(s) and authenticity card. All packaging cannot be altered, damaged, or removed.
          </p>
           
          <p className="text-gray-600 leading-relaxed mb-6">
            <em>*Final Sale items and expedited shipping fees are not eligible for return/refund.</em>
          </p>
          
          <p className="text-gray-600 leading-relaxed mb-6">
            The following item categories are subject to additional return restrictions:
          </p>

          <p className="text-gray-600 leading-relaxed mb-6">
            <strong>Face masks:</strong> In the interest of hygiene, face masks and face coverings are considered Final Sale.
            <br></br>
            <strong>Intimate apparel and swimwear:</strong> Lingerie, hosiery, underwear, swimsuits, and bikini bottoms cannot be worn and must be returned with the original hygienic protection sticker still intact to be eligible for a refund.
          </p>
          
                    <p className="text-gray-600 leading-relaxed mb-6">
           REVETIR reserves the right to reject any returning products that do not comply with the above stated Return Policy. Rejected items may be held for payment of a reshipment fee to be sent back to the original shipping address without any refund being processed. In order to avoid this, please contact our Customer Care team to address any issues or concerns you have regarding the item(s) you wish to return.
          </p>

          <h2 className="text-xl font-semibold mb-6">Exchanges</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            REVETIR does not offer direct exchanges. We ask that you return the merchandise for a full refund and place a new order for the preferred item(s).
          </p>
          
          <h2 className="text-xl font-semibold mb-6">Damaged/Defective Goods</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            If you believe an item is defective or damaged, please contact Customer Care.
          </p>
          
          <h2 className="text-2xl font-semibold mb-6">Initiating Returns</h2>

          <p className="text-gray-600 leading-relaxed mb-6">
            To initiate a return, please submit a return request on the Order Details page through your REVETIR account. Once approved, a prepaid return label will be sent to the e-mail adress associated with the order. Alternatively, you can contact our Customer Care team to assist you with the return process.
          </p>

          <p className="text-gray-600 leading-relaxed mb-6">
            If you placed your order as a Guest, please directly contact our Customer Care team for assistance.
          </p>

          <p className="text-gray-600 leading-relaxed mb-6">
          <em>Please note that multiple orders cannot be returned with a single return request; any orders shipped separately should be returned separately, unless otherwise instructed.</em>
          </p>

          {/* <p className="text-gray-600 leading-relaxed mb-6">
            Please follow this step-by-step guide to initiating a return request:
          </p> */}
          <h2 className="text-2xl font-semibold mb-6">Receiving Refunds</h2>

                    <p className="text-gray-600 leading-relaxed mb-6">
           Once we receive your return and confirm items are in their original state, REVETIR will issue your refund immediately. 
           Refunds are processed through Stripe and can take anywhere from 5-10 business days, depending on your bank. 
          </p>
          
          <p className="text-gray-600 leading-relaxed mb-6">
          In the event the returned merchandise does not meet our quality standards and is rejected, a member of our Customer Care team will contact you by e-mail with supporting evidence outlining the return policy violation and any available options.
          </p>
                    
        </div>
      </div>
    </div>
  )
} 