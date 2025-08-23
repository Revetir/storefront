"use client"

import { useEffect, useState } from "react"
import { useParams, usePathname, useSearchParams } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Category } from "@lib/data/categories"

interface CategorySidebarProps {
  className?: string
}

interface CategoryNodeProps {
  category: Category
  currentPath: string
  expandedCategories: Set<string>
  onToggleExpanded: (categoryId: string) => void
  countryCode: string
  searchParams: URLSearchParams
  level?: number
  parentPath?: string
  activeCategoryPath: string[]
}

const CategoryNode = ({
  category,
  currentPath,
  expandedCategories,
  onToggleExpanded,
  countryCode,
  searchParams,
  level = 0,
  parentPath = "",
  activeCategoryPath,
}: CategoryNodeProps) => {
  const hasChildren = category.children && category.children.length > 0
  const isExpanded = expandedCategories.has(category.id)
  
  // Use flat URL structure - just the category handle, but preserve existing search params
  const categoryPath = searchParams.toString() 
    ? `/categories/${category.handle}?${searchParams.toString()}`
    : `/categories/${category.handle}`
    
  const isCurrentCategory = currentPath === categoryPath
  const isInActivePath = activeCategoryPath.includes(category.handle)

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (hasChildren) {
      onToggleExpanded(category.id)
    }
  }

  return (
    <li className="w-full">
      <div className="flex items-center w-full" style={{ marginLeft: `${level * 6 + 8}px` }}>
        {/* Expand/Collapse Button - only show if has children */}
        {hasChildren ? (
          <button
            onClick={handleToggle}
            className="flex-shrink-0 w-4 h-4 mr-1 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            <svg
              className={`w-3 h-3 transition-transform duration-200 ${
                isExpanded ? "rotate-90" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        ) : (
          <div className="w-4 h-4 mr-1" /> // Spacer for alignment
        )}
        
        {/* Category Link */}
        <LocalizedClientLink
          href={categoryPath}
          className={`flex-1 text-xs uppercase py-1 px-2 font-sans transition-colors ${
            isCurrentCategory
              ? "font-bold underline text-black"
              : isInActivePath
              ? "font-bold underline text-black"
              : "text-gray-700 hover:text-black"
          }`}
        >
          {category.name}
        </LocalizedClientLink>
      </div>

        {/* Children - only show if expanded and has children */}
      {hasChildren && isExpanded && (
        <ul className="mt-1 space-y-1">
          {category.children!.map((child) => (
            <CategoryNode
              key={child.id}
              category={child}
              currentPath={currentPath}
              expandedCategories={expandedCategories}
              onToggleExpanded={onToggleExpanded}
              countryCode={countryCode}
              searchParams={searchParams}
              level={level + 1}
              parentPath="" // Not needed for flat URLs
              activeCategoryPath={activeCategoryPath}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

export default function CategorySidebar({ className = "" }: CategorySidebarProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [activeCategoryPath, setActiveCategoryPath] = useState<string[]>([])
  
  const pathname = usePathname()
  const params = useParams()
  const searchParams = useSearchParams()
  const countryCode = params?.countryCode as string

  // Extract the category path from the current pathname
  const currentCategoryPath = pathname.includes('/categories/') 
    ? pathname.split('/categories/')[1] || ''
    : ''

  // Helper function to find the path to a category
  const findCategoryPath = (cats: Category[], targetHandle: string, currentPath: string[] = []): string[] | null => {
    for (const cat of cats) {
      const newPath = [...currentPath, cat.handle]
      if (cat.handle === targetHandle) {
        return newPath
      }
      if (cat.children && cat.children.length > 0) {
        const result = findCategoryPath(cat.children, targetHandle, newPath)
        if (result) {
          return result
        }
      }
    }
    return null
  }

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/categories")
        if (!res.ok) {
          throw new Error("Failed to fetch categories")
        }
        const data = await res.json()
        setCategories(data.categories || [])
        
        // Auto-expand categories that are in the current path
        if (currentCategoryPath) {
          const pathSegments = currentCategoryPath.split("/").filter(Boolean)
          const newExpanded = new Set<string>()

          // Helper: Recursively find the path to the selected category and expand all parents
          const expandPathToCategory = (cats: Category[], segments: string[], parentChain: string[] = []): boolean => {
            for (const cat of cats) {
              if (cat.handle === segments[0]) {
                // Expand all parents in the chain
                parentChain.forEach((id) => newExpanded.add(id))
                newExpanded.add(cat.id)
                if (segments.length > 1 && cat.children && cat.children.length > 0) {
                  // Continue down the path
                  return expandPathToCategory(cat.children, segments.slice(1), [...parentChain, cat.id])
                }
                // End of path (leaf or last segment)
                return true
              }
              if (cat.children && cat.children.length > 0) {
                if (expandPathToCategory(cat.children, segments, [...parentChain, cat.id])) {
                  return true
                }
              }
            }
            return false
          }

          expandPathToCategory(data.categories || [], pathSegments)
          setExpandedCategories(newExpanded)

          // Find and set the active category path for highlighting
          const currentCategoryHandle = pathSegments[pathSegments.length - 1]
          if (currentCategoryHandle) {
            const path = findCategoryPath(data.categories || [], currentCategoryHandle)
            if (path) {
              setActiveCategoryPath(path)
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [currentCategoryPath])

  const handleToggleExpanded = (categoryId: string) => {
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

  if (loading) {
    return (
      <div className={`w-full mb-6 ${className}`}>
        <h2 className="text-xs uppercase text-gray-500 mb-3">Categories</h2>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-6 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`w-full mb-6 ${className}`}>
        <h2 className="text-xs uppercase text-gray-500 mb-3">Categories</h2>
        <p className="text-red-500 text-sm">Error loading categories: {error}</p>
      </div>
    )
  }

  return (
    <div className={`w-full mb-6 ${className}`}>
      <h2 className="text-xs uppercase text-gray-500 mb-3">Categories</h2>
      {categories.length > 0 ? (
        <nav>
          <ul className="space-y-1">
            {categories.map((category) => (
              <CategoryNode
                key={category.id}
                category={category}
                currentPath={pathname}
                expandedCategories={expandedCategories}
                onToggleExpanded={handleToggleExpanded}
                countryCode={countryCode}
                searchParams={searchParams}
                activeCategoryPath={activeCategoryPath}
              />
            ))}
          </ul>
        </nav>
      ) : (
        <p className="text-gray-500 text-sm">No categories available</p>
      )}
    </div>
  )
}
