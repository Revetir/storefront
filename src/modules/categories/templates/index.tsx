"use client"

import { notFound } from "next/navigation"
import { Suspense, useState } from "react"

import InteractiveLink from "@modules/common/components/interactive-link"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import MobileRefinementPanel from "@modules/store/components/mobile-refinement-panel"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProductsClient from "@modules/store/templates/paginated-products-client"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

import { Category } from "@lib/data/categories"
import { HttpTypes } from "@medusajs/types"

export default function CategoryTemplate({
  category,
  sortBy,
  page,
  type,
  countryCode,
  categoryPath,
  allCategories,
  products,
  region,
  totalPages,
  currentPage,
}: {
  category: Category
  sortBy?: SortOptions
  page?: string
  type?: string
  countryCode: string
  categoryPath: string[]
  allCategories: Category[]
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
  totalPages: number
  currentPage: number
}) {
  if (!category || !countryCode) notFound()

  const pageNumber = page ? parseInt(page, 10) : 1
  const sort = sortBy || "created_at"
  const selectedGender = category.gender
  const [isMobileRefinementOpen, setIsMobileRefinementOpen] = useState(false)

  // Build proper breadcrumb trail for flat URLs by traversing up the category hierarchy
  const buildBreadcrumbs = () => {
    const breadcrumbs: { name: string; path: string }[] = []
    
    // For flat URLs, we need to build breadcrumbs by traversing up the parent hierarchy
    const buildParentChain = (cat: Category): Category[] => {
      const chain: Category[] = []
      
      // Find parent categories by traversing the tree
      const findParent = (categories: Category[], targetId: string): Category | undefined => {
        for (const category of categories) {
          if (category.id === targetId) {
            return category
          }
          if (category.children && category.children.length > 0) {
            const found = findParent(category.children, targetId)
            if (found) return found
          }
        }
        return undefined
      }
      
      let currentCat = cat
      while (currentCat.parent_category_id) {
        const parent = findParent(allCategories, currentCat.parent_category_id)
        if (parent) {
          chain.unshift(parent)
          currentCat = parent
        } else {
          break
        }
      }
      
      return chain
    }
    
    const parentChain = buildParentChain(category)
    
    // Build breadcrumbs from parent chain (excluding the current category)
    parentChain.forEach(parent => {
      breadcrumbs.push({
        name: parent.name,
        path: `/categories/${parent.handle}`
      })
    })
    
    return breadcrumbs
  }
  
  const breadcrumbs = buildBreadcrumbs()

  // Filter direct children by gender (include unisex)
  const filteredChildren = (category.children || []).filter(
    (c) => c.gender === selectedGender || c.gender === "unisex"
  )

  function collectCategoryIds(cat: Category): string[] {
    return [cat.id, ...(cat.children || []).flatMap(collectCategoryIds)]
  }
  const allCategoryIds = collectCategoryIds(category)

  return (
    <>
      <div className="py-6" data-testid="category-container">
        <div className="relative">
          {/* Desktop Refinement List */}
          <div className="hidden md:block absolute left-9 top-0 z-10">
            <RefinementList sortBy={sort} data-testid="sort-by-container" />
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
              {/* Main content */}
              {/* Description */}
              {category.description && (
                <div className="mb-8 text-base-regular">
                  <p>{category.description}</p>
                </div>
              )}
              {/* Products (with gender filter) */}
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
