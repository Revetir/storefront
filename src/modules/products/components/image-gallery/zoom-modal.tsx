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
  const [currentImageIndex, setCurrentImageIndex] = useState(initialIndex)

  // Handle mounting for portal
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"

      // Scroll to the initial image on open
      setTimeout(() => {
        scrollToImage(initialIndex)
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
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        const nextIndex = Math.min(currentImageIndex + 1, images.length - 1)
        scrollToImage(nextIndex)
      } else if (e.key === "ArrowLeft") {
        e.preventDefault()
        const prevIndex = Math.max(currentImageIndex - 1, 0)
        scrollToImage(prevIndex)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, currentImageIndex, images.length, onClose])

  // Track scroll position to update current image index
  useEffect(() => {
    if (!isOpen || !scrollContainerRef.current) return

    const handleScroll = () => {
      if (!scrollContainerRef.current) return

      const scrollTop = scrollContainerRef.current.scrollTop
      const viewportHeight = window.innerHeight

      // Calculate which image is most visible
      const newIndex = Math.round(scrollTop / viewportHeight)
      setCurrentImageIndex(Math.min(newIndex, images.length - 1))
    }

    const container = scrollContainerRef.current
    container.addEventListener("scroll", handleScroll)

    return () => container.removeEventListener("scroll", handleScroll)
  }, [isOpen, images.length])

  const scrollToImage = (index: number) => {
    if (!scrollContainerRef.current) return

    const viewportHeight = window.innerHeight
    scrollContainerRef.current.scrollTo({
      top: index * viewportHeight,
      behavior: "smooth",
    })
  }

  const scrollByAmount = (amount: number) => {
    if (!scrollContainerRef.current) return

    scrollContainerRef.current.scrollBy({
      top: amount,
      behavior: "smooth",
    })
  }

  const handleNavigationClick = (index: number) => {
    scrollToImage(index)
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    // Only close if clicking directly on the overlay (not on images or navigation)
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!mounted || !isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-black/95 cursor-zoom-out"
      onClick={handleOverlayClick}
    >
      {/* Close button - top right */}
      <button
        onClick={onClose}
        className="fixed top-6 right-6 z-[102] text-white hover:text-gray-300 transition-colors cursor-pointer"
        aria-label="Close zoom view"
      >
        <X className="w-8 h-8" />
      </button>

      {/* Desktop-only numbered navigation - right edge */}
      <div className="hidden xl:flex fixed right-6 top-1/2 -translate-y-1/2 z-[102] flex-col items-end gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation()
              handleNavigationClick(index)
            }}
            className={`text-lg font-sans uppercase px-3 py-1 cursor-pointer transition-colors ${
              index === currentImageIndex
                ? "font-bold underline text-white"
                : "text-gray-400 hover:text-white"
            }`}
            aria-label={`Go to image ${index + 1}`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Scrollable image container */}
      <div
        ref={scrollContainerRef}
        className="w-full h-full overflow-y-auto overflow-x-hidden snap-y snap-mandatory"
        onClick={handleOverlayClick}
      >
        {images.map((image, index) => (
          <div
            key={image.id}
            className="w-full h-screen flex items-center justify-center snap-start"
          >
            {!!image.url && (
              <div className="relative w-full h-full flex items-center justify-center p-8 xl:pr-32">
                <Image
                  src={image.url}
                  alt={getAltText(index)}
                  width={4000}
                  height={4000}
                  quality={100}
                  sizes="100vw"
                  className="object-contain max-w-full max-h-full"
                  style={{
                    width: "auto",
                    height: "auto",
                    maxWidth: "100%",
                    maxHeight: "100%",
                  }}
                  priority={index === initialIndex || index === initialIndex + 1 || index === initialIndex - 1}
                  loading={index === initialIndex || index === initialIndex + 1 || index === initialIndex - 1 ? undefined : "lazy"}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>,
    document.body
  )
}

export default ZoomModal
