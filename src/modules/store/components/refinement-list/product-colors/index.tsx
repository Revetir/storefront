"use client"
import React from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"

// Color mapping for frontend filters (Multicolor is handled in backend but not shown to users)
const COLOR_MAPPING = [
  'Black', 'White', 'Gray', 'Blue', 'Red', 'Brown', 'Green', 'Pink',
  'Purple', 'Yellow', 'Orange', 'Gold', 'Silver'
]

export default function ColorRefinementList({ selectedColor: propSelectedColor }: { selectedColor?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const selectedColor = propSelectedColor || ""

  const handleSelect = (color: string) => {
    const params = new URLSearchParams(searchParams)

    // Toggle logic: if clicking the same color, remove the color filter
    if (selectedColor === color) {
      params.delete('color')
    } else {
      params.set('color', color)
    }

    // Maintain current path but update query params
    const queryString = params.toString()
    router.push(queryString ? `${pathname}?${queryString}` : pathname)
  }

  return (
    <div className="flex flex-col gap-1 my-4">
      <span className="text-xs uppercase text-gray-500 mb-1 text-right">Colors</span>
      {COLOR_MAPPING.map((color) => (
        <button
          key={color}
          onClick={() => handleSelect(color)}
          className={`text-right px-2 py-1 cursor-pointer uppercase text-xs font-sans ${
            selectedColor === color
              ? "font-bold underline text-black"
              : "text-gray-700 hover:text-black"
          }`}
        >
          {color}
        </button>
      ))}
    </div>
  )
}
