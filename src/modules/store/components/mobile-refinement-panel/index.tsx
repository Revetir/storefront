"use client"

import React, { useState } from "react"
import X from "@modules/common/icons/x"
import ChevronDown from "@modules/common/icons/chevron-down"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import CategorySidebar from "@modules/layout/components/category-sidebar"
import TypeRefinementList from "@modules/store/components/refinement-list/product-types"

interface MobileRefinementPanelProps {
  isOpen: boolean
  onClose: () => void
  sortBy: SortOptions
  selectedType?: string
  initialTab?: "refine" | "sort"
}

const MobileRefinementPanel: React.FC<MobileRefinementPanelProps> = ({
  isOpen,
  onClose,
  sortBy,
  selectedType,
  initialTab = "refine"
}) => {
  const [activeTab, setActiveTab] = useState<"refine" | "sort">(initialTab)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)
      return params.toString()
    },
    [searchParams]
  )

  const setQueryParams = (name: string, value: string) => {
    const query = createQueryString(name, value)
    router.push(`${pathname}?${query}`)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={onClose}>
      <div 
        className="fixed bottom-0 left-0 right-0 h-3/4 bg-white shadow-lg transform transition-transform duration-300 ease-in-out rounded-t-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab("refine")}
                className={`text-sm font-medium uppercase tracking-wide ${
                  activeTab === "refine" 
                    ? "text-black border-b-2 border-black" 
                    : "text-gray-500"
                }`}
              >
                Refine
              </button>
              <button
                onClick={() => setActiveTab("sort")}
                className={`text-sm font-medium uppercase tracking-wide ${
                  activeTab === "sort" 
                    ? "text-black border-b-2 border-black" 
                    : "text-gray-500"
                }`}
              >
                Sort
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === "refine" ? (
              <div className="space-y-6">
                {/* Categories */}
                <div>
                  <h3 className="text-sm font-medium uppercase tracking-wide mb-3">Categories</h3>
                  <CategorySidebar className="border-r-0 p-0 w-full" />
                </div>
                
                {/* Brands */}
                <div>
                  <h3 className="text-sm font-medium uppercase tracking-wide mb-3">Brands</h3>
                  <TypeRefinementList selectedType={selectedType} />
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-sm font-medium uppercase tracking-wide mb-3">Sort By</h3>
                <div className="space-y-2">
                  {[
                    { value: "created_at", label: "Newest" },
                    { value: "price_asc", label: "Price: Low to High" },
                    { value: "price_desc", label: "Price: High to Low" }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setQueryParams("sortBy", option.value)
                        onClose()
                      }}
                      className={`w-full text-left p-3 rounded ${
                        sortBy === option.value
                          ? "bg-black text-white"
                          : "bg-gray-100 text-black hover:bg-gray-200"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MobileRefinementPanel
