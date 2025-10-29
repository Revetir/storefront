"use client"

import React, { useState, useEffect, useRef } from "react"

type TooltipProps = {
  content: string
  children: React.ReactNode
}

const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLSpanElement>(null)
  const tooltipContentRef = useRef<HTMLSpanElement>(null)
  const [verticalOffset, setVerticalOffset] = useState<number>(0)
  const [tooltipWidth, setTooltipWidth] = useState<number | null>(null)

  // Calculate vertical offset and width to align tooltip with parent container
  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipContentRef.current && tooltipRef.current) {
      const trigger = triggerRef.current
      const tooltipContent = tooltipContentRef.current
      const tooltipWrapper = tooltipRef.current
      const parentRow = trigger.closest('.flex.items-center') as HTMLElement

      if (parentRow) {
        const wrapperRect = tooltipWrapper.getBoundingClientRect()
        const rowRect = parentRow.getBoundingClientRect()
        const tooltipContentRect = tooltipContent.getBoundingClientRect()

        // Calculate the center of the parent row
        const rowCenter = rowRect.height / 2
        // Calculate the center of the tooltip wrapper (which is the positioning reference)
        const wrapperTopRelativeToRow = wrapperRect.top - rowRect.top
        const wrapperCenter = wrapperTopRelativeToRow + (wrapperRect.height / 2)
        // Calculate offset needed to align tooltip center with row center
        const offset = rowCenter - wrapperCenter

        setVerticalOffset(offset)

        // Find the SUMMARY container (parent of all rows)
        const summaryContainer = parentRow.parentElement as HTMLElement
        if (summaryContainer) {
          const containerRect = summaryContainer.getBoundingClientRect()
          // Calculate available space from tooltip start to container end
          const tooltipLeft = tooltipContentRect.left
          const containerRight = containerRect.right
          const availableWidth = containerRight - tooltipLeft

          // Set tooltip width to fill available space (minus some padding)
          setTooltipWidth(availableWidth - 16) // 16px for right padding
        }
      }
    }
  }, [isVisible])

  // Handle clicks outside tooltip to close it on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsVisible(false)
      }
    }

    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("touchstart", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
    }
  }, [isVisible])

  const handleToggle = () => {
    setIsVisible(!isVisible)
  }

  return (
    <span className="relative inline-flex items-center gap-1 self-stretch" ref={tooltipRef}>
      {children}
      <span
        ref={triggerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={handleToggle}
        onTouchStart={(e) => {
          e.preventDefault()
          handleToggle()
        }}
        className="cursor-help touch-manipulation inline-flex items-center"
      >
        <svg
          className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      </span>
      {isVisible && (
        <span
          ref={tooltipContentRef}
          className="absolute z-50 left-full ml-2 px-3 py-2 text-xs text-gray-700 bg-white rounded-lg shadow-xl border border-gray-200 whitespace-normal animate-fadeIn before:content-[''] before:absolute before:right-full before:top-1/2 before:-translate-y-1/2 before:border-[6px] before:border-transparent before:border-r-white after:content-[''] after:absolute after:right-full after:top-1/2 after:-translate-y-1/2 after:border-[7px] after:border-transparent after:border-r-gray-200"
          style={{
            top: '50%',
            transform: `translateY(calc(-50% + ${verticalOffset}px))`,
            width: tooltipWidth ? `${tooltipWidth}px` : 'auto',
            minWidth: tooltipWidth ? 'auto' : '400px',
            maxWidth: tooltipWidth ? 'none' : '32rem'
          }}
        >
          <span className="text-left leading-snug normal-case block">{content}</span>
        </span>
      )}
    </span>
  )
}

export default Tooltip
