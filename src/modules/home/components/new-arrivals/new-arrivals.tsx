'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { getNewestProducts } from '@lib/data/products'
import { HttpTypes } from '@medusajs/types'

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
    <section className="w-full px-4 md:px-16 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center">
          {/* Header - Left Side */}
          <div className="lg:w-1/3">
            <h2 className="text-3xl font-bold text-left mb-4">NEW ARRIVALS</h2>
            <Link 
              href="/store?sortBy=created_at"
              className="inline-block bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors w-fit"
            >
              SHOP ALL
            </Link>
          </div>

          {/* Products Grid - Right Side */}
          <div className="lg:w-2/3">
            <div className="relative overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 transition-transform duration-500 ease-in-out">
                {visibleProducts.map((product, index) => (
                  <Link 
                    key={product.id} 
                    href={`/products/${product.handle}`}
                    className="group hover:opacity-80 transition-opacity"
                  >
                    <div className="aspect-square relative mb-4">
                      <Image
                        src={product.thumbnail || "/images/imgi_1_elementor-placeholder-image.png"}
                        alt={`${product.type?.value || 'Product'} ${product.title}`}
                        fill
                        className="rounded-md object-cover"
                        priority={index < 3} // Priority loading for first 3 visible products
                        quality={80}
                        unoptimized={true}
                      />
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-gray-500 mb-1 uppercase tracking-wide">
                        {product.type?.value || 'Product'}
                      </p>
                      <h3 className="font-medium text-lg mb-1">{product.title}</h3>
                      <p className="text-gray-600">
                        {product.variants?.[0]?.calculated_price?.calculated_amount 
                          ? `$${product.variants[0].calculated_price.calculated_amount}`
                          : 'Price not available'
                        }
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default NewArrivals