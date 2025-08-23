"use client"

import React, { useState } from "react"
import { clx } from "@medusajs/ui"
import Plus from "@modules/common/icons/plus"
import Minus from "@modules/common/icons/minus"

interface CollapsibleSectionProps {
  title: string | React.ReactNode
  children: React.ReactNode
  isExpanded?: boolean
  onToggle?: () => void
  className?: string
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  isExpanded = false,
  onToggle,
  className,
}) => {
  const [expanded, setExpanded] = useState(isExpanded)

  const handleToggle = () => {
    const newExpanded = !expanded
    setExpanded(newExpanded)
    onToggle?.()
  }

  return (
    <div className={clx("border border-gray-200 rounded-lg", className)}>
      <button
        type="button"
        onClick={handleToggle}
        className="w-full px-6 py-4 flex items-center text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3 flex-1">
          {expanded ? (
            <Minus size={16} className="text-gray-600" />
          ) : (
            <Plus size={16} className="text-gray-600" />
          )}
                  {typeof title === 'string' ? (
          <h3 className="text-base font-semibold">{title}</h3>
        ) : (
          title
        )}
        </div>
      </button>
      {expanded && (
        <div className="px-6 pb-4 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  )
}

export default CollapsibleSection 