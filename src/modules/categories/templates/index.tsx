"use client"

import { Suspense, useState } from "react"
import { usePathname } from "next/navigation"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import MobileRefinementPanel from "@modules/store/components/mobile-refinement-panel"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

import PaginatedProductsClient from "@modules/store/templates/paginated-products-client"
import EditorialIntro from "@modules/store/components/editorial-intro"

const CategoryTemplate = ({
  category,
  sortBy,
  page,
  countryCode,
  products,
  region,
  totalPages,
  currentPage,
  editorialTitle,
  editorialBlurb,
}: {
  category: any
  sortBy?: SortOptions
  page?: string
  countryCode: string
  products: any[]
  region: any
  totalPages: number
  currentPage: number
  editorialTitle?: string
  editorialBlurb?: string
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
          {/* Mobile/Tablet Layout - Show mobile refinement buttons when grid is 2 columns */}
          <div className="lg:hidden">
            <div className="w-full max-w-[1440px] mx-auto px-4">
              {/* Editorial Intro - Show above refinement bar on mobile */}
              <EditorialIntro 
                title={editorialTitle || ""} 
                blurb={editorialBlurb} 
              />
              
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
                  editorialTitle={editorialTitle}
                  editorialBlurb={editorialBlurb}
                  showEditorialIntro={false}
                />
              </div>
            </div>
          </div>

          {/* Desktop Layout - Three-part layout: left sidebar + centered products + right sidebar */}
          <div className="hidden lg:block">
            <div className="w-full flex">
              {/* Left Sidebar - Fixed width, positioned close to left edge */}
              <div className="w-64 flex-shrink-0 px-4">
                <RefinementList sortBy={sort} selectedBrand={selectedBrand} />
              </div>
              
              {/* Center Container - Products grid with healthy margins */}
              <div className="flex-1 px-6 pl-12">
                <PaginatedProductsClient
                  products={products}
                  region={region}
                  totalPages={totalPages}
                  currentPage={currentPage}
                  editorialTitle={editorialTitle}
                  editorialBlurb={editorialBlurb}
                />
              </div>
              
              {/* Right Sidebar - Smaller width since it's only whitespace and looks visually weird until we add content */}
              <div className="w-32 flex-shrink-0 px-4">
                {/* Empty for now - future refinements can go here */}
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
