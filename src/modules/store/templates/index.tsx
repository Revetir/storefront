"use client"

import { Suspense, useState } from "react"

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

  return (
    <>
      <div className="py-6" data-testid="category-container">
        <div className="relative">
          {/* Desktop Refinement List */}
          <div className="hidden md:block absolute left-9 top-0 z-10">
            <RefinementList sortBy={sort} selectedType={type} />
          </div>
          
          {/* Mobile Refinement Buttons */}
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
          
          <div className="flex justify-center w-full">
            <div className="max-w-[1200px] px-4 md:px-6">
              {/* <div className="mb-8 text-2xl-semi">
                <h1 data-testid="store-page-title">All products</h1>
              </div> */}
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
