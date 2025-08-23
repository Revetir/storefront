import React from "react"

// T-Shirt sizing diagram
export const TShirtDiagram: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    viewBox="0 0 200 300"
    className={`w-full h-auto ${className}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* T-shirt outline */}
    <path
      d="M40 80 L80 40 L120 40 L160 80 L160 120 L140 140 L140 280 L60 280 L60 140 L40 120 Z"
      stroke="#374151"
      strokeWidth="2"
      fill="none"
    />
    {/* Sleeve lines */}
    <path d="M80 40 L60 60" stroke="#374151" strokeWidth="2" />
    <path d="M120 40 L140 60" stroke="#374151" strokeWidth="2" />
    
    {/* Measurement points */}
    <circle cx="100" cy="80" r="3" fill="#EF4444" className="chest-point" />
    <circle cx="100" cy="120" r="3" fill="#EF4444" className="waist-point" />
    <circle cx="100" cy="200" r="3" fill="#EF4444" className="length-point" />
    <circle cx="60" cy="140" r="3" fill="#EF4444" className="shoulder-point" />
    <circle cx="140" cy="140" r="3" fill="#EF4444" className="shoulder-point" />
  </svg>
)

// Trousers sizing diagram - matches the provided pants_sizing_diagram.png
export const TrousersDiagram: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    viewBox="0 0 200 300"
    className={`w-full h-auto ${className}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Main trouser body */}
    <path
      d="M70 50 L130 50 L130 70 L135 70 L135 90 L130 90 L130 180 L125 180 L120 280 L80 280 L75 180 L70 180 L70 90 L65 90 L65 70 L70 70 Z"
      stroke="#374151"
      strokeWidth="2"
      fill="none"
    />
    
    {/* Waistband detail */}
    <path
      d="M70 50 L130 50 L130 60 L70 60 Z"
      stroke="#374151"
      strokeWidth="1"
      fill="none"
    />
    
    {/* Pocket details */}
    <path
      d="M75 65 Q80 70 75 75"
      stroke="#374151"
      strokeWidth="1"
      fill="none"
    />
    <path
      d="M125 65 Q120 70 125 75"
      stroke="#374151"
      strokeWidth="1"
      fill="none"
    />
    
    {/* Crotch seam */}
    <path
      d="M100 180 L100 190"
      stroke="#374151"
      strokeWidth="1"
      fill="none"
    />
    
    {/* Leg seams */}
    <path
      d="M75 180 L80 280"
      stroke="#374151"
      strokeWidth="1"
      fill="none"
    />
    <path
      d="M125 180 L120 280"
      stroke="#374151"
      strokeWidth="1"
      fill="none"
    />
    
    {/* Hem details */}
    <path
      d="M80 280 L120 280"
      stroke="#374151"
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M80 275 L120 275"
      stroke="#374151"
      strokeWidth="1"
      fill="none"
    />
    
    {/* Measurement guide lines */}
    {/* Waist measurement line */}
    <path
      d="M50 55 L150 55"
      stroke="#9CA3AF"
      strokeWidth="1"
      strokeDasharray="3,3"
      fill="none"
    />
    <path
      d="M50 50 L50 60"
      stroke="#9CA3AF"
      strokeWidth="1"
      fill="none"
    />
    <path
      d="M150 50 L150 60"
      stroke="#9CA3AF"
      strokeWidth="1"
      fill="none"
    />
    
    {/* Hip measurement line */}
    <path
      d="M45 100 L155 100"
      stroke="#9CA3AF"
      strokeWidth="1"
      strokeDasharray="3,3"
      fill="none"
    />
    <path
      d="M45 95 L45 105"
      stroke="#9CA3AF"
      strokeWidth="1"
      fill="none"
    />
    <path
      d="M155 95 L155 105"
      stroke="#9CA3AF"
      strokeWidth="1"
      fill="none"
    />
    
    {/* Length measurement line */}
    <path
      d="M160 55 L160 280"
      stroke="#9CA3AF"
      strokeWidth="1"
      strokeDasharray="3,3"
      fill="none"
    />
    <path
      d="M155 55 L165 55"
      stroke="#9CA3AF"
      strokeWidth="1"
      fill="none"
    />
    <path
      d="M155 280 L165 280"
      stroke="#9CA3AF"
      strokeWidth="1"
      fill="none"
    />
    
    {/* Inseam measurement line */}
    <path
      d="M100 180 L100 280"
      stroke="#9CA3AF"
      strokeWidth="1"
      strokeDasharray="3,3"
      fill="none"
    />
    <path
      d="M95 180 L105 180"
      stroke="#9CA3AF"
      strokeWidth="1"
      fill="none"
    />
    <path
      d="M95 280 L105 280"
      stroke="#9CA3AF"
      strokeWidth="1"
      fill="none"
    />
    
    {/* Measurement points */}
    <circle cx="100" cy="55" r="3" fill="#EF4444" className="waist-point" />
    <circle cx="100" cy="100" r="3" fill="#EF4444" className="hip-point" />
    <circle cx="160" cy="167" r="3" fill="#EF4444" className="length-point" />
    <circle cx="100" cy="230" r="3" fill="#EF4444" className="inseam-point" />
  </svg>
)

// Necklace sizing diagram
export const NecklaceDiagram: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    viewBox="0 0 200 200"
    className={`w-full h-auto ${className}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Neck outline */}
    <ellipse cx="100" cy="80" rx="40" ry="20" stroke="#374151" strokeWidth="2" fill="none" />
    
    {/* Necklace chain */}
    <path
      d="M60 80 Q100 120 140 80"
      stroke="#374151"
      strokeWidth="2"
      fill="none"
      strokeDasharray="5,5"
    />
    
    {/* Measurement points */}
    <circle cx="100" cy="60" r="3" fill="#EF4444" className="neck-point" />
    <circle cx="100" cy="120" r="3" fill="#EF4444" className="length-point" />
  </svg>
)

// Generic sizing diagram for other categories
export const GenericDiagram: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    viewBox="0 0 200 200"
    className={`w-full h-auto ${className}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Generic rectangle outline */}
    <rect x="50" y="50" width="100" height="100" stroke="#374151" strokeWidth="2" fill="none" />
    
    {/* Measurement points */}
    <circle cx="100" cy="75" r="3" fill="#EF4444" className="width-point" />
    <circle cx="100" cy="125" r="3" fill="#EF4444" className="height-point" />
  </svg>
)


