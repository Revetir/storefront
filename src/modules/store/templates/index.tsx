"use client"

import { Suspense, useState } from "react"
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
  const [activeRefinementTab, setActiveRefinementTab] = useState<"refine" | "sort">("refine")

  return (
    <>
      <div className="py-6" data-testid="category-container">
        <div className="relative">
<<<<<<< HEAD
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

          {/* Mobile Products - < 768px */}
          <div className="md:hidden">
            <div className="flex justify-center w-full">
              <div className="max-w-[768px] px-4">
                <PaginatedProductsClient
                  products={products}
                  region={region}
                  totalPages={totalPages}
                  currentPage={currentPage}
                />
              </div>
            </div>
          </div>

          {/* Tablet Layout - 767px - 1022px */}
          <div className="hidden md:block small:hidden">
=======
          {/* Mobile Layout - < 768px */}
          <div className="md:hidden">
>>>>>>> preview
            <div className="flex justify-center w-full">
              <div className="max-w-[768px] px-4">
                <div className="mb-6">
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => {
                        setActiveRefinementTab("refine")
                        setIsMobileRefinementOpen(true)
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-sm uppercase tracking-wide hover:bg-gray-50"
                    >
                      Refine
                    </button>
                    <button
                      onClick={() => {
                        setActiveRefinementTab("sort")
                        setIsMobileRefinementOpen(true)
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-sm uppercase tracking-wide hover:bg-gray-50"
                    >
                      Sort
                    </button>
                  </div>
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
              <div className="max-w-[768px] px-4">
                <div className="mb-6">
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => {
                        setActiveRefinementTab("refine")
                        setIsMobileRefinementOpen(true)
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-sm uppercase tracking-wide hover:bg-gray-50"
                    >
                      Refine
                    </button>
                    <button
                      onClick={() => {
                        setActiveRefinementTab("sort")
                        setIsMobileRefinementOpen(true)
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-sm uppercase tracking-wide hover:bg-gray-50"
                    >
                      Sort
                    </button>
                  </div>
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
              <div className="max-w-[1200px] px-6">
                <div className="flex gap-8">
                  {/* Compact Sidebar */}
                  <div className="w-64 flex-shrink-0">
                    <RefinementList sortBy={sort} selectedType={type} />
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

          {/* Large Desktop Layout - >= 1725px */}
          <div className="hidden large:block">
            <div className="relative">
              {/* Desktop Refinement List - Original positioning */}
              <div className="absolute left-9 top-0 z-10">
                <RefinementList sortBy={sort} selectedType={type} />
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
        selectedType={type}
        initialTab={activeRefinementTab}
      />
    </>
  )
}

export default StoreTemplate
