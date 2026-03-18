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
        className="relative flex h-3.5 w-3.5 items-center justify-center outline-none"
      >
        <div className="h-3.5 w-3.5 border border-black bg-white flex items-center justify-center">
          {checked && <div className="h-[7px] w-[7px] bg-black" />}
        </div>
      </button>
      <button
        type="button"
        onClick={onToggle}
        className="h-3.5 flex items-center text-left text-xs uppercase font-sans leading-none text-black"
      >
        SALE ONLY
      </button>
    </div>
  )
}

export default SaleToggle
