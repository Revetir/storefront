"use client"
import React, { useEffect, useState } from "react"
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation"
import { Brand, listBrands } from "@lib/data/brands"

export default function BrandRefinementList({ selectedBrand: propSelectedBrand }: { selectedBrand?: string }) {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const selectedBrand = propSelectedBrand || ""
  const colorParam = searchParams.get('color') || undefined

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true)

        const gender = (params?.gender as string) || "men"
        const categorySlug = params?.categorySlug as string

        // Import Algolia facets dynamically
        const { getAvailableBrands } = await import("@lib/util/algolia-facets")

        // Parallel fetch: Algolia facets + all brands
        const [brandFacets, allBrands] = await Promise.all([
          getAvailableBrands({
            gender: gender as "men" | "women",
            categoryHandle: categorySlug,
            color: colorParam
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
        console.error("Error fetching brands:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBrands()
  }, [params?.gender, params?.categorySlug, params?.brandSlug, colorParam])

  const handleSelect = (slug: string) => {
    const countryCode = params?.countryCode as string
    const gender = (params?.gender as string) || "men"
    const brandSlug = slug.toLowerCase().replace(/\s+/g, "-")
    const categorySlug = params?.categorySlug as string

    // Toggle logic: if clicking the same brand, remove brand from current route
    if (selectedBrand === slug) {
      // If we're on a brand+category page, go to just category page
      if (categorySlug) {
        router.push(`/${countryCode}/${gender}/${categorySlug}`)
      } else {
        // If we're on just brand page, go to gender page
        router.push(`/${countryCode}/${gender}`)
      }
    } else {
      // If we're on a category page, add brand to make it brand+category
      if (categorySlug && !pathname.includes('/brands/')) {
        router.push(`/${countryCode}/${gender}/brands/${brandSlug}/${categorySlug}`)
      } else if (categorySlug && pathname.includes('/brands/')) {
        // If we're on a different brand+category page, switch to this brand
        router.push(`/${countryCode}/${gender}/brands/${brandSlug}/${categorySlug}`)
      } else {
        // If we're on gender page or different brand page, go to this brand page
        router.push(`/${countryCode}/${gender}/brands/${brandSlug}`)
      }
    }
  }

  if (loading) return null

  return (
    <div className="flex flex-col gap-2 my-4">
      <span className="text-xs uppercase text-gray-500 mb-1">Brands</span>
      {brands.map((brand) => (
        <button
          key={brand.id}
          onClick={() => handleSelect(brand.slug)}
          className={`text-left px-2 py-1 cursor-pointer uppercase text-xs font-sans ${
            selectedBrand === brand.slug
              ? "font-bold underline text-black"
              : "text-gray-700 hover:text-black"
          }`}
        >
          {brand.name}
        </button>
      ))}
    </div>
  )
}
