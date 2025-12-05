import { Metadata } from "next"

export const metadata: Metadata = {
  title: "About Us | Revetir",
  description: "Learn about REVETIR's mission to connect global customers with Asia's best fashion brands.",
}

export default function AboutUsPage() {
  return (
    <div className="content-container py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl mb-8">
          <span className="font-bold">About</span>{" "}
          <span className="font-light">REVETIR</span>
        </h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 leading-relaxed mb-6">
            REVETIR (from the French <em>revêtir</em>, meaning 'to dress in') is a global digital platform for the discovery and resale of independent and luxury fashion. 
            The REVETIR Marketplace connects customers worldwide with hundreds of Asia's best brands, department stores, and manufacturers, delivering a truly unique shopping experience and access to the most esoteric selection of luxury online.
          </p>
          
          <p className="text-gray-600 leading-relaxed mb-6">
            
          </p>
        </div>
      </div>
    </div>
  )
} 