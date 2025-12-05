"use client"

import React from "react"

const PrintButton: React.FC = () => {
  return (
    <button
      type="button"
      onClick={() => typeof window !== "undefined" && window.print()}
      className="hidden sm:inline-flex text-xs underline uppercase text-gray-900"
    >
      Print
    </button>
  )
}

export default PrintButton
