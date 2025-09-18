"use client"

import { Suspense, useState } from "react"
import { usePathname } from "next/navigation"

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
  // Detect if this is a brand page by checking the URL path structure
  const pathname = usePathname()
  const isBrandPage = pathname.includes('/brands/')
  
  // Extract brand slug from URL path for brand pages
  let selectedBrand: string | undefined = undefined
  if (isBrandPage) {
    const pathSegments = pathname.split('/')
    const brandsIndex = pathSegments.indexOf('brands')
    if (brandsIndex !== -1 && brandsIndex + 1 < pathSegments.length) {
      selectedBrand = pathSegments[brandsIndex + 1]
    }
  }
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  const [isMobileRefinementOpen, setIsMobileRefinementOpen] = useState(false)
  const [activeRefinementTab, setActiveRefinementTab] = useState<"refine" | "sort">("refine")

  return (
    <>
      <div className="py-6" data-testid="category-container">
        <div className="w-full">
          {/* Mobile/Tablet Layout - Show mobile refinement buttons */}
          <div className="md:hidden">
            <div className="w-full max-w-[1440px] mx-auto px-4">
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

          {/* Desktop Layout - Unified flex layout */}
          <div className="hidden md:block">
            <div className="w-full max-w-[1440px] mx-auto px-4 md:px-6">
              <div className="flex gap-8 w-full">
                {/* Sidebar - Fixed width, positioned on left */}
                <div className="w-64 flex-shrink-0">
                  <RefinementList sortBy={sort} selectedBrand={selectedBrand} />
                </div>
                
                {/* Product Grid - Takes remaining space (flex-1) */}
                <div className="flex-1 w-full">
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
        selectedBrand={selectedBrand}
        initialTab={activeRefinementTab}
      />
    </>
  )
}

export default CategoryTemplate
