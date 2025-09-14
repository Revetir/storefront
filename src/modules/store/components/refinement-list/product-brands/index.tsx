"use client"
import React, { useEffect, useState } from "react"
import { useParams, usePathname, useRouter } from "next/navigation"
import { Brand, listBrands } from "@lib/data/brands"

export default function BrandRefinementList({ selectedBrand: propSelectedBrand }: { selectedBrand?: string }) {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const selectedBrand = propSelectedBrand || ""

  useEffect(() => {
    listBrands().then(setBrands).finally(() => setLoading(false))
  }, [])

  const handleSelect = (slug: string) => {
    // Toggle logic: if clicking the same brand, go back to gender root brands page
    const countryCode = params?.countryCode as string
    const gender = (params?.gender as string) || "men"
    const brandSlug = slug.toLowerCase().replace(/\s+/g, "-")

    const target = selectedBrand === slug
      ? `/${countryCode}/${gender}/brands`
      : `/${countryCode}/${gender}/brands/${brandSlug}`

    router.push(target)
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
