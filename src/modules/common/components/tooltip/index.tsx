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
        <div className="absolute z-50 left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 text-xs text-gray-700 bg-white rounded-lg shadow-xl border border-gray-200 whitespace-normal w-64 md:w-auto md:max-w-md max-w-[calc(100vw-3rem)] animate-fadeIn before:content-[''] before:absolute before:right-full before:top-1/2 before:-translate-y-1/2 before:border-8 before:border-transparent before:border-r-white after:content-[''] after:absolute after:right-full after:top-1/2 after:-translate-y-1/2 after:border-8 after:border-transparent after:border-r-gray-200 after:-mr-px">
          <div className="text-left leading-snug normal-case">{content}</div>
        </div>
      )}
    </div>
  )
}

export default Tooltip
