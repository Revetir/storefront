"use client"

import React, { useState, useEffect, useRef } from "react"

type TooltipProps = {
  content: string
  children: React.ReactNode
}

const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)

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
    <div className="relative inline-block" ref={tooltipRef}>
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={handleToggle}
        onTouchStart={(e) => {
          e.preventDefault()
          handleToggle()
        }}
        className="cursor-help flex items-center gap-1 touch-manipulation"
      >
        {children}
        <svg
          className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 transition-colors"
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
      </div>
      {isVisible && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs text-gray-700 bg-white rounded-lg shadow-xl border border-gray-200 whitespace-normal w-80 animate-fadeIn md:w-80 w-[calc(100vw-2rem)] max-w-sm">
          <div className="text-left leading-snug">{content}</div>
          {/* Close button for mobile - only visible on touch devices */}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-1 right-1 text-gray-400 hover:text-gray-600 md:hidden"
            aria-label="Close tooltip"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

export default Tooltip
