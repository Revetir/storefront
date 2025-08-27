"use client"

import { Suspense, useState, useEffect } from "react"
import { HttpTypes } from "@medusajs/types"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import MobileRefinementPanel from "@modules/store/components/mobile-refinement-panel"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

import PaginatedProductsClient from "./paginated-products-client"

const StoreTemplate = ({
  // category, <--------------- will probably end up going here? Can look to fix with copilot idk
  sortBy,
  page,
  countryCode,
  type,
  maxPrice,
  products,
  region,
  totalPages,
  currentPage,
}: {
  // category?:ProductC
  sortBy?: SortOptions
  page?: string
  countryCode: string
  type?: string
  maxPrice?: string
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
  totalPages: number
  currentPage: number
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  const [isMobileRefinementOpen, setIsMobileRefinementOpen] = useState(false)

  // Debug logging
  useEffect(() => {
    console.log('StoreTemplate render:', {
      productsCount: products?.length || 0,
      totalPages,
      currentPage,
      hasRegion: !!region,
      windowWidth: typeof window !== 'undefined' ? window.innerWidth : 'SSR'
    })
  }, [products, totalPages, currentPage, region])

  return (
    <>
      <div className="py-6" data-testid="category-container">
        <div className="relative">
          {/* Mobile Layout - < 768px */}
          <div className="block md:hidden">
            <div className="flex justify-center w-full">
              <div className="w-full max-w-[768px] px-4">
                <div className="mb-6">
                  <div className="flex gap-4">
                    <button
                      onClick={() => setIsMobileRefinementOpen(true)}
                      className="px-4 py-2 border border-gray-300 text-sm uppercase tracking-wide hover:bg-gray-50"
                    >
                      Refine & Sort
                    </button>
                  </div>
                </div>
                
                {/* Debug indicator for mobile */}
                <div className="mb-4 p-2 bg-blue-100 text-blue-800 text-sm rounded">
                  Mobile Layout Active - Products: {products?.length || 0}
                </div>
                
                <div className="w-full">
                  <PaginatedProductsClient
                    products={products}
                    region={region}
                    totalPages={totalPages}
                    currentPage={currentPage}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tablet Layout - 768px - 1023px */}
          <div className="hidden md:block small:hidden">
            <div className="flex justify-center w-full">
              <div className="w-full max-w-[768px] px-4">
                <div className="mb-6">
                  <div className="flex justify-center">
                    <button
                      onClick={() => setIsMobileRefinementOpen(true)}
                      className="px-8 py-3 border border-gray-300 text-sm uppercase tracking-wide hover:bg-gray-50"
                    >
                      Refine & Sort
                    </button>
                  </div>
                </div>
                
                {/* Debug indicator for tablet */}
                <div className="mb-4 p-2 bg-green-100 text-green-800 text-sm rounded">
                  Tablet Layout Active - Products: {products?.length || 0}
                </div>
                
                <div className="w-full">
                  <PaginatedProductsClient
                    products={products}
                    region={region}
                    totalPages={totalPages}
                    currentPage={currentPage}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Small Desktop Layout - 1024px - 1724px */}
          <div className="hidden small:block large:hidden">
            <div className="flex justify-center w-full">
              <div className="w-full max-w-[1200px] px-6">
                <div className="flex gap-8">
                  {/* Compact Sidebar */}
                  <div className="w-64 flex-shrink-0">
                    <RefinementList sortBy={sort} selectedType={type} />
                  </div>
                  {/* Product Grid */}
                  <div className="flex-1">
                    {/* Debug indicator for small desktop */}
                    <div className="mb-4 p-2 bg-yellow-100 text-yellow-800 text-sm rounded">
                      Small Desktop Layout Active - Products: {products?.length || 0}
                    </div>
                    
                    <PaginatedProductsClient
                      products={products}
                      region={region}
                      totalPages={totalPages}
                      currentPage={currentPage}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Large Desktop Layout - >= 1725px */}
          <div className="hidden large:block">
            <div className="relative">
              {/* Desktop Refinement List - Original positioning */}
              <div className="absolute left-9 top-0 z-10">
                <RefinementList sortBy={sort} selectedType={type} />
              </div>
              
              <div className="flex justify-center w-full">
                <div className="w-full max-w-[1200px] px-4 md:px-6">
                  {/* Debug indicator for large desktop */}
                  <div className="mb-4 p-2 bg-red-100 text-red-800 text-sm rounded">
                    Large Desktop Layout Active - Products: {products?.length || 0}
                  </div>
                  
                  <PaginatedProductsClient
                    products={products}
                    region={region}
                    totalPages={totalPages}
                    currentPage={currentPage}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Refinement Panel */}
      <MobileRefinementPanel
        isOpen={isMobileRefinementOpen}
        onClose={() => setIsMobileRefinementOpen(false)}
        sortBy={sort}
        selectedType={type}
      />
    </>
  )
}

export default StoreTemplate
