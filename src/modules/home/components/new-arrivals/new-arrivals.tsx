'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { getNewestProducts } from '@lib/data/products'
import { HttpTypes } from '@medusajs/types'
import { getAlgoliaProductPrice, isAlgoliaProduct } from '@lib/util/get-algolia-product-price'
import { getProductPrice } from '@lib/util/get-product-price'
import { Text, clx } from "@medusajs/ui"

interface NewArrivalsProps {
  countryCode: string
  initialProducts: HttpTypes.StoreProduct[]
}

const NewArrivals = ({ countryCode, initialProducts }: NewArrivalsProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [products, setProducts] = useState(initialProducts)
  const [isLoading, setIsLoading] = useState(false)

  // Auto-slide effect - replace all three products at once
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        // Move by 3 positions (replace all three products)
        const nextIndex = prevIndex + 3
        if (nextIndex >= products.length) {
          // Loop back to the beginning
          return 0
        }
        return nextIndex
      })
    }, 3000) // Change slide every 3 seconds

    return () => clearInterval(interval)
  }, [products.length])

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

  const visibleProducts = products.slice(currentIndex, currentIndex + 3)

  return (
    <section className="w-full px-4 md:px-16 py-10 select-none">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center">
          {/* Header - Left Side */}
          <div className="lg:w-1/3">
            <h2 className="text-3xl font-bold text-left mb-4" style={{ color: '#333' }}>NEW ARRIVALS</h2>
            <Link 
              href="/store?sortBy=created_at"
              className="inline-block px-6 py-3 rounded-md transition-colors w-fit"
              style={{ backgroundColor: '#333', color: 'white' }}
              onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#555'}
              onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#333'}
            >
              SHOP ALL
            </Link>
          </div>

          {/* Products Grid - Right Side */}
          <div className="lg:w-2/3">
            <div className="relative overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 transition-transform duration-500 ease-in-out">
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
                      href={(product as any).brand?.slug 
                        ? `/products/${(product as any).brand.slug}-${product.handle}`
                        : `/products/${product.handle}`}
                      className="group hover:opacity-80 transition-opacity"
                    >
                    <div className="aspect-square relative mb-4">
                      <Image
                        src={product.thumbnail || "/images/imgi_1_elementor-placeholder-image.png"}
                        alt={`${(product as any).brand?.name || 'Product'} ${product.title}`}
                        fill
                        className="rounded-md object-cover"
                        priority={index < 3} // Priority loading for first 3 visible products
                        quality={80}
                        unoptimized={true}
                      />
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-gray-500 mb-1 uppercase tracking-wide">
                        {(product as any).brand?.name || 'Product'}
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