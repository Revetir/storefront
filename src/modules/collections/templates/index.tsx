"use client"

import { Suspense, useState } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import MobileRefinementPanel from "@modules/store/components/mobile-refinement-panel"

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
  const [activeRefinementTab, setActiveRefinementTab] = useState<"refine" | "sort">("refine")

  return (
    <>
      <div className="py-6" data-testid="collection-container">
        <div className="relative">
          {/* Mobile Layout - < 768px */}
          <div className="md:hidden">
            <div className="flex justify-center w-full">
              <div className="max-w-[768px] px-4">
                <div className="mb-6">
                  <div className="flex gap-2 w-full">
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

          {/* Tablet Layout - 767px - 1022px */}
          <div className="hidden md:block small:hidden">
            <div className="flex justify-center w-full">
              <div className="max-w-[768px] px-4">
                <div className="mb-6">
                  <div className="flex gap-2 w-full">
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
                <PaginatedProductsClient
                  products={products}
                  region={region}
                  totalPages={totalPages}
                  currentPage={currentPage}
                />
              </div>
            </div>
          </div>

          {/* Small Desktop Layout - 1023px - 1725px */}
          <div className="hidden small:block large:hidden">
            <div className="flex justify-center w-full">
              <div className="max-w-[1200px] px-6">
                <div className="flex gap-8">
                  {/* Product Grid - Full Width */}
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
          </div>

          {/* Large Desktop Layout - > 1725px */}
          <div className="hidden large:block">
            <div className="relative">
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

      {/* Mobile Refinement Panel - Only for sorting now */}
      <MobileRefinementPanel
        isOpen={isMobileRefinementOpen}
        onClose={() => setIsMobileRefinementOpen(false)}
        sortBy={sort}
        initialTab={activeRefinementTab}
      />
    </>
  )
}

export default CollectionTemplate