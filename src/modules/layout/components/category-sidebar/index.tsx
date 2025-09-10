"use client"

import { useEffect, useState } from "react"
import { useParams, usePathname } from "next/navigation"
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
  gender: string
  brandSlug?: string
  level?: number
  parentPath?: string
  activeCategoryPath: string[]
}

const CategoryNode = ({
  category,
  currentPath,
  expandedCategories,
  onToggleExpanded,
  gender,
  brandSlug,
  level = 0,
  parentPath = "",
  activeCategoryPath,
}: CategoryNodeProps) => {
  const hasChildren = category.children && category.children.length > 0
  const isExpanded = expandedCategories.has(category.id)
  
  // Derive category slug without gender prefix for pretty URLs
  const categorySlug = category.handle.replace(/^(mens-|womens-)/, "")
  const categoryPath = brandSlug
    ? `/${gender}/brands/${brandSlug}/${categorySlug}`
    : `/${gender}/${categorySlug}`
    
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
  const countryCode = params?.countryCode as string
  const genderParam = (params?.gender as string) || ""
  const brandSlugParam = params?.brandSlug as string | undefined

  // Determine the current category handle from pretty URL routes
  // Supported: /{countryCode}/{gender}/{categorySlug} and /{countryCode}/{gender}/brands/{brandSlug}/{categorySlug}
  let currentCategoryHandle = ""
  const genderPrefix = genderParam === "men" ? "mens" : genderParam === "women" ? "womens" : ""
  if (params && (params as any).categorySlug && genderPrefix) {
    currentCategoryHandle = `${genderPrefix}-${(params as any).categorySlug}`
  }

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
        
        // Auto-expand categories along the chain to the current category
        if (currentCategoryHandle) {
          const newExpanded = new Set<string>()

          // Helper: Recursively find the path to the selected category by handle and expand all parents
          const expandPathToCategoryByHandle = (cats: Category[], targetHandle: string, parentChain: string[] = []): boolean => {
            for (const cat of cats) {
              if (cat.handle === targetHandle) {
                // Expand all parents in the chain
                parentChain.forEach((id) => newExpanded.add(id))
                newExpanded.add(cat.id)
                // End of path (leaf or last segment)
                return true
              }
              if (cat.children && cat.children.length > 0) {
                if (expandPathToCategoryByHandle(cat.children, targetHandle, [...parentChain, cat.id])) {
                  return true
                }
              }
            }
            return false
          }

          expandPathToCategoryByHandle(data.categories || [], currentCategoryHandle)
          setExpandedCategories(newExpanded)

          // Find and set the active category path for highlighting
          const path = findCategoryPath(data.categories || [], currentCategoryHandle)
          if (path) {
            setActiveCategoryPath(path)
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [currentCategoryHandle])

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
                gender={genderParam}
                brandSlug={brandSlugParam}
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
