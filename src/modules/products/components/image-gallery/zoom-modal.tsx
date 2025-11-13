"use client"

import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { X } from "@medusajs/icons"

type ZoomModalProps = {
  images: HttpTypes.StoreProductImage[]
  initialIndex: number
  isOpen: boolean
  onClose: () => void
  getAltText: (index: number) => string
}

const ZoomModal = ({
  images,
  initialIndex,
  isOpen,
  onClose,
  getAltText,
}: ZoomModalProps) => {
  const [mounted, setMounted] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const imageRefs = useRef<(HTMLDivElement | null)[]>([])

  // Handle mounting for portal
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Lock body scroll when modal is open and scroll to initial image
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"

      // Scroll to the initial image on open
      setTimeout(() => {
        if (imageRefs.current[initialIndex]) {
          imageRefs.current[initialIndex]?.scrollIntoView({
            behavior: "auto",
            block: "start",
          })
        }
      }, 50)
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen, initialIndex])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      } else if (e.key === "ArrowDown") {
        e.preventDefault()
        scrollByAmount(window.innerHeight * 0.8)
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        scrollByAmount(-window.innerHeight * 0.8)
      } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault()
        // Find current visible image and scroll to next/previous
        const container = scrollContainerRef.current
        if (!container) return

        const scrollTop = container.scrollTop
        let targetIndex = 0

        // Find which image is currently most visible
        imageRefs.current.forEach((ref, index) => {
          if (ref) {
            const rect = ref.getBoundingClientRect()
            if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
              targetIndex = index
            }
          }
        })

        // Navigate to next or previous
        if (e.key === "ArrowRight") {
          targetIndex = Math.min(targetIndex + 1, images.length - 1)
        } else {
          targetIndex = Math.max(targetIndex - 1, 0)
        }

        imageRefs.current[targetIndex]?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, images.length, onClose])

  const scrollByAmount = (amount: number) => {
    if (!scrollContainerRef.current) return

    scrollContainerRef.current.scrollBy({
      top: amount,
      behavior: "smooth",
    })
  }

  const handleNavigationClick = (index: number) => {
    imageRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }

  const handleContentClick = (e: React.MouseEvent) => {
    // Close modal when clicking anywhere (images or whitespace)
    // Only prevent closing if clicking on navigation number buttons
    const target = e.target as HTMLElement

    // Check if click is on a navigation number button (not the X button)
    if (target.closest('button[aria-label^="Go to image"]')) {
      return
    }

    onClose()
  }

  if (!mounted || !isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-white cursor-zoom-out">
      {/* Close button - top right */}
      <button
        onClick={onClose}
        className="fixed top-8 right-8 z-[102] text-black hover:text-gray-600 transition-colors cursor-pointer"
        aria-label="Close zoom view"
      >
        <X className="w-10 h-10" />
      </button>

      {/* Desktop-only numbered navigation - right 5% column */}
      <div className="hidden xl:flex fixed right-8 top-1/2 -translate-y-1/2 z-[102] flex-col items-end gap-3">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation()
              handleNavigationClick(index)
            }}
            className="text-lg font-sans uppercase px-3 py-1 cursor-pointer transition-colors text-black hover:text-gray-600"
            style={{
              fontWeight: 700,
            }}
            aria-label={`Go to image ${index + 1}`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Scrollable image container - continuous scroll, no snap */}
      <div
        ref={scrollContainerRef}
        className="w-full h-full overflow-y-auto overflow-x-hidden"
        onClick={handleContentClick}
      >
        {/* Desktop: 90% width container with right column for navigation */}
        <div className="xl:w-[90%] w-full mx-0">
          {images.map((image, index) => (
            <div
              key={image.id}
              ref={(el) => {
                imageRefs.current[index] = el
              }}
              className="w-full flex items-center justify-center py-8"
            >
              {!!image.url && (
                <Image
                  src={image.url}
                  alt={getAltText(index)}
                  width={6000}
                  height={6000}
                  quality={100}
                  sizes="(max-width: 1280px) 100vw, 90vw"
                  className="w-auto h-auto max-w-full"
                  style={{
                    objectFit: "contain",
                  }}
                  priority={index <= 2}
                  loading={index <= 2 ? undefined : "lazy"}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  )
}

export default ZoomModal
