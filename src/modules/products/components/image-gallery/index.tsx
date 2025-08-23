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
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const getAltText = (index: number) => {
    const brand = product.type?.value || "Product"
    const title = product.title || ""
    return `${brand} ${title} ${index + 1}`.trim()
  }

  // Update current image index based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current
        const scrollLeft = container.scrollLeft
        const imageWidth = container.scrollWidth / images.length
        const newIndex = Math.round(scrollLeft / imageWidth)
        setCurrentImageIndex(newIndex)
      }
    }

    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [images.length])

  return (
    <div className="flex items-start relative">
      {/* Mobile: Horizontal scrolling gallery with indicators */}
      <div className="md:hidden w-full">
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto snap-x snap-mandatory gap-0 px-0 pb-2 no-scrollbar"
        >
          {images.map((image, index) => {
            return (
              <Container
                key={image.id}
                className="relative aspect-square w-full flex-shrink-0 snap-center overflow-hidden shadow-none bg-ui-bg-subtle"
                id={image.id}
              >
                {!!image.url && (
                  <Image
                    src={image.url}
                    priority={index <= 2 ? true : false}
                    className="absolute inset-0 rounded-rounded"
                    alt={getAltText(index)}
                    fill
                    unoptimized={true}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 60vw, (max-width: 1280px) 50vw, 800px"
                    style={{
                      objectFit: "cover",
                    }}
                    quality={95}
                    placeholder="blur"
                    blurDataURL={`data:image/svg+xml;base64,${Buffer.from(
                      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><filter id="b"><feGaussianBlur stdDeviation="12" /></filter><image preserveAspectRatio="none" filter="url(#b)" href="${image.url}" width="100%" height="100%"/></svg>`
                    ).toString('base64')}`}
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

      {/* Desktop: Vertical stacked gallery */}
      <div className="hidden md:flex flex-col flex-1 small:mx-16 gap-y-4">
        {images.map((image, index) => {
          return (
            <Container
              key={image.id}
              className="relative aspect-square w-full overflow-hidden shadow-none bg-ui-bg-subtle"
              id={image.id}
            >
              {!!image.url && (
                <Image
                  src={image.url}
                  priority={index <= 2 ? true : false}
                  className="absolute inset-0 rounded-rounded"
                  alt={getAltText(index)}
                  fill
                  unoptimized={true}
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 60vw, (max-width: 1280px) 50vw, 800px"
                  style={{
                    objectFit: "cover",
                  }}
                  quality={95}
                  placeholder="blur"
                  blurDataURL={`data:image/svg+xml;base64,${Buffer.from(
                    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><filter id="b"><feGaussianBlur stdDeviation="12" /></filter><image preserveAspectRatio="none" filter="url(#b)" href="${image.url}" width="100%" height="100%"/></svg>`
                  ).toString('base64')}`}
                />
              )}
            </Container>
          )
        })}
      </div>
    </div>
  )
}

export default ImageGallery
