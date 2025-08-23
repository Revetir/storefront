"use client"
import React, { useEffect, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
// @ts-ignore: Module not found in type declarations, but exists at runtime
import { listProductTypes, ProductType } from "@lib/data/product-types"

export default function TypeRefinementList({ selectedType: propSelectedType }: { selectedType?: string }) {
  const [types, setTypes] = useState<ProductType[]>([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const selectedType = propSelectedType || searchParams.get("brand") || ""

  useEffect(() => {
    listProductTypes().then(setTypes).finally(() => setLoading(false))
  }, [])

  const handleSelect = (typeValue: string) => {
    const params = new URLSearchParams(searchParams)
    if (typeValue === selectedType) {
      params.delete("brand")
    } else {
      params.set("brand", typeValue)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  if (loading) return null

  return (
    <div className="flex flex-col gap-2 my-4">
      <span className="text-xs uppercase text-gray-500 mb-1">Brands</span>
      {types.map((t) => (
        <button
          key={t.id}
          onClick={() => handleSelect(t.value)}
          className={`text-left px-2 py-1 cursor-pointer uppercase text-xs font-sans ${
            selectedType === t.value
              ? "font-bold underline text-black"
              : "text-gray-700 hover:text-black"
          }`}
        >
          {t.value}
        </button>
      ))}
    </div>
  )
}
