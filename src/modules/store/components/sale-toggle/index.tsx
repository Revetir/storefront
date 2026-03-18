"use client"

import React from "react"

type SaleToggleProps = {
  checked: boolean
  onToggle: () => void
  className?: string
}

const SaleToggle: React.FC<SaleToggleProps> = ({ checked, onToggle, className = "" }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`.trim()}>
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={onToggle}
        className="relative flex h-4 w-4 items-center justify-center outline-none"
      >
        <div className="h-4 w-4 border border-black bg-white rounded-sm flex items-center justify-center">
          {checked && <div className="h-2 w-2 bg-black rounded-sm" />}
        </div>
      </button>
      <button
        type="button"
        onClick={onToggle}
        className="h-4 flex items-center text-left text-xs uppercase font-sans leading-none text-black"
      >
        SALE ONLY
      </button>
    </div>
  )
}

export default SaleToggle
