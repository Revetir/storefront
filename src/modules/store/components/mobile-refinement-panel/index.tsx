"use client"

import React, { useState, useEffect } from "react"
import X from "@modules/common/icons/x"
import ChevronDown from "@modules/common/icons/chevron-down"
import { usePathname, useRouter, useSearchParams, useParams } from "next/navigation"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { listBrands, Brand } from "@lib/data/brands"
import { Category } from "@lib/data/categories"

interface MobileRefinementPanelProps {
  isOpen: boolean
  onClose: () => void
  sortBy: SortOptions
  selectedBrand?: string
  selectedColor?: string
  initialTab?: "refine" | "sort"
}

interface SelectedFilters {
  brand?: string
  category?: string
  color?: string
}

type SectionTab = 'brands' | 'categories' | 'colors'

const COLOR_MAPPING = [
  'Black', 'White', 'Gray', 'Blue', 'Red', 'Brown', 'Green', 'Pink',
  'Purple', 'Yellow', 'Orange', 'Gold', 'Silver'
]

const COLOR_STYLES: Record<string, string> = {
  'Black': 'text-black',
  'White': 'text-gray-300',
  'Gray': 'text-gray-500',
  'Blue': 'text-blue-600',
  'Red': 'text-red-600',
  'Brown': 'text-amber-700',
  'Green': 'text-green-600',
  'Pink': 'text-pink-500',
  'Purple': 'text-purple-600',
  'Yellow': 'text-yellow-500',
  'Orange': 'text-orange-500',
  'Gold': 'text-yellow-600',
  'Silver': 'text-gray-400'
}

const MobileRefinementPanel: React.FC<MobileRefinementPanelProps> = ({
  isOpen,
  onClose,
  sortBy,
  selectedBrand,
  selectedColor,
  initialTab = "refine"
}) => {
  const [activeTab, setActiveTab] = useState<"refine" | "sort">(initialTab)
  const [activeSection, setActiveSection] = useState<SectionTab>('brands')
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({})
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const params = useParams()

  // Sync activeTab with initialTab when panel opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab)
    }
  }, [isOpen, initialTab])

  // Parse current page state into filters on mount/pathname change
  useEffect(() => {
    if (!isOpen) return

    const filters: SelectedFilters = {}

    // Extract brand from pathname
    if (pathname.includes('/brands/')) {
      const brandSlug = pathname.split('/brands/')[1]?.split('/')[0]
      if (brandSlug) filters.brand = brandSlug
    }

    // Extract category from pathname
    const genderParam = params?.gender as string
    if (genderParam) {
      const segments = pathname.split('/').filter(Boolean)
      const genderIndex = segments.indexOf(genderParam)

      if (pathname.includes('/brands/')) {
        // Format: /us/men/brands/gucci/bags
        const catSlug = segments[genderIndex + 3]
        if (catSlug) filters.category = catSlug
      } else {
        // Format: /us/men/bags
        const catSlug = segments[genderIndex + 1]
        if (catSlug && catSlug !== 'brands') filters.category = catSlug
      }
    }

    // Extract color from query params
    const colorParam = searchParams.get('color')
    if (colorParam) filters.color = colorParam

    setSelectedFilters(filters)
  }, [isOpen, pathname, searchParams, params])

  // Fetch brands with contextual filtering based on selected category
  useEffect(() => {
    if (activeTab === 'refine' && activeSection === 'brands') {
      const fetchBrands = async () => {
        try {
          const { getAvailableBrands } = await import("@lib/util/algolia-facets")

          const gender = params?.gender as string || "men"

          // Get contextual brand facets based on selected category and color
          const [brandFacets, allBrands] = await Promise.all([
            getAvailableBrands({
              gender: gender as "men" | "women",
              categoryHandle: selectedFilters.category, // Filter by selected category if any
              color: selectedFilters.color // Filter by selected color if any
            }),
            listBrands()
          ])

          // Build set of available brand slugs from Algolia facets
          const availableSlugs = new Set(brandFacets.map((f: any) => f.slug))

          // Filter brands to only those with products in current context
          const filteredBrands = allBrands
            .filter(brand => availableSlugs.has(brand.slug))
            .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))

          setBrands(filteredBrands)
        } catch (error) {
          console.error("[Mobile Panel] Error fetching brands:", error)
        }
      }

      fetchBrands()
    }
  }, [activeTab, activeSection, selectedFilters.category, selectedFilters.color, params])

  // Fetch categories with contextual filtering based on selected brand
  useEffect(() => {
    if (activeTab === 'refine' && activeSection === 'categories') {
      const fetchCategories = async () => {
        try {
          const { getAvailableCategories } = await import("@lib/util/algolia-facets")

          const genderParam = params?.gender as string

          // Get contextual category facets based on selected brand and color
          const [categoryFacets, res] = await Promise.all([
            getAvailableCategories({
              gender: genderParam as "men" | "women",
              brandSlug: selectedFilters.brand, // Filter by selected brand if any
              color: selectedFilters.color // Filter by selected color if any
            }),
            fetch('/api/categories')
          ])

          const data = await res.json()
          const allCategories = data.categories || []

          // Build set of available handles from Algolia facets
          const availableHandles = new Set(categoryFacets.map((f: any) => f.handle))

          // Filter categories by current gender and available products
          if (genderParam) {
            // Find the gender root category (men or women)
            const genderRoot = allCategories.find((cat: Category) => cat.handle === genderParam)
            if (genderRoot && genderRoot.children) {
              // Filter tree to only show categories with products
              const filteredCategories = filterCategoryTree(genderRoot.children, availableHandles)
              setCategories(filteredCategories)
            }
          } else {
            // No gender specified, filter all categories
            const filteredCategories = filterCategoryTree(allCategories, availableHandles)
            setCategories(filteredCategories)
          }
        } catch (error) {
          console.error("[Mobile Panel] Error fetching categories:", error)
        }
      }

      fetchCategories()
    }
  }, [activeTab, activeSection, selectedFilters.brand, selectedFilters.color, params])

  const handleToggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  // Helper function to filter category tree to only show categories with products
  const filterCategoryTree = (categories: Category[], availableHandles: Set<string>): Category[] => {
    return categories
      .map(cat => {
        // Recursively filter children first
        const filteredChildren = cat.children && cat.children.length > 0
          ? filterCategoryTree(cat.children, availableHandles)
          : []

        // Show this category if:
        // 1. It has products (in availableHandles), OR
        // 2. It has children with products (filteredChildren not empty)
        if (availableHandles.has(cat.handle) || filteredChildren.length > 0) {
          return {
            ...cat,
            children: filteredChildren
          }
        }

        return null
      })
      .filter(Boolean) as Category[]
  }

  const renderCategoryTree = (category: Category, level: number = 0) => {
    const hasChildren = category.children && category.children.length > 0
    const isExpanded = expandedCategories.has(category.id)

    // Derive category slug without gender prefix
    const categorySlug = category.handle.replace(/^(mens-|womens-)/, "")
    const isSelected = selectedFilters.category === categorySlug

    return (
      <div key={category.id} className="w-full">
        <div className="flex items-center w-full" style={{ marginLeft: `${level * 12}px` }}>
          {/* Expand/Collapse Button */}
          {hasChildren ? (
            <button
              onClick={() => handleToggleCategory(category.id)}
              className="flex-shrink-0 w-4 h-4 mr-2 flex items-center justify-center text-gray-400 hover:text-gray-600"
            >
              <svg
                className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <div className="w-4 h-4 mr-2" />
          )}

          {/* Category Button */}
          <button
            onClick={() => handleFilterToggle('category', categorySlug)}
            className={`flex-1 text-left text-sm uppercase py-2 px-2 font-sans ${
              isSelected
                ? "font-bold underline text-black"
                : "text-gray-700 hover:text-black"
            }`}
          >
            {category.name}
          </button>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {category.children!.map((child) => renderCategoryTree(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  const handleFilterToggle = (section: keyof SelectedFilters, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [section]: prev[section] === value ? undefined : value
    }))
  }

  const handleClearFilters = () => {
    setSelectedFilters({})
  }

  const handleRemoveFilter = (section: keyof SelectedFilters) => {
    setSelectedFilters(prev => {
      const updated = { ...prev }
      delete updated[section]
      return updated
    })
  }

  const handleApplyFilters = () => {
    const { brand, category, color } = selectedFilters
    const countryCode = params?.countryCode as string || 'us'
    const gender = params?.gender as string || 'men'

    let path = `/${countryCode}/${gender}`

    if (brand && category) {
      path = `/${countryCode}/${gender}/brands/${brand}/${category}`
    } else if (brand) {
      path = `/${countryCode}/${gender}/brands/${brand}`
    } else if (category) {
      path = `/${countryCode}/${gender}/${category}`
    }

    if (color) {
      path += `?color=${color}`
    }

    router.push(path)
    onClose()
  }

  const filterCount = Object.values(selectedFilters).filter(v => v !== undefined).length

  const getButtonText = () => {
    if (filterCount === 0) return "VIEW ALL PRODUCTS"
    if (filterCount === 1) return "APPLY FILTER"
    return `APPLY FILTERS (${filterCount})`
  }

  const handleSortSelect = (sortValue: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('sortBy', sortValue)
    const queryString = params.toString()
    router.push(`${pathname}?${queryString}`)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={onClose}>
      <div
        className="fixed inset-0 bg-white shadow-lg transform transition-transform duration-300 ease-in-out flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - REFINE/SORT Tabs */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
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

        {activeTab === "refine" ? (
          <>
            {/* Applied Filters Pills Row */}
            {filterCount > 0 && (
              <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-1.5 flex-shrink-0 overflow-x-auto">
                <div className="flex items-center gap-1.5 flex-nowrap">
                  {selectedFilters.brand && (
                    <div className="bg-gray-100 text-black px-2.5 py-1 rounded-full text-xs flex items-center gap-1.5 whitespace-nowrap flex-shrink-0">
                      <span className="uppercase">
                        {brands.find(b => b.slug === selectedFilters.brand)?.name || selectedFilters.brand}
                      </span>
                      <button
                        onClick={() => handleRemoveFilter('brand')}
                        className="hover:text-red-600"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  {selectedFilters.category && (
                    <div className="bg-gray-100 text-black px-2.5 py-1 rounded-full text-xs flex items-center gap-1.5 whitespace-nowrap flex-shrink-0">
                      <span className="uppercase">{selectedFilters.category}</span>
                      <button
                        onClick={() => handleRemoveFilter('category')}
                        className="hover:text-red-600"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  {selectedFilters.color && (
                    <div className="bg-gray-100 text-black px-2.5 py-1 rounded-full text-xs flex items-center gap-1.5 whitespace-nowrap flex-shrink-0">
                      <span className="uppercase">{selectedFilters.color}</span>
                      <button
                        onClick={() => handleRemoveFilter('color')}
                        className="hover:text-red-600"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  <button
                    onClick={handleClearFilters}
                    className="text-xs uppercase text-gray-600 hover:text-black underline whitespace-nowrap flex-shrink-0 px-1"
                  >
                    CLEAR
                  </button>
                </div>
              </div>
            )}

            {/* Section Tabs */}
            <div className="px-6 py-3 border-b border-gray-200 flex gap-6 flex-shrink-0">
              <button
                onClick={() => setActiveSection('brands')}
                className={`text-sm uppercase font-medium pb-1 transition-all ${
                  activeSection === 'brands'
                    ? 'border-b-2 border-black text-black'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                BRANDS
              </button>
              <button
                onClick={() => setActiveSection('categories')}
                className={`text-sm uppercase font-medium pb-1 transition-all ${
                  activeSection === 'categories'
                    ? 'border-b-2 border-black text-black'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                CATEGORIES
              </button>
              <button
                onClick={() => setActiveSection('colors')}
                className={`text-sm uppercase font-medium pb-1 transition-all ${
                  activeSection === 'colors'
                    ? 'border-b-2 border-black text-black'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                COLORS
              </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-6 pb-24">
              {activeSection === 'brands' && (
                <div className="space-y-2">
                  {brands.map((brand) => (
                    <button
                      key={brand.id}
                      onClick={() => handleFilterToggle('brand', brand.slug)}
                      className={`text-left px-2 py-2 cursor-pointer uppercase text-sm font-sans w-full ${
                        selectedFilters.brand === brand.slug
                          ? "font-bold underline text-black"
                          : "text-gray-700 hover:text-black"
                      }`}
                    >
                      {brand.name}
                    </button>
                  ))}
                </div>
              )}

              {activeSection === 'categories' && (
                <div className="space-y-1">
                  {categories.map((category) => renderCategoryTree(category))}
                </div>
              )}

              {activeSection === 'colors' && (
                <div className="space-y-2">
                  {COLOR_MAPPING.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleFilterToggle('color', color)}
                      className={`text-left px-2 py-2 cursor-pointer uppercase text-sm font-sans w-full ${
                        selectedFilters.color === color
                          ? "font-bold underline"
                          : "hover:opacity-80"
                      } ${COLOR_STYLES[color] || 'text-gray-700'}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Button - Fixed */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 flex-shrink-0">
              <button
                onClick={handleApplyFilters}
                className="w-full py-3 bg-black text-white text-sm font-medium uppercase hover:bg-neutral-900 transition-colors duration-200"
              >
                {getButtonText()}
              </button>
            </div>
          </>
        ) : (
          /* SORT Tab Content */
          <div className="flex-1 overflow-y-auto p-6">
            <h3 className="text-sm font-medium uppercase tracking-wide mb-3">Sort By</h3>
            <div className="space-y-2">
              {[
                { value: "created_at", label: "Newest" },
                { value: "price_asc", label: "Price: Low to High" },
                { value: "price_desc", label: "Price: High to Low" }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSortSelect(option.value)}
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
  )
}

export default MobileRefinementPanel
