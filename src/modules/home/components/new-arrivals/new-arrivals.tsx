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

  // Mobile SHOP ALL button state
  const [isExpanded, setIsExpanded] = useState(false)

  // Scroll state
  const [scrollOffset, setScrollOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [velocity, setVelocity] = useState(0)

  // Refs
  const scrollTrackRef = useRef<HTMLDivElement>(null)
  const dragContainerRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  const dragStartRef = useRef<{ x: number; offset: number; time: number } | null>(null)
  const lastDragRef = useRef<{ x: number; time: number } | null>(null)
  const velocityRef = useRef(0)
  const lastDragDistanceRef = useRef(0)

  // Collapse button on scroll (mobile)
  useEffect(() => {
    if (!isExpanded) return

    const handleScroll = () => {
      setIsExpanded(false)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [isExpanded])

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

  // Calculate max scroll width (no infinite scroll)
  const cardWidth = 350 // approximate max card width including gap
  const maxScroll = Math.max(0, (products.length * cardWidth) - (typeof window !== 'undefined' ? window.innerWidth : 1440))

  // Momentum animation loop with boundaries
  useEffect(() => {
    const animate = () => {
      setScrollOffset(prevOffset => {
        let newOffset = prevOffset

        if (velocityRef.current !== 0 && !isDragging) {
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

        // Enforce scroll boundaries (no infinite loop)
        if (newOffset < 0) {
          velocityRef.current = 0
          return 0
        } else if (newOffset > maxScroll) {
          velocityRef.current = 0
          return maxScroll
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
  }, [isDragging, maxScroll])

  // Mouse/Desktop drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Allow drag to start from anywhere, including links
    setIsDragging(true)
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
    e.stopPropagation()
  }, [scrollOffset])

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

    e.preventDefault()
  }, [isDragging])

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return

    // Store drag distance BEFORE clearing dragStartRef
    if (dragStartRef.current) {
      lastDragDistanceRef.current = Math.abs(scrollOffset - dragStartRef.current.offset)
    }

    setIsDragging(false)
    dragStartRef.current = null

    // Velocity is already set from handleMouseMove
    setVelocity(velocityRef.current)
  }, [isDragging, scrollOffset])

  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      setIsDragging(false)
      dragStartRef.current = null
    }
  }, [isDragging])

  // Touch handlers for tablet support
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0]
    setIsDragging(true)
    velocityRef.current = 0
    setVelocity(0)

    dragStartRef.current = {
      x: touch.clientX,
      offset: scrollOffset,
      time: Date.now()
    }
    lastDragRef.current = {
      x: touch.clientX,
      time: Date.now()
    }
  }, [scrollOffset])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !dragStartRef.current || !lastDragRef.current) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - dragStartRef.current.x
    const newOffset = dragStartRef.current.offset - deltaX

    setScrollOffset(newOffset)

    // Calculate velocity for momentum
    const timeDelta = Date.now() - lastDragRef.current.time
    if (timeDelta > 0) {
      const xDelta = touch.clientX - lastDragRef.current.x
      velocityRef.current = -(xDelta / timeDelta) * 16
    }

    lastDragRef.current = {
      x: touch.clientX,
      time: Date.now()
    }

    e.preventDefault()
  }, [isDragging, scrollOffset])

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return

    // Store drag distance for onClick check
    if (dragStartRef.current) {
      lastDragDistanceRef.current = Math.abs(scrollOffset - dragStartRef.current.offset)
    }

    setIsDragging(false)
    dragStartRef.current = null
    setVelocity(velocityRef.current)
  }, [isDragging, scrollOffset])

  // Global mouse up listener (in case mouse up happens outside component)
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false)
        dragStartRef.current = null
      }
    }

    window.addEventListener('mouseup', handleGlobalMouseUp)
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp)
  }, [isDragging])

  // Attach touch listeners with passive: false to allow preventDefault
  useEffect(() => {
    const element = dragContainerRef.current
    if (!element) return

    element.addEventListener('touchstart', handleTouchStart as any, { passive: false })
    element.addEventListener('touchmove', handleTouchMove as any, { passive: false })
    element.addEventListener('touchend', handleTouchEnd as any, { passive: false })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart as any)
      element.removeEventListener('touchmove', handleTouchMove as any)
      element.removeEventListener('touchend', handleTouchEnd as any)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  return (
    <section
      className="w-full py-10 select-none relative overflow-hidden"
      style={{ backgroundColor: '#fff' }}
    >
      {/* Desktop: Fixed header and scrolling products side by side */}
      <div className="hidden lg:flex gap-8 px-4">
        {/* Fixed Desktop Header - matches image height only */}
        <div className="flex-shrink-0 flex flex-col aspect-square self-start" style={{ width: 'clamp(280px, 25vw, 350px)' }}>
          {/* Top bar */}
          <div className="w-full h-[1px] bg-black"></div>

          {/* NEW ARRIVALS text - close to top bar */}
          <h2 className="text-4xl font-light mt-3">NEW ARRIVALS</h2>

          {/* White space between */}
          <div className="flex-1"></div>

          {/* Shop links - close to bottom bar */}
          <div className="flex justify-between items-center gap-4 mb-3">
            <Link
              href="/men"
              className="uppercase tracking-wide text-gray-700 hover:underline hover:text-black text-[clamp(0.625rem,1.2vw,0.875rem)]"
            >
              SHOP MENSWEAR
            </Link>
            <Link
              href="/women"
              className="uppercase tracking-wide text-gray-700 hover:underline hover:text-black text-[clamp(0.625rem,1.2vw,0.875rem)]"
            >
              SHOP WOMENSWEAR
            </Link>
          </div>

          {/* Bottom bar */}
          <div className="w-full h-[1px] bg-black"></div>
        </div>

        {/* Scrolling Product Cards Container */}
        <div
          ref={scrollTrackRef}
          className="relative overflow-hidden flex-1"
        >
          <div
            ref={dragContainerRef}
            style={{
              cursor: isDragging ? 'grabbing' : 'grab',
              userSelect: 'none'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            <div
              className="flex gap-8"
              style={{
                transform: `translateX(-${scrollOffset}px)`,
                willChange: 'transform',
                transition: isDragging ? 'none' : undefined
              }}
            >
          {products.map((product, index) => {
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
                className="group flex-shrink-0"
                style={{
                  width: 'clamp(280px, 25vw, 350px)',
                  pointerEvents: isDragging ? 'none' : 'auto'
                }}
                onClick={(e) => {
                  // Prevent navigation if dragged more than 10px
                  if (lastDragDistanceRef.current > 10) {
                    e.preventDefault()
                  }
                  // Reset after brief delay
                  setTimeout(() => { lastDragDistanceRef.current = 0 }, 100)
                }}
                onDragStart={(e) => e.preventDefault()}
              >
                <div className="aspect-square relative mb-4 bg-white">
                  <Image
                    src={product.thumbnail || "/images/imgi_1_elementor-placeholder-image.png"}
                    alt={`${(product as any).brands?.[0]?.name || 'Product'} ${product.title}`}
                    fill
                    className="object-contain"
                    loading="lazy"
                    quality={80}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    draggable={false}
                  />
                </div>
                <div className="text-left opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
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
        </div>
      </div>

      {/* Mobile/Tablet: Horizontal header with scrolling products */}
      <div className="lg:hidden flex flex-col gap-0">
          {/* Horizontal Header Section */}
          <div className="flex items-center justify-between px-4 mb-6">
            {/* Left: NEW IN on mobile, NEW ARRIVALS on tablet */}
            <h2 className="text-3xl font-light">
              <span className="md:hidden">NEW IN</span>
              <span className="hidden md:inline">NEW ARRIVALS</span>
            </h2>

            {/* Right: Category buttons - separated on md, combined on mobile */}
            <nav
              className="flex-shrink-0"
              style={{ userSelect: "none" }}
              aria-label="Shop new arrivals"
            >
              {/* Mobile: Expandable SHOP ALL button */}
              <div className="md:hidden">
                {!isExpanded ? (
                  <button
                    onClick={() => setIsExpanded(true)}
                    style={{
                      padding: "0.5rem 1rem",
                      textAlign: "center",
                      textTransform: "uppercase",
                      fontWeight: "300",
                      fontSize: "0.75rem",
                      color: "#000",
                      backgroundColor: "transparent",
                      border: "1px solid #000",
                      cursor: "pointer",
                      transition: "all 300ms ease-in-out",
                      whiteSpace: "nowrap",
                    }}
                    aria-label="Shop all new arrivals"
                    aria-expanded={isExpanded}
                  >
                    SHOP ALL
                  </button>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      border: "1px solid #000",
                      animation: "slideInFromRight 300ms ease-out",
                    }}
                    role="group"
                    aria-label="Shop new arrivals by category"
                  >
                    <Link
                      href="/men"
                      style={{
                        padding: "0.5rem 0.75rem",
                        textAlign: "center",
                        textTransform: "uppercase",
                        fontWeight: "300",
                        fontSize: "0.65rem",
                        color: "#000",
                        textDecoration: "none",
                        cursor: "pointer",
                        borderRight: "1px solid #000",
                        transition: "background-color 200ms ease",
                        whiteSpace: "nowrap",
                      }}
                      aria-label="Shop new menswear"
                    >
                      MENSWEAR
                    </Link>
                    <Link
                      href="/women"
                      style={{
                        padding: "0.5rem 0.75rem",
                        textAlign: "center",
                        textTransform: "uppercase",
                        fontWeight: "300",
                        fontSize: "0.65rem",
                        color: "#000",
                        textDecoration: "none",
                        cursor: "pointer",
                        transition: "background-color 200ms ease",
                        whiteSpace: "nowrap",
                      }}
                      aria-label="Shop new womenswear"
                    >
                      WOMENSWEAR
                    </Link>
                  </div>
                )}
              </div>

              {/* Tablet (md): Separate buttons */}
              <div
                className="hidden md:flex gap-2"
                role="group"
                aria-label="Shop new arrivals by category"
              >
                <Link
                  href="/men"
                  style={{
                    padding: "0.5rem 0.75rem",
                    textAlign: "center",
                    textTransform: "uppercase",
                    fontWeight: "300",
                    fontSize: "0.65rem",
                    color: "#000",
                    textDecoration: "none",
                    cursor: "pointer",
                    border: "1px solid #000",
                    transition: "background-color 200ms ease",
                    whiteSpace: "nowrap",
                  }}
                  aria-label="Shop new menswear"
                >
                  SHOP MENSWEAR
                </Link>
                <Link
                  href="/women"
                  style={{
                    padding: "0.5rem 0.75rem",
                    textAlign: "center",
                    textTransform: "uppercase",
                    fontWeight: "300",
                    fontSize: "0.65rem",
                    color: "#000",
                    textDecoration: "none",
                    cursor: "pointer",
                    border: "1px solid #000",
                    transition: "background-color 200ms ease",
                    whiteSpace: "nowrap",
                  }}
                  aria-label="Shop new womenswear"
                >
                  SHOP WOMENSWEAR
                </Link>
              </div>
            </nav>
          </div>

          {/* Scrolling products container */}
          <div className="overflow-x-auto new-arrivals-scroll pb-4">
            <div className="flex gap-8 px-4">
            {products.map((product, index) => {
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
                  key={`${product.id}-mobile-${index}`}
                  href={getProductUrl((product as any).brands, product.handle || '')}
                  className="group flex-shrink-0"
                  style={{
                    width: 'clamp(280px, 25vw, 350px)',
                  }}
                >
                  <div className="aspect-square relative mb-4 bg-white">
                    <Image
                      src={product.thumbnail || "/images/imgi_1_elementor-placeholder-image.png"}
                      alt={`${(product as any).brands?.[0]?.name || 'Product'} ${product.title}`}
                      fill
                      className="object-contain"
                      loading="lazy"
                      quality={80}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      draggable={false}
                    />
                  </div>
                  <div className="text-left opacity-100 transition-opacity duration-300">
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
        </div>
    </section>
  )
}

export default NewArrivals
