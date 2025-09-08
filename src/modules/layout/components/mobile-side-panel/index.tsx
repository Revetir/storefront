"use client"

import React, { useState } from "react"
import X from "@modules/common/icons/x"
import ChevronDown from "@modules/common/icons/chevron-down"
import ChevronRight from "@modules/common/icons/chevron-right"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Category } from "@lib/data/categories"

interface MobileSidePanelProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
}

const MobileSidePanel: React.FC<MobileSidePanelProps> = ({ 
  isOpen, 
  onClose, 
  categories 
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [activeSubPanel, setActiveSubPanel] = useState<string | null>(null)
  const [activeNestedPanel, setActiveNestedPanel] = useState<string | null>(null)
  const [subPanelStack, setSubPanelStack] = useState<Array<{type: string, categoryId?: string}>>([])

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const openSubPanel = (panelType: string) => {
    setActiveSubPanel(panelType)
  }

  const closeSubPanel = () => {
    setActiveSubPanel(null)
  }

  const closeAllPanels = () => {
    setActiveSubPanel(null)
    setActiveNestedPanel(null)
    onClose()
  }

  const openNestedPanel = (categoryHandle: string) => {
    setActiveNestedPanel(categoryHandle)
  }

  const closeNestedPanel = () => {
    setActiveNestedPanel(null)
  }

  const openSubSubPanel = (categoryId: string) => {
    setSubPanelStack(prev => [...prev, {type: 'category', categoryId}])
  }

  const closeSubSubPanel = () => {
    setSubPanelStack(prev => prev.slice(0, -1))
  }

  // Helper function to find any category by ID in the entire tree
  const findCategoryById = (categories: Category[], targetId: string): Category | null => {
    for (const category of categories) {
      if (category.id === targetId) {
        return category
      }
      if (category.children && category.children.length > 0) {
        const found = findCategoryById(category.children, targetId)
        if (found) return found
      }
    }
    return null
  }

  // Helper function to find categories by gender
  const findCategoriesByGender = (cats: Category[], gender: "menswear" | "womenswear"): Category[] => {
    // First, try to find categories with the exact gender match
    const directMatches = cats.filter(cat => cat.gender === gender)
    if (directMatches.length > 0) {
      return directMatches
    }
    
    // If no direct matches, search through children recursively
    let result: Category[] = []
    cats.forEach(cat => {
      if (cat.children && cat.children.length > 0) {
        const childResults = findCategoriesByGender(cat.children, gender)
        result.push(...childResults)
      }
    })
    
    return result
  }

  // Helper function to flatten categories for nested panel lookup
  const flattenCategories = (cats: Category[]): Category[] => {
    let result: Category[] = []
    cats.forEach(cat => {
      result.push(cat)
      if (cat.children && cat.children.length > 0) {
        result = result.concat(flattenCategories(cat.children))
      }
    })
    return result
  }

  const allCategories = flattenCategories(categories)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={onClose}>
      <div 
        className="fixed left-0 top-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-end p-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-16">
              {/* Clothing Categories Group */}
              <div className="space-y-3">
                {categories.map((category: Category) => {
                  const hasChildren = category.children && category.children.length > 0
                  
                  return (
                    <div key={category.id} className="flex items-center justify-between">
                      <LocalizedClientLink 
                        href={(() => {
                          // Extract gender and category slug from handle
                          let gender: string
                          let categorySlug: string
                          
                          if (category.handle.startsWith("mens-")) {
                            gender = "men"
                            categorySlug = category.handle.replace("mens-", "")
                          } else if (category.handle.startsWith("womens-")) {
                            gender = "women"
                            categorySlug = category.handle.replace("womens-", "")
                          } else {
                            // Fallback to men if no gender prefix
                            gender = "men"
                            categorySlug = category.handle
                          }
                          
                          return `/${gender}/${categorySlug}`
                        })()}
                        className="text-sm uppercase text-gray-700 hover:text-black font-medium"
                        onClick={onClose}
                      >
                        {category.name}
                      </LocalizedClientLink>
                      {hasChildren && (
                        <button
                          onClick={() => openSubSubPanel(category.id)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Account and Bag */}
              <div className="space-y-2">
                <LocalizedClientLink 
                  href="/account" 
                  className="block text-sm uppercase text-gray-700 hover:text-black"
                  onClick={onClose}
                >
                  Account
                </LocalizedClientLink>
                <LocalizedClientLink 
                  href="/cart" 
                  className="block text-sm uppercase text-gray-700 hover:text-black"
                  onClick={onClose}
                >
                  Bag
                </LocalizedClientLink>
              </div>

              {/* Customer Care */}
              <div className="flex items-center justify-between">
                <LocalizedClientLink 
                  href="/customer-care/contact-us" 
                  className="text-sm uppercase text-gray-700 hover:text-black"
                  onClick={onClose}
                >
                  Customer Care
                </LocalizedClientLink>
                <button
                  onClick={() => openSubPanel("customer-care")}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-panels */}
      {activeSubPanel && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={closeSubPanel}>
          <div 
            className="fixed left-0 top-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              {/* Sub-panel Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <button
                  onClick={closeSubPanel}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </button>
                <h2 className="text-base font-medium uppercase tracking-wide">
                  {activeSubPanel === "customer-care" && "Customer Care"}
                </h2>
                <div className="w-9"></div> {/* Spacer for centering */}
              </div>

              {/* Sub-panel Content */}
              <div className="flex-1 overflow-y-auto p-4">


                {activeSubPanel === "customer-care" && (
                  <div className="space-y-3">
                    <LocalizedClientLink
                      href="/customer-care/contact-us"
                      className="block text-sm uppercase text-gray-700 hover:text-black py-2"
                      onClick={closeAllPanels}
                    >
                      Contact Us
                    </LocalizedClientLink>
                    <LocalizedClientLink
                      href="/customer-care/faq"
                      className="block text-sm uppercase text-gray-700 hover:text-black py-2"
                      onClick={closeAllPanels}
                    >
                      FAQ
                    </LocalizedClientLink>
                    <LocalizedClientLink
                      href="/customer-care/ordering"
                      className="block text-sm uppercase text-gray-700 hover:text-black py-2"
                      onClick={closeAllPanels}
                    >
                      Ordering
                    </LocalizedClientLink>
                    <LocalizedClientLink
                      href="/customer-care/shipping"
                      className="block text-sm uppercase text-gray-700 hover:text-black py-2"
                      onClick={closeAllPanels}
                    >
                      Shipping & Handling
                    </LocalizedClientLink>
                    <LocalizedClientLink
                      href="/customer-care/return-policy"
                      className="block text-sm uppercase text-gray-700 hover:text-black py-2"
                      onClick={closeAllPanels}
                    >
                      Return Policy
                    </LocalizedClientLink>
                    <LocalizedClientLink
                      href="/customer-care/about-us"
                      className="block text-sm uppercase text-gray-700 hover:text-black py-2"
                      onClick={closeAllPanels}
                    >
                      About Us
                    </LocalizedClientLink>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nested Sub-panels */}
      {subPanelStack.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={closeSubSubPanel}>
          <div 
            className="fixed left-0 top-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              {/* Nested Sub-panel Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <button
                  onClick={closeSubSubPanel}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </button>
                <h2 className="text-base font-medium uppercase tracking-wide">
                  {(() => {
                    const currentPanel = subPanelStack[subPanelStack.length - 1]
                    if (currentPanel.type === 'category' && currentPanel.categoryId) {
                      const selectedCategory = findCategoryById(categories, currentPanel.categoryId)
                      return selectedCategory ? selectedCategory.name : 'Category'
                    }
                    return 'Category'
                  })()}
                </h2>
                <div className="w-9"></div> {/* Spacer for centering */}
              </div>

              {/* Nested Sub-panel Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {(() => {
                  const currentPanel = subPanelStack[subPanelStack.length - 1]
                  if (currentPanel.type === 'category' && currentPanel.categoryId) {
                    const selectedCategory = findCategoryById(categories, currentPanel.categoryId)
                    
                    if (selectedCategory && selectedCategory.children && selectedCategory.children.length > 0) {
                      return (
                        <div className="space-y-3">
                          {selectedCategory.children.map((childCategory) => {
                            const hasChildren = childCategory.children && childCategory.children.length > 0
                            
                            return (
                              <div key={childCategory.id} className="flex items-center justify-between">
                                <LocalizedClientLink
                                  href={(() => {
                                    // Extract gender and category slug from handle
                                    let gender: string
                                    let categorySlug: string
                                    
                                    if (childCategory.handle.startsWith("mens-")) {
                                      gender = "men"
                                      categorySlug = childCategory.handle.replace("mens-", "")
                                    } else if (childCategory.handle.startsWith("womens-")) {
                                      gender = "women"
                                      categorySlug = childCategory.handle.replace("womens-", "")
                                    } else {
                                      // Fallback to men if no gender prefix
                                      gender = "men"
                                      categorySlug = childCategory.handle
                                    }
                                    
                                    return `/${gender}/${categorySlug}`
                                  })()}
                                  className="text-sm uppercase text-gray-700 hover:text-black py-2"
                                  onClick={closeAllPanels}
                                >
                                  {childCategory.name}
                                </LocalizedClientLink>
                                {hasChildren && (
                                  <button
                                    onClick={() => openSubSubPanel(childCategory.id)}
                                    className="p-1 hover:bg-gray-100 rounded"
                                  >
                                    <ChevronRight className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )
                    }
                  }
                  return (
                    <div className="text-sm text-gray-500">
                      No subcategories available
                    </div>
                  )
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MobileSidePanel
