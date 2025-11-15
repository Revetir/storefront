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
  const [isDragging, setIsDragging] = useState(false)
  const [velocity, setVelocity] = useState(0)

  // Refs
  const scrollTrackRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number | null>(null)
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

  // Momentum animation loop
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
  }, [isDragging, totalWidth])

  // Mouse/Desktop drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Prevent dragging on links/buttons
    if ((e.target as HTMLElement).closest('a')) return

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

    setIsDragging(false)
    dragStartRef.current = null

    // Velocity is already set from handleMouseMove
    setVelocity(velocityRef.current)
  }, [isDragging])

  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      setIsDragging(false)
      dragStartRef.current = null
    }
  }, [isDragging])

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

  // Triple the products array for seamless infinite loop
  const infiniteProducts = [...products, ...products, ...products]

  return (
    <section
      className="w-full py-10 select-none relative overflow-hidden"
      style={{ backgroundColor: '#fff' }}
    >
      {/* Desktop: Horizontal heading with parallel bars */}
      <div className="hidden md:flex items-start gap-6 px-4 mb-8">
        {/* Heading section with bars */}
        <div className="flex flex-col" style={{ width: 'clamp(280px, 25vw, 350px)' }}>
          {/* Top bar */}
          <div className="w-full h-[1px] bg-black mb-3"></div>

          {/* NEW ARRIVALS text */}
          <h2 className="text-4xl font-bold tracking-tight mb-auto">NEW ARRIVALS</h2>

          {/* VIEW ALL link */}
          <Link
            href="/men"
            className="text-sm uppercase tracking-wide hover:underline mb-3 inline-block"
          >
            VIEW ALL
          </Link>

          {/* Bottom bar */}
          <div className="w-full h-[1px] bg-black"></div>
        </div>
      </div>

      {/* Mobile: Vertical spine heading */}
      <div className="md:hidden absolute left-0 top-0 bottom-0 flex items-center z-10 pl-2">
        <div className="flex flex-col items-center border-t border-r border-b border-black py-4 px-2">
          {'NEW ARRIVALS'.split('').map((letter, index) => (
            <span
              key={index}
              className="text-sm font-bold tracking-wider"
              style={{ writingMode: 'horizontal-tb' }}
            >
              {letter === ' ' ? '\u00A0' : letter}
            </span>
          ))}
        </div>
      </div>

      {/* Scrolling Product Cards */}
      <div
        ref={scrollTrackRef}
        className="relative overflow-hidden md:overflow-visible"
      >
        {/* Desktop: Custom drag scrolling */}
        <div
          className="hidden md:block"
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
                className="group flex-shrink-0"
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
                onDragStart={(e) => e.preventDefault()}
              >
                <div className="aspect-square relative mb-4 bg-white rounded-md">
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

        {/* Mobile: Native horizontal scrolling */}
        <div className="md:hidden overflow-x-auto new-arrivals-scroll pb-4">
          <div className="flex gap-8 pl-20 pr-4">
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
                  <div className="aspect-square relative mb-4 bg-white rounded-md">
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
