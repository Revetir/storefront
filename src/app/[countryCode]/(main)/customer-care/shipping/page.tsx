import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Shipping & Handling",
  description: "Learn about shipping options and policies on REVETIR.",
}

export default function ShippingPage() {
  return (
    <div className="content-container py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Shipping Information</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 leading-relaxed mb-6">
            Once your order has been shipped, you will receive an e-mail with your shipment's tracking information, allowing you to monitor the progress of your delivery.
          </p>
          
          <p className="text-gray-600 leading-relaxed mb-6">
            <em>Please allow up to one (1) business day for tracking information to be provided after your order is shipped.</em>
          </p>
          
          <p className="text-gray-600 leading-relaxed mb-8">
            You will become the owner of the goods that you have ordered once they have been delivered to your specified delivery address. At this point, the goods become your responsibility and REVETIR no longer has any responsibility for taking care of the goods from that point.
          </p>

          <h2 className="text-2xl font-semibold mb-6">Shipping Methods and Costs</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            REVETIR is pleased to offer <strong>free standard shipping</strong> on most orders.*
          </p>
          <p className="text-gray-600 leading-relaxed mb-8">
            Shipping options tailored to your selected items and delivery location will be presented at checkout, allowing you to choose your preferred shipping method. Our current options include:
          </p>
          <p className="text-gray-600 leading-relaxed mb-8">
            <strong>Standard Shipping:</strong> 10-15 days from order placement to delivery**
            <br></br>
            <strong>Expedited Shipping:</strong> 5-10 days from order placement to delivery**
          </p>
          <p className="text-gray-600 leading-relaxed mb-8">
            <em>*Some oversized or specialty items may incur additional shipping charges, which will be clearly displayed at checkout</em>
            <br></br>
            <em>**All shipments are subject to customs delays, in which case packages could be held for up to an additional 14 days</em>
          </p>
          <h2 className="text-2xl font-semibold mb-6">Duties and Taxes</h2>
          
          <p className="text-gray-600 leading-relaxed mb-6">
            By placing an order with REVETIR, you acknowledge that this sale is fulfilled by merchants outside the United States, and that you are importing your order for non-commercial (personal) use. You also acknowledge that you will be listed as the importer for US Customs and Border Protection purposes and that your order will be imported into the United States in accordance with the necessary customs requirements.
          </p>
          
          <p className="text-gray-600 leading-relaxed mb-6">
            To simplify this process, your order indicates your agreement to authorize REVETIR to appoint a designated carrier/customs broker, where applicable, as your unpaid agent for customs purposes by executing a power of attorney applicable to a single non-commercial shipment. Your order serves as an electronic signature indicating your agreement to the following, as required by US Customs and Border Protection:
          </p>
          
          <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-700 mb-6">
            "The designated carrier/customs broker is hereby authorized to execute, as an unpaid agent who has knowledge of the facts, pursuant to the provisions of section 485(f), Tariff Act of 1930, as amended, the consignee's and owner's declarations provided for in section 485 (a) and (d), Tariff Act of 1930, as amended, and to enter on my behalf or for my account the goods described in the attached invoice which contains a true and complete statement of the facts concerning the shipment."
          </blockquote>
          
          <p className="text-gray-600 leading-relaxed mb-6">
            Your authorization permits the carrier/customs broker to file on your behalf: (i) an administrative entry under section 321 of the Tariff Act of 1930 ("Section 321"), if eligible (see below); (2) an informal entry pursuant to section 143.21 of the Customs Regulations, if eligible; or (iii) the formal entry for any order that is over $2,500, or otherwise requires formal entry. <strong>Prices shown by REVETIR are inclusive of any U.S. duties and taxes that may be due under U.S. law, and are prepaid by REVETIR upon shipment.</strong>
          </p>      

        </div>
      </div>
    </div>
  )
} 