"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useTransition } from "react"

import SortProducts, { SortOptions } from "./sort-products"
import CategorySidebar from "@modules/layout/components/category-sidebar"
import BrandRefinementList from "./product-brands"

type RefinementListProps = {
  sortBy: SortOptions
  search?: boolean
  'data-testid'?: string
  selectedBrand?: string
}

const RefinementList = ({ sortBy, 'data-testid': dataTestId, selectedBrand }: RefinementListProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

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
    
    // Use startTransition for better UX during navigation
    startTransition(() => {
      router.push(`${pathname}?${query}`)
    })
  }

  return (
    <div className="flex lg:flex-col gap-6 py-4 mb-8 lg:px-0 lg:min-w-[250px]">
      <CategorySidebar className="border-r-0 p-0 w-full" />
      <BrandRefinementList selectedBrand={selectedBrand} />
    </div>
  )
}

export default RefinementList
