"use client"

import { HttpTypes } from "@medusajs/types"
import { Container } from "@medusajs/ui"
import Image from "next/image"
import { useState, useRef, useEffect } from "react"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
  product: HttpTypes.StoreProduct
}

const ImageGallery = ({ images, product }: ImageGalleryProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const mobileScrollContainerRef = useRef<HTMLDivElement>(null)
  const tabletScrollContainerRef = useRef<HTMLDivElement>(null)

  // State for click-and-drag functionality
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  const getAltText = (index: number) => {
    const brand = (product as any).brands?.[0]?.name || "Product"
    const title = product.title || ""
    return `${brand} ${title} ${index + 1}`.trim()
  }

  // Click-and-drag handlers
  const handleMouseDown = (e: React.MouseEvent, container: HTMLDivElement | null) => {
    if (!container) return
    e.preventDefault() // Prevent default drag behavior
    setIsDragging(true)
    setStartX(e.pageX - container.offsetLeft)
    setScrollLeft(container.scrollLeft)
    container.style.userSelect = 'none'
  }

  const handleMouseLeave = (container: HTMLDivElement | null) => {
    if (!container) return
    setIsDragging(false)
    container.style.userSelect = 'auto'
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseMove = (e: React.MouseEvent, container: HTMLDivElement | null) => {
    if (!isDragging || !container) return
    e.preventDefault()
    const x = e.pageX - container.offsetLeft
    const walk = (x - startX) * 2 // Multiply by 2 for faster scrolling
    container.scrollLeft = scrollLeft - walk
  }

  // Global mouseup listener to handle mouse release anywhere on the page
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseUp = () => {
        setIsDragging(false)
      }

      document.addEventListener('mouseup', handleGlobalMouseUp)

      return () => {
        document.removeEventListener('mouseup', handleGlobalMouseUp)
      }
    }
  }, [isDragging])

  // Consolidated scroll handler for both mobile and tablet
  useEffect(() => {
    const handleScroll = (container: HTMLDivElement) => {
      const scrollLeft = container.scrollLeft
      const imageWidth = container.scrollWidth / images.length
      const newIndex = Math.round(scrollLeft / imageWidth)
      setCurrentImageIndex(newIndex)
    }

    const mobileContainer = mobileScrollContainerRef.current
    const tabletContainer = tabletScrollContainerRef.current

    const handleMobileScroll = () => mobileContainer && handleScroll(mobileContainer)
    const handleTabletScroll = () => tabletContainer && handleScroll(tabletContainer)

    if (mobileContainer) {
      mobileContainer.addEventListener('scroll', handleMobileScroll)
    }
    if (tabletContainer) {
      tabletContainer.addEventListener('scroll', handleTabletScroll)
    }

    return () => {
      if (mobileContainer) {
        mobileContainer.removeEventListener('scroll', handleMobileScroll)
      }
      if (tabletContainer) {
        tabletContainer.removeEventListener('scroll', handleTabletScroll)
      }
    }
  }, [images.length])

  return (
    <div className="flex items-start relative">
      {/* Mobile: Horizontal scrolling gallery with indicators - < md (768px) */}
      <div className="md:hidden w-full">
        <div
          ref={mobileScrollContainerRef}
          className="flex overflow-x-auto snap-x snap-mandatory gap-0 px-0 pb-2 no-scrollbar"
          onMouseDown={(e) => handleMouseDown(e, mobileScrollContainerRef.current)}
          onMouseLeave={() => handleMouseLeave(mobileScrollContainerRef.current)}
          onMouseUp={handleMouseUp}
          onMouseMove={(e) => handleMouseMove(e, mobileScrollContainerRef.current)}
        >
          {images.map((image, index) => {
            return (
              <Container
                key={image.id}
                className="relative aspect-square w-full flex-shrink-0 snap-center overflow-hidden shadow-none bg-white px-0 py-0"
                id={image.id}
              >
                {!!image.url && (
                  <Image
                    src={image.url}
                    priority={index <= 2 ? true : false}
                    loading={index <= 2 ? undefined : "lazy"}
                    className="absolute inset-0 rounded-rounded"
                    alt={getAltText(index)}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 65vw, (max-width: 1280px) 50vw, 50vw"
                    style={{
                      objectFit: "contain",
                    }}
                    quality={95}
                    placeholder="blur"
                    blurDataURL={`data:image/svg+xml;base64,${Buffer.from(
                      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><filter id="b"><feGaussianBlur stdDeviation="12" /></filter><image preserveAspectRatio="none" filter="url(#b)" href="${image.url}" width="100%" height="100%"/></svg>`
                    ).toString('base64')}`}
                    onDragStart={(e) => e.preventDefault()}
                  />
                )}
              </Container>
            )
          })}
        </div>
        
        {/* Image indicators */}
        {images.length > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4">
            {images.map((_, index) => (
              <div
                key={index}
                className={`h-1 rounded-full transition-all duration-300 ${
                  index === currentImageIndex 
                    ? 'bg-black w-8' 
                    : 'bg-gray-300 w-4'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Tablet: Horizontal scrolling gallery with indicators - md to xl (768px to 1280px) */}
      <div className="hidden md:block xl:hidden w-full h-full">
        <div
          ref={tabletScrollContainerRef}
          className="flex overflow-x-auto snap-x snap-mandatory gap-0 px-0 pb-2 no-scrollbar"
          onMouseDown={(e) => handleMouseDown(e, tabletScrollContainerRef.current)}
          onMouseLeave={() => handleMouseLeave(tabletScrollContainerRef.current)}
          onMouseUp={handleMouseUp}
          onMouseMove={(e) => handleMouseMove(e, tabletScrollContainerRef.current)}
        >
          {images.map((image, index) => {
            return (
              <Container
                key={image.id}
                className="relative aspect-square w-full flex-shrink-0 snap-center overflow-hidden shadow-none bg-white px-0 py-0"
                id={image.id}
              >
                {!!image.url && (
                  <Image
                    src={image.url}
                    priority={index <= 2 ? true : false}
                    loading={index <= 2 ? undefined : "lazy"}
                    className="absolute inset-0 rounded-rounded"
                    alt={getAltText(index)}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 65vw, (max-width: 1280px) 50vw, 50vw"
                    style={{
                      objectFit: "contain",
                    }}
                    quality={95}
                    placeholder="blur"
                    blurDataURL={`data:image/svg+xml;base64,${Buffer.from(
                      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><filter id="b"><feGaussianBlur stdDeviation="12" /></filter><image preserveAspectRatio="none" filter="url(#b)" href="${image.url}" width="100%" height="100%"/></svg>`
                    ).toString('base64')}`}
                    onDragStart={(e) => e.preventDefault()}
                  />
                )}
              </Container>
            )
          })}
        </div>
        
        {/* Image indicators */}
        {images.length > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4">
            {images.map((_, index) => (
              <div
                key={index}
                className={`h-1 rounded-full transition-all duration-300 ${
                  index === currentImageIndex 
                    ? 'bg-black w-8' 
                    : 'bg-gray-300 w-4'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Desktop: Vertical scrolling gallery with first image centered - xl+ (1280px+) */}
      <div className="hidden xl:block w-full">
        <div className="flex flex-col items-center">
          {images.map((image, index) => {
            return (
              <div
                key={image.id}
                className="w-full flex items-center justify-center"
                style={{
                  minHeight: '90vh',
                  height: '90vh',
                  marginBottom: '10vh'
                }}
              >
                <Container
                  className="relative w-full h-full overflow-hidden shadow-none bg-white px-0 py-0 flex items-center justify-center"
                  id={image.id}
                >
                  {!!image.url && (
                    <Image
                      src={image.url}
                      priority={index <= 2 ? true : false}
                      loading={index <= 2 ? undefined : "lazy"}
                      className="rounded-rounded"
                      alt={getAltText(index)}
                      width={3000}
                      height={3000}
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 65vw, (max-width: 1280px) 50vw, 50vw"
                      style={{
                        objectFit: "contain",
                        maxWidth: "100%",
                        width: "auto",
                        height: "auto",
                      }}
                      quality={95}
                      placeholder="blur"
                      blurDataURL={`data:image/svg+xml;base64,${Buffer.from(
                        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><filter id="b"><feGaussianBlur stdDeviation="12" /></filter><image preserveAspectRatio="none" filter="url(#b)" href="${image.url}" width="100%" height="100%"/></svg>`
                      ).toString('base64')}`}
                      onDragStart={(e) => e.preventDefault()}
                    />
                  )}
                </Container>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ImageGallery
