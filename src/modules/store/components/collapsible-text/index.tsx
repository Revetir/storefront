"use client"

import { useState } from "react"

interface CollapsibleTextProps {
  text: string
  className?: string
}

export default function CollapsibleText({ text, className = "" }: CollapsibleTextProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!text) {
    return null
  }

  return (
    <div className={className}>
      <p className={`text-sm text-[#333] leading-relaxed ${!isExpanded ? 'line-clamp-3 lg:line-clamp-none' : ''}`}>
        {text}
      </p>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="lg:hidden text-sm text-[#333] underline mt-1 hover:no-underline"
        aria-expanded={isExpanded}
      >
        {isExpanded ? 'Show less' : 'Read more'}
      </button>
    </div>
  )
}
