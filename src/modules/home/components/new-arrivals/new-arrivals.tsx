'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { getNewestProducts } from '@lib/data/products'
import { HttpTypes } from '@medusajs/types'
import { getAlgoliaProductPrice, isAlgoliaProduct } from '@lib/util/get-algolia-product-price'
import { getProductPrice } from '@lib/util/get-product-price'
import { Text, clx } from "@medusajs/ui"
import { getProductUrl } from '@lib/util/brand-utils'

interface NewArrivalsProps {
  countryCode: string
  initialProducts: HttpTypes.StoreProduct[]
}

const NewArrivals = ({ countryCode, initialProducts }: NewArrivalsProps) => {
  const [products, setProducts] = useState(initialProducts)
  const [isLoading, setIsLoading] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const scrollTrackRef = useRef<HTMLDivElement>(null)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchDelta, setTouchDelta] = useState(0)
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load 30 products on mount
  useEffect(() => {
    const loadProducts = async () => {
      if (products.length < 30) {
        setIsLoading(true)
        try {
          const newProducts = await getNewestProducts({
            countryCode,
            limit: 30
          })
          if (newProducts.length > 0) {
            setProducts(newProducts)
          }
        } catch (error) {
          console.error('Error loading products:', error)
        } finally {
          setIsLoading(false)
        }
      }
    }
    loadProducts()
  }, [countryCode])

  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
    setIsPaused(true)
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current)
    }
  }

  // Handle touch move
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return
    const currentTouch = e.touches[0].clientX
    setTouchDelta(touchStart - currentTouch)
  }

  // Handle touch end - resume scrolling after delay
  const handleTouchEnd = () => {
    setTouchStart(null)
    setTouchDelta(0)

    // Resume auto-scroll after 3 seconds of no interaction
    pauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false)
    }, 3000)
  }

  // Manual scroll controls
  const handlePause = () => {
    setIsPaused(!isPaused)
  }

  const handleScrollLeft = () => {
    if (scrollTrackRef.current) {
      scrollTrackRef.current.scrollBy({ left: -320, behavior: 'smooth' })
      setIsPaused(true)
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current)
      }
      pauseTimeoutRef.current = setTimeout(() => {
        setIsPaused(false)
      }, 3000)
    }
  }

  const handleScrollRight = () => {
    if (scrollTrackRef.current) {
      scrollTrackRef.current.scrollBy({ left: 320, behavior: 'smooth' })
      setIsPaused(true)
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current)
      }
      pauseTimeoutRef.current = setTimeout(() => {
        setIsPaused(false)
      }, 3000)
    }
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current)
      }
    }
  }, [])

  // Triple the products array for seamless infinite loop
  const infiniteProducts = [...products, ...products, ...products]

  // Calculate animation duration based on number of products (medium speed)
  // Approximately 3-4 seconds per product for smooth viewing
  const animationDuration = products.length * 3.5

  return (
    <section
      className="w-full py-10 select-none relative overflow-hidden"
      style={{ backgroundColor: '#fff' }}
    >
      {/* Background Pattern - "NEW ARRIVALS" repeated text */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 200px,
            rgba(0, 0, 0, 0.02) 200px,
            rgba(0, 0, 0, 0.02) 400px
          )`,
          zIndex: 0
        }}
      >
        <div
          className="absolute inset-0 flex flex-wrap items-center justify-center"
          style={{
            transform: 'rotate(-15deg) scale(1.5)',
            opacity: 0.04,
            fontWeight: 700,
            fontSize: 'clamp(2rem, 5vw, 4rem)',
            letterSpacing: '0.2em',
            lineHeight: 2,
            color: '#000',
            userSelect: 'none'
          }}
        >
          {Array.from({ length: 50 }).map((_, i) => (
            <span key={i} style={{ margin: '0 2rem' }}>NEW ARRIVALS</span>
          ))}
        </div>
      </div>

      {/* Scrolling Product Cards */}
      <div
        className="relative"
        style={{ zIndex: 1 }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          ref={scrollTrackRef}
          className="infinite-scroll-track flex gap-8 px-4"
          style={{
            animation: isPaused ? 'none' : `scroll-left ${animationDuration}s linear infinite`,
            willChange: 'transform',
            transform: touchDelta !== 0 ? `translateX(-${touchDelta}px)` : undefined
          }}
        >
          {infiniteProducts.map((product, index) => {
            // Get proper pricing data
            let cheapestPrice
            if (isAlgoliaProduct(product)) {
              cheapestPrice = getAlgoliaProductPrice(product, countryCode)
            } else {
              const priceResult = getProductPrice({ product })
              cheapestPrice = priceResult.cheapestPrice
            }

            return (
              <Link
                key={`${product.id}-${index}`}
                href={getProductUrl((product as any).brands, product.handle || '')}
                className="group hover:opacity-80 transition-opacity flex-shrink-0"
                style={{
                  width: 'clamp(280px, 25vw, 350px)',
                }}
              >
                <div className="aspect-square relative mb-4 bg-white">
                  <Image
                    src={product.thumbnail || "/images/imgi_1_elementor-placeholder-image.png"}
                    alt={`${(product as any).brands?.[0]?.name || 'Product'} ${product.title}`}
                    fill
                    className="rounded-md object-contain"
                    loading="lazy"
                    quality={80}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-500 mb-1 uppercase tracking-wide">
                    {(product as any).brands?.[0]?.name || 'Product'}
                  </p>
                  <h3 className="font-medium text-lg mb-1">{product.title}</h3>
                  <div className="text-gray-600">
                    {cheapestPrice ? (
                      <>
                        {cheapestPrice.price_type === "sale" && "original_price" in cheapestPrice && cheapestPrice.original_price && (
                          <Text
                            className="line-through text-ui-fg-muted"
                            data-testid="original-price"
                          >
                            {cheapestPrice.original_price}
                          </Text>
                        )}
                        <Text
                          className={clx("text-ui-fg-muted", {
                            "text-ui-fg-interactive": cheapestPrice.price_type === "sale",
                          })}
                          data-testid="price"
                        >
                          {cheapestPrice.calculated_price}
                        </Text>
                      </>
                    ) : (
                      'Price not available'
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Controls */}
      <div
        className="flex items-center justify-center gap-4 mt-8"
        style={{ zIndex: 2, position: 'relative' }}
      >
        <button
          onClick={handleScrollLeft}
          className="p-3 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
          aria-label="Scroll left"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="12,4 6,10 12,16" />
          </svg>
        </button>

        <button
          onClick={handlePause}
          className="p-3 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
          aria-label={isPaused ? "Play" : "Pause"}
        >
          {isPaused ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <polygon points="5,3 5,17 15,10" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <rect x="5" y="3" width="3" height="14" />
              <rect x="12" y="3" width="3" height="14" />
            </svg>
          )}
        </button>

        <button
          onClick={handleScrollRight}
          className="p-3 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
          aria-label="Scroll right"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="8,4 14,10 8,16" />
          </svg>
        </button>
      </div>

      {/* Screen reader announcement for auto-scrolling */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isPaused ? 'Scrolling paused' : 'Auto-scrolling active'}
      </div>
    </section>
  )
}

export default NewArrivals
