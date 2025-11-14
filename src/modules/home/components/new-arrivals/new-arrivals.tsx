'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
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
  const [currentIndex, setCurrentIndex] = useState(0)
  const [products, setProducts] = useState(initialProducts)
  const [isLoading, setIsLoading] = useState(false)
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024)

  // Track window width for responsive carousel
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Determine how many products to show and advance based on screen size
  const getProductsPerSlide = () => {
    if (windowWidth < 768) return 1 // mobile
    if (windowWidth < 1024) return 2 // tablet
    return 3 // desktop
  }

  // Auto-slide effect - responsive advancement
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const productsPerSlide = getProductsPerSlide()
        const nextIndex = prevIndex + productsPerSlide
        if (nextIndex >= products.length) {
          // Loop back to the beginning
          return 0
        }
        return nextIndex
      })
    }, 3000) // Change slide every 3 seconds

    return () => clearInterval(interval)
  }, [products.length, windowWidth])

  const handleNext = async () => {
    if (isLoading) return
    
    setIsLoading(true)
    try {
      // Fetch more products - increased to 15
      const nextProducts = await getNewestProducts({ 
        countryCode, 
        limit: 15 
      })
      
      if (nextProducts.length > 3) {
        setProducts(nextProducts)
        setCurrentIndex(0)
      }
    } catch (error) {
      console.error('Error loading more products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Load more products if we don't have enough
  useEffect(() => {
    if (products.length < 15) {
      handleNext()
    }
  }, [])

  const productsPerSlide = getProductsPerSlide()
  const visibleProducts = products.slice(currentIndex, currentIndex + productsPerSlide)

  return (
    <section className="w-full px-4 md:px-16 py-10 select-none">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center">
          {/* Header - Left Side */}
          <div className="md:w-1/3 lg:w-1/3 mb-6 md:mb-0">
            <h2 className="text-2xl font-light text-center md:text-left" style={{ color: '#333' }}>SHOP NEW ARRIVALS</h2>
          </div>

          {/* Products Grid - Right Side */}
          <div className="md:w-2/3 lg:w-2/3">
            <div className="relative overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-transform duration-500 ease-in-out">
                {visibleProducts.map((product, index) => {
                  // Get proper pricing data like product preview does
                  let cheapestPrice
                  if (isAlgoliaProduct(product)) {
                    cheapestPrice = getAlgoliaProductPrice(product, countryCode)
                  } else {
                    const priceResult = getProductPrice({ product })
                    cheapestPrice = priceResult.cheapestPrice
                  }

                  return (
                    <Link
                      key={product.id}
                      href={getProductUrl((product as any).brands, product.handle || '')}
                      className="group hover:opacity-80 transition-opacity"
                    >
                    <div className="aspect-square relative mb-4 bg-white">
                      <Image
                        src={product.thumbnail || "/images/imgi_1_elementor-placeholder-image.png"}
                        alt={`${(product as any).brands?.[0]?.name || 'Product'} ${product.title}`}
                        fill
                        className="rounded-md object-contain"
                        priority={index < 3} // Priority loading for first 3 visible products
                        quality={80}
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
          </div>
        </div>
      </div>
    </section>
  )
}

export default NewArrivals