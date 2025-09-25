import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Accessibility | Revetir",
  description: "Learn about REVETIR's commitment to accessibility and the features we provide for all users.",
}

export default function AccessibilityPage() {
  return (
    <div className="content-container py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Accessibility</h1>
        
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 mb-8">
            Fashion should be accessible to everyone. Revetir is committed 
            to ensuring that our website and services are accessible to people with disabilities 
            and provide an inclusive experience for all users.
          </p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Our Commitment</h2>
            <p className="text-gray-600 mb-4">
              We strive to maintain compliance with the Web Content Accessibility Guidelines (WCAG) 
              2.1 Level AA standards and continuously work to improve the accessibility of our website.
            </p>
            
            <p className="text-gray-600 mb-4">
              If you are having difficulty viewing, navigating, or browsing content on our website; 
              or notice any content, feature, or function that you believe is not fully accessible to people who are differently abled, please:
            </p>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
              <p className="text-gray-700 mb-3">
                Write to us at <a href="mailto:care@revetir.com" className="text-blue-600 hover:underline">care@revetir.com</a>
              </p>
              <p className="text-gray-700">
                Use "Accessibility Barriers" in the subject line so that we may address the issue as soon as possible. 
                A description of the specific feature you feel is an accessibility barrier and/or a suggestion for improvement would be greatly appreciated.
              </p>
            </div>
            
            <p className="text-gray-600 mb-4">
              We thank you for your feedback and will continue to further our mission to accommodate the full scope of abilities.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
} 