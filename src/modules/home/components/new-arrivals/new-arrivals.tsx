'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect, useRef, useCallback } from 'react'
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

  // Scroll state
  const [scrollOffset, setScrollOffset] = useState(0)
  const [isAutoScrolling, setIsAutoScrolling] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [velocity, setVelocity] = useState(0)

  // Refs
  const scrollTrackRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  const lastInteractionRef = useRef<number>(Date.now())
  const dragStartRef = useRef<{ x: number; offset: number; time: number } | null>(null)
  const lastDragRef = useRef<{ x: number; time: number } | null>(null)
  const velocityRef = useRef(0)

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
  }, [countryCode, products.length])

  // Calculate total width for infinite scroll
  const cardWidth = 350 // approximate max card width including gap
  const totalWidth = products.length * cardWidth

  // Auto-scroll and momentum animation loop
  useEffect(() => {
    const animate = () => {
      const now = Date.now()
      const timeSinceInteraction = now - lastInteractionRef.current

      // Resume auto-scroll after 3 seconds of no interaction
      if (!isAutoScrolling && timeSinceInteraction > 3000 && !isDragging) {
        setIsAutoScrolling(true)
      }

      setScrollOffset(prevOffset => {
        let newOffset = prevOffset

        if (isAutoScrolling && !isDragging) {
          // Auto-scroll: faster speed (2s per product = ~175px/s for 350px cards)
          const autoScrollSpeed = 1.5 // pixels per frame at 60fps (~90px/s)
          newOffset = prevOffset + autoScrollSpeed
        } else if (velocityRef.current !== 0) {
          // Apply momentum with medium decay
          newOffset = prevOffset + velocityRef.current
          velocityRef.current *= 0.92 // Medium decay (8% reduction per frame)

          // Stop momentum when velocity is very small
          if (Math.abs(velocityRef.current) < 0.1) {
            velocityRef.current = 0
            setVelocity(0)
          } else {
            setVelocity(velocityRef.current)
          }
        }

        // Handle infinite loop: reset when we've scrolled through 2/3 of the tripled array
        if (newOffset >= totalWidth * 2) {
          return newOffset - totalWidth
        } else if (newOffset < 0) {
          return totalWidth + newOffset
        }

        return newOffset
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isAutoScrolling, isDragging, totalWidth])

  // Pause auto-scroll and update last interaction time
  const pauseAutoScroll = useCallback(() => {
    setIsAutoScrolling(false)
    lastInteractionRef.current = Date.now()
  }, [])

  // Mouse/Desktop drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Prevent dragging on links/buttons
    if ((e.target as HTMLElement).closest('a')) return

    setIsDragging(true)
    pauseAutoScroll()
    velocityRef.current = 0
    setVelocity(0)

    dragStartRef.current = {
      x: e.clientX,
      offset: scrollOffset,
      time: Date.now()
    }
    lastDragRef.current = {
      x: e.clientX,
      time: Date.now()
    }

    e.preventDefault()
  }, [scrollOffset, pauseAutoScroll])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !dragStartRef.current || !lastDragRef.current) return

    const deltaX = e.clientX - dragStartRef.current.x
    const newOffset = dragStartRef.current.offset - deltaX

    setScrollOffset(newOffset)

    // Calculate velocity for momentum
    const timeDelta = Date.now() - lastDragRef.current.time
    if (timeDelta > 0) {
      const xDelta = e.clientX - lastDragRef.current.x
      velocityRef.current = -(xDelta / timeDelta) * 16 // Convert to pixels per frame
    }

    lastDragRef.current = {
      x: e.clientX,
      time: Date.now()
    }
    lastInteractionRef.current = Date.now()

    e.preventDefault()
  }, [isDragging])

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return

    setIsDragging(false)
    dragStartRef.current = null
    lastInteractionRef.current = Date.now()

    // Velocity is already set from handleMouseMove
    setVelocity(velocityRef.current)
  }, [isDragging])

  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      setIsDragging(false)
      dragStartRef.current = null
      lastInteractionRef.current = Date.now()
    }
  }, [isDragging])

  // Touch/Mobile swipe handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    pauseAutoScroll()
    setIsDragging(true)
    velocityRef.current = 0
    setVelocity(0)

    dragStartRef.current = {
      x: e.touches[0].clientX,
      offset: scrollOffset,
      time: Date.now()
    }
    lastDragRef.current = {
      x: e.touches[0].clientX,
      time: Date.now()
    }
  }, [scrollOffset, pauseAutoScroll])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragStartRef.current || !lastDragRef.current) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - dragStartRef.current.x
    const newOffset = dragStartRef.current.offset - deltaX

    setScrollOffset(newOffset)

    // Calculate velocity for momentum
    const timeDelta = Date.now() - lastDragRef.current.time
    if (timeDelta > 0) {
      const xDelta = touch.clientX - lastDragRef.current.x
      velocityRef.current = -(xDelta / timeDelta) * 16 // Convert to pixels per frame
    }

    lastDragRef.current = {
      x: touch.clientX,
      time: Date.now()
    }
    lastInteractionRef.current = Date.now()
  }, [])

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
    dragStartRef.current = null
    lastInteractionRef.current = Date.now()

    // Velocity is already set from handleTouchMove
    setVelocity(velocityRef.current)
  }, [])

  // Hover handlers for desktop
  const handleMouseEnter = useCallback(() => {
    pauseAutoScroll()
  }, [pauseAutoScroll])

  // Global mouse up listener (in case mouse up happens outside component)
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false)
        dragStartRef.current = null
        lastInteractionRef.current = Date.now()
      }
    }

    window.addEventListener('mouseup', handleGlobalMouseUp)
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp)
  }, [isDragging])

  // Triple the products array for seamless infinite loop
  const infiniteProducts = [...products, ...products, ...products]

  // Microticker state
  const [topTickerOffset, setTopTickerOffset] = useState(0)
  const [bottomTickerOffset, setBottomTickerOffset] = useState(0)
  const tickerAnimationRef = useRef<number | null>(null)

  // Ticker text (repeated for seamless loop)
  const tickerText = 'NEW ARRIVALS ▪ JUST DROPPED ▪ NEW IN ▪ UPDATED DAILY ▪ RESTOCKED'
  const tickerContent = Array.from({ length: 10 }).map(() => tickerText).join(' ▪ ')

  // Ticker auto-scroll animation (50% slower than product scroll)
  useEffect(() => {
    const animateTickers = () => {
      const tickerSpeed = 0.75 // 50% of product auto-scroll speed (1.5)

      setTopTickerOffset(prev => {
        // Top ticker scrolls left (same direction as products)
        const newOffset = prev + tickerSpeed
        // Reset when scrolled one full repetition
        if (newOffset >= 5000) return 0
        return newOffset
      })

      setBottomTickerOffset(prev => {
        // Bottom ticker scrolls right (opposite direction)
        const newOffset = prev - tickerSpeed
        // Reset when scrolled one full repetition
        if (newOffset <= -5000) return 0
        return newOffset
      })

      tickerAnimationRef.current = requestAnimationFrame(animateTickers)
    }

    tickerAnimationRef.current = requestAnimationFrame(animateTickers)

    return () => {
      if (tickerAnimationRef.current) {
        cancelAnimationFrame(tickerAnimationRef.current)
      }
    }
  }, [])

  return (
    <section
      className="w-full py-10 select-none relative overflow-hidden"
      style={{ backgroundColor: '#fff' }}
    >
      {/* Top Microticker Strip - Scrolls Left */}
      <div className="w-full overflow-hidden mb-4" style={{ userSelect: 'none' }}>
        <div
          className="whitespace-nowrap text-sm font-bold tracking-wider py-2"
          style={{
            transform: `translateX(-${topTickerOffset}px)`,
            willChange: 'transform',
            color: '#000'
          }}
        >
          {tickerContent}
        </div>
      </div>

      {/* Scrolling Product Cards */}
      <div
        ref={scrollTrackRef}
        className="relative overflow-hidden"
        style={{
          zIndex: 1,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onMouseEnter={handleMouseEnter}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex gap-8 px-4"
          style={{
            transform: `translateX(-${scrollOffset}px)`,
            willChange: 'transform',
            transition: isDragging ? 'none' : undefined
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
                  pointerEvents: isDragging ? 'none' : 'auto'
                }}
                onClick={(e) => {
                  // Prevent navigation if this was a drag
                  if (dragStartRef.current && Math.abs(velocityRef.current) > 0.5) {
                    e.preventDefault()
                  }
                }}
              >
                <div className="aspect-square relative mb-4 bg-white rounded-md shadow-sm">
                  <Image
                    src={product.thumbnail || "/images/imgi_1_elementor-placeholder-image.png"}
                    alt={`${(product as any).brands?.[0]?.name || 'Product'} ${product.title}`}
                    fill
                    className="rounded-md object-contain"
                    loading="lazy"
                    quality={80}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    draggable={false}
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

      {/* Bottom Microticker Strip - Scrolls Right */}
      <div className="w-full overflow-hidden mt-4" style={{ userSelect: 'none' }}>
        <div
          className="whitespace-nowrap text-sm font-bold tracking-wider py-2"
          style={{
            transform: `translateX(${bottomTickerOffset}px)`,
            willChange: 'transform',
            color: '#000'
          }}
        >
          {tickerContent}
        </div>
      </div>

      {/* Screen reader announcement for auto-scrolling */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isAutoScrolling ? 'Auto-scrolling active. Hover or touch to pause.' : 'Scrolling paused'}
      </div>
    </section>
  )
}

export default NewArrivals
