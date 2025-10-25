import React from "react"

// Pants sizing diagram
export const PantsDiagram: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`w-full h-auto ${className}`} style={{ aspectRatio: '600/800' }}>
    <img
      src="/images/pants_sizing_diagram.svg"
      alt="Pants measurements diagram"
      className="w-full h-full object-contain"
    />
  </div>
)

// T-Shirts sizing diagram
export const TShirtsDiagram: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`w-full h-auto ${className}`} style={{ aspectRatio: '600/800' }}>
    <img
      src="/images/t_shirts_sizing_diagram.svg"
      alt="T-Shirts measurements diagram"
      className="w-full h-full object-contain"
    />
  </div>
)

export const SizingMissingDiagram: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    viewBox="0 0 300 150"
    className={`w-full h-auto ${className}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Soft rectangular frame */}
    <rect
      x="10"
      y="10"
      width="280"
      height="130"
      rx="8"
      ry="8"
      stroke="#C0C0C0"
      strokeWidth="1.5"
      fill="none"
    />

    {/* Subtle icon suggestion: a ruler line with dots */}
    <line x1="50" y1="50" x2="250" y2="50" stroke="#C0C0C0" strokeWidth="1" strokeDasharray="4 4" />
    <circle cx="50" cy="50" r="2" fill="#C0C0C0" />
    <circle cx="250" cy="50" r="2" fill="#C0C0C0" />

    {/* Informative notice */}
    <text
      x="150"
      y="80"
      textAnchor="middle"
      fill="#374151"
      fontSize="10"
      fontWeight="400"
    >
      Measurements for this product will be available soon
    </text>
    <text
      x="150"
      y="100"
      textAnchor="middle"
      fill="#374151"
      fontSize="8"
      fontWeight="300"
    >
      For urgent sizing assistance, please contact our Customer Care team
    </text>
  </svg>
);
