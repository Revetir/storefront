import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "How to Shop",
  description: "Learn how to shop effectively on REVETIR.",
}

export default function HowToShopPage() {
  return (
    <div className="content-container py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">How to Shop</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 leading-relaxed mb-6">
            <strong>Finding a specific item:</strong> click 'Search' on the top left of the page. A search box will appear; enter an item description. Above the search box, select 'Menswear' or 'Womenswear' to specify the category and hit 'Enter'. Unisex items will automatically filter into both categories.
          </p>
          
          <p className="text-gray-600 leading-relaxed mb-6">
            <strong>Browsing designers:</strong> on a desktop browser, simply click 'Menswear' or 'Womenswear' on the top left of the screen. On a mobile device, select the Menu icon in the top left corner and select either the Menswear or Womenswear designer categories.
          </p>
          
          <p className="text-gray-600 leading-relaxed mb-6">
            Once a category is selected, the REVETIR collection of brands will appear along the left side, underneath a list of subcategories.
          </p>
          
          <h2 className="text-2xl font-bold mb-6 mt-8">Checking Out</h2>
          
          <p className="text-gray-600 leading-relaxed mb-6">
            To select an item for purchase, choose a size and select 'Add to Bag'. This will add the item to the shopping bag. To view your bag and check out, click on your bag or select 'Go to Bag'.
          </p>
          
          <p className="text-gray-600 leading-relaxed mb-6">
            <em>Note: Adding items to a Shopping Bag does not reserve them.</em>
          </p>
          
          <p className="text-gray-600 leading-relaxed mb-6">
            When reviewing an order on the 'Shopping Bag' page, unwanted items can be removed by clicking 'Remove' or the trash icon beside the product.
          </p>
          
          <p className="text-gray-600 leading-relaxed mb-6">
            Clicking 'Proceed to Checkout' leads to the final stage of the process.
          </p>
          
          <p className="text-gray-600 leading-relaxed mb-6">
            <strong>On the Checkout Page:</strong>
          </p>
          
          <ul className="text-gray-600 leading-relaxed mb-6 list-disc pl-6">
            <li>Provide a shipping and billing address</li>
            <li>Choose the preferred type of shipping</li>
            <li>Input a method of payment</li>
            <li>Review your purchases one last time before placing your order</li>
          </ul>
          
          <p className="text-gray-600 leading-relaxed mb-6">
            Once your purchase has been completed, an e-mail confirmation will be sent to the address on file. This e-mail acts as an invoice and includes your order number.
          </p>
          
          <p className="text-gray-600 leading-relaxed">
            For more details on the order process, please click <LocalizedClientLink href="/customer-care/ordering" className="text-black hover:underline">here</LocalizedClientLink>.
          </p>
        </div>
      </div>
    </div>
  )
} 