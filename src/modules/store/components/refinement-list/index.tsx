"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

import SortProducts, { SortOptions } from "./sort-products"
import CategorySidebar from "@modules/layout/components/category-sidebar"
import TypeRefinementList from "./product-types"

type RefinementListProps = {
  sortBy: SortOptions
  search?: boolean
  'data-testid'?: string
  selectedType?: string
}

const RefinementList = ({ sortBy, 'data-testid': dataTestId, selectedType }: RefinementListProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)

      return params.toString()
    },
    [searchParams]
  )

  const setQueryParams = (name: string, value: string) => {
    const query = createQueryString(name, value)
    router.push(`${pathname}?${query}`)
  }

  return (
    <div className="flex flex-col gap-8 py-4 
                    md:gap-6 md:py-2
                    small:gap-8 small:py-4
                    large:gap-12 large:py-6">
      <SortProducts sortBy={sortBy} setQueryParams={setQueryParams} data-testid={dataTestId} />
      <CategorySidebar className="border-r-0 p-0 w-full" />
      <TypeRefinementList selectedType={selectedType} />
    </div>
  )
}

export default RefinementList
