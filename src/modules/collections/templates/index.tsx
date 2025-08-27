"use client"

import { Suspense, useState } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import MobileRefinementPanel from "@modules/store/components/mobile-refinement-panel"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

import PaginatedProductsClient from "@modules/store/templates/paginated-products-client"

const CollectionTemplate = ({
  collection,
  sortBy,
  page,
  countryCode,
  products,
  region,
  totalPages,
  currentPage,
}: {
  collection: any
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
      <div className="py-6" data-testid="collection-container">
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

          {/* Tablet Layout - 768px - 1024px */}
          <div className="hidden md:block small:hidden">
            <div className="flex justify-center w-full">
              <div className="max-w-[768px] px-4">
                <div className="mb-6">
                  <RefinementList sortBy={sort} />
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

          {/* Small Desktop Layout - 1024px - 1440px */}
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

          {/* Large Desktop Layout - ≥ 1440px */}
          <div className="hidden large:block">
            <div className="flex justify-center w-full">
              <div className="max-w-[1400px] px-8">
                <div className="flex gap-12">
                  {/* Full Sidebar */}
                  <div className="w-80 flex-shrink-0">
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

export default CollectionTemplate
