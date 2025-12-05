"use client"

import React from "react"

const PrintButton: React.FC = () => {
  return (
    <div className="hidden sm:flex justify-end mb-2">
      <button
        type="button"
        onClick={() => typeof window !== "undefined" && window.print()}
        className="text-xs underline uppercase text-gray-900"
      >
        Print
      </button>
    </div>
  )
}

export default PrintButton
