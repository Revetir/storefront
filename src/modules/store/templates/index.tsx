"use client"

import { Suspense, useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { useSearchParams } from "next/navigation"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import MobileRefinementPanel from "@modules/store/components/mobile-refinement-panel"
import ColorRefinementList from "@modules/store/components/refinement-list/product-colors"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

import PaginatedProductsClient from "./paginated-products-client"

const StoreTemplate = ({
  // category, <--------------- will probably end up going here? Can look to fix with copilot idk
  sortBy,
  page,
  countryCode,
  brand,
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
  brand?: string
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
  const searchParams = useSearchParams()
  const selectedColor = searchParams.get('color') || undefined

  return (
    <>
      <div className="py-6" data-testid="category-container">
        <div className="relative">
          {/* Mobile Layout - < 768px */}
          <div className="md:hidden">
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

          {/* Tablet Layout - md to lg (768px - 1024px) */}
          <div className="hidden md:block lg:hidden">
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

          {/* Small Desktop Layout - lg to 2xl (1024px - 1536px) */}
          <div className="hidden lg:block 2xl:hidden">
            <div className="relative">
              <div className="flex justify-center w-full">
                <div className="max-w-[1200px] px-6">
                  <div className="flex gap-8">
                    {/* Compact Sidebar */}
                    <div className="w-64 flex-shrink-0">
                      <RefinementList sortBy={sort} selectedBrand={brand} />
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

              {/* Color Filter - Right Side */}
              <div className="absolute right-9 top-0 z-10">
                <ColorRefinementList selectedColor={selectedColor} />
              </div>
            </div>
          </div>

          {/* Large Desktop Layout - 2xl+ (>= 1536px) */}
          <div className="hidden 2xl:block">
            <div className="relative">
              {/* Desktop Refinement List - Left Side */}
              <div className="absolute left-9 top-0 z-10">
                <RefinementList sortBy={sort} selectedBrand={brand} />
              </div>

              {/* Color Filter - Right Side */}
              <div className="absolute right-9 top-0 z-10">
                <ColorRefinementList selectedColor={selectedColor} />
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
        selectedBrand={brand}
        selectedColor={selectedColor}
        initialTab={activeRefinementTab}
      />
    </>
  )
}

export default StoreTemplate
