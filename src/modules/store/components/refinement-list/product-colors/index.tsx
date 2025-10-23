"use client"
import React from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"

// Color mapping - same as in backend sync logic
const COLOR_MAPPING = [
  'Black', 'White', 'Gray', 'Blue', 'Red', 'Brown', 'Green', 'Pink',
  'Purple', 'Yellow', 'Orange', 'Multicolor', 'Transparent', 'Iridescent',
  'Gold', 'Silver', 'Rose Gold'
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
  'Multicolor': 'bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 bg-clip-text text-transparent',
  'Transparent': 'text-gray-400 italic',
  'Iridescent': 'bg-gradient-to-r from-purple-400 via-pink-500 to-yellow-500 bg-clip-text text-transparent',
  'Gold': 'text-yellow-600',
  'Silver': 'text-gray-400',
  'Rose Gold': 'text-rose-400'
}

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
    <div className="flex flex-col gap-2 my-4">
      <span className="text-xs uppercase text-gray-500 mb-1">Colors</span>
      {COLOR_MAPPING.map((color) => (
        <button
          key={color}
          onClick={() => handleSelect(color)}
          className={`text-left px-2 py-1 cursor-pointer uppercase text-xs font-sans ${
            selectedColor === color
              ? "font-bold underline"
              : "hover:opacity-80"
          } ${COLOR_STYLES[color] || 'text-gray-700'}`}
        >
          {color}
        </button>
      ))}
    </div>
  )
}
