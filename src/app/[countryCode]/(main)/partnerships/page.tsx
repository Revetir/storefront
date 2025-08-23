import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Partnerships | Revetir",
  description: "Partner with Revetir to create sustainable fashion solutions and grow together.",
}

export default function PartnershipsPage() {
  return (
    <div className="content-container py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Partnerships</h1>
        
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Partner With Us</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            At Revetir, we believe in the power of collaboration to drive positive change 
            in the fashion industry. We're always looking for like-minded partners who 
            share our commitment to quality, inclusion, and ethics above profit.
          </p>
        </div>
        
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Partnership Opportunities</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-3">Brand Collaborations</h3>
              <p className="text-gray-600 mb-4">
                Partner with us to bring your collections to a curated global audience through our selective retail platform.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Authorized retail of your products</li>
                <li>• Dedicated brand showcases and editorial features</li>
                <li>• Integrated marketing and cross-channel promotion</li>
              </ul>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-3">Affiliate Partnerships</h3>
              <p className="text-gray-600 mb-4">
              Join our affiliate network and earn competitive commissions by sharing Revetir’s curated selection of conscious luxury with your audience.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Commission-based earnings on referred sales</li>
                <li>• Exclusive discounts and rebates</li>
                <li>• Opportunities for sponsored content and campaign features</li>
              </ul>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-3">Supplier Partnerships</h3>
              <p className="text-gray-600 mb-4">
                We’re seeking experienced manufacturers with impeccable attention to detail and transparent business practices. 
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Exclusive direct-to-consumer sales agreements</li>
                <li>• Preferential consideration for product line expansions</li>
                <li>• Detailed customer feedback and sales analytics</li>
              </ul>
            </div>
          </div>
        </div>
        
        
        <div>
          <h2 className="text-2xl font-semibold mb-6">Get Started</h2>
          <p className="text-gray-600 mb-4">
            Ready to explore a partnership with Revetir? We welcome your inquiry at:
          </p>
          <div className="space-y-2">
              <p><strong>partnerships@revetir.com</strong></p>
          </div>
          <div className="bg-gray-50 rounded-lg p-6 mt-4"> 
              <p className="text-sm text-gray-600">
                Please include in your email:
              </p>
              <ul className="text-sm text-gray-600 mt-2 space-y-1">
                <li>• Your organization's name and mission</li>
                <li>• Type of partnership you're interested in</li>
                <li>• How you align with our values</li>
                <li>• Your proposed collaboration idea</li>
              </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 