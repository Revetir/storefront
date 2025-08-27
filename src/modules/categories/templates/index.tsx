"use client"

import { Suspense, useState } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import MobileRefinementPanel from "@modules/store/components/mobile-refinement-panel"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

import PaginatedProductsClient from "@modules/store/templates/paginated-products-client"

const CategoryTemplate = ({
  category,
  sortBy,
  page,
  countryCode,
  products,
  region,
  totalPages,
  currentPage,
}: {
  category: any
  sortBy?: SortOptions
  page?: string
  countryCode: string
  products: any[]
  region: any
  totalPages: number
  currentPage: number
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  const [isMobileRefinementOpen, setIsMobileRefinementOpen] = useState(false)

  return (
    <>
      <div className="py-6" data-testid="category-container">
        <div className="relative">
          {/* Mobile Refinement Buttons - < 768px */}
          <div className="md:hidden flex justify-center mb-6">
            <div className="flex gap-4">
              <button
                onClick={() => setIsMobileRefinementOpen(true)}
                className="px-4 py-2 border border-gray-300 text-sm uppercase tracking-wide hover:bg-gray-50"
              >
                Refine & Sort
              </button>
            </div>
          </div>

          {/* Tablet Layout - 767px - 1022px */}
          <div className="hidden md:block small:hidden">
            <div className="flex justify-center w-full">
              <div className="max-w-[768px] px-4">
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
                <PaginatedProductsClient
                  products={products}
                  region={region}
                  totalPages={totalPages}
                  currentPage={currentPage}
                />
              </div>
            </div>
          </div>

          {/* Small Desktop Layout - 1023px - 1670px */}
          <div className="hidden small:block large:hidden">
            <div className="flex justify-center w-full">
              <div className="max-w-[1200px] px-6">
                <div className="flex gap-8">
                  {/* Compact Sidebar */}
                  <div className="w-64 flex-shrink-0">
                    <RefinementList sortBy={sort} />
                  </div>
                  {/* Product Grid */}
                  <div className="flex-1">
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

          {/* Large Desktop Layout - > 1670px (Original Layout) */}
          <div className="hidden large:block">
            <div className="relative">
              {/* Desktop Refinement List - Original positioning */}
              <div className="absolute left-9 top-0 z-10">
                <RefinementList sortBy={sort} />
              </div>
              
              <div className="flex justify-center w-full">
                <div className="max-w-[1200px] px-4 md:px-6">
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
      />
    </>
  )
}

export default CategoryTemplate
