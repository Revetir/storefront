"use client"

import FilterRadioGroup from "@modules/common/components/filter-radio-group"
import React from "react"
import { trackSortApplied } from "@lib/util/analytics"

export type SortOptions = "price_asc" | "price_desc" | "created_at"

type SortProductsProps = {
  sortBy: SortOptions
  setQueryParams: (name: string, value: SortOptions) => void
  "data-testid"?: string
  disabled?: boolean
}

const sortOptions = [
  {
    value: "created_at",
    label: "Latest Arrivals",
  },
  {
    value: "price_asc",
    label: "Price: Low -> High",
  },
  {
    value: "price_desc",
    label: "Price: High -> Low",
  },
]

const SortProducts = ({
  "data-testid": dataTestId,
  sortBy,
  setQueryParams,
  disabled = false,
}: SortProductsProps) => {
  const handleSelect = (value: SortOptions) => {
    if (disabled) return
    trackSortApplied({ sort_type: value })
    setQueryParams("sortBy", value)
  }

  return (
    <div className="flex flex-col gap-2 my-4">
      <span className="text-xs uppercase text-gray-500 mb-1 text-right">Sort by</span>
      {sortOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => handleSelect(option.value as SortOptions)}
          disabled={disabled}
          className={`text-right px-2 py-1 cursor-pointer uppercase text-xs font-sans ${
            sortBy === option.value
              ? "font-bold underline text-black"
              : "text-gray-700 hover:text-black"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          data-testid={dataTestId ? `${dataTestId}-${option.value}` : undefined}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default SortProducts