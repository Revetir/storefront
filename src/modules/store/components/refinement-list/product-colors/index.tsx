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

  const handleAllColors = () => {
    // If already showing all colors, do nothing
    if (!selectedColor) return

    const params = new URLSearchParams(searchParams)
    params.delete('color')
    const queryString = params.toString()
    router.push(queryString ? `${pathname}?${queryString}` : pathname)
  }

  return (
    <div className="flex flex-col gap-1 my-4 w-full">
      <span className="text-xs uppercase text-gray-500 mb-1 whitespace-nowrap">Colors</span>
      {/* ALL COLORS option */}
      <button
        onClick={handleAllColors}
        className={`text-left px-2 py-1 cursor-pointer uppercase text-xs font-sans whitespace-nowrap ${
          !selectedColor
            ? "font-bold underline text-black"
            : "text-gray-700 hover:text-black"
        }`}
      >
        All Colors
      </button>
      {COLOR_MAPPING.map((color) => (
        <button
          key={color}
          onClick={() => handleSelect(color)}
          className={`text-left px-2 py-1 cursor-pointer uppercase text-xs font-sans whitespace-nowrap ${
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
