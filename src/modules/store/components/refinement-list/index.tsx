"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useTransition } from "react"

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
    <div className="flex small:flex-col gap-12 py-4 mb-8 small:px-0 small:min-w-[250px]">
      <SortProducts 
        sortBy={sortBy} 
        setQueryParams={setQueryParams} 
        data-testid={dataTestId}
        disabled={isPending}
      />
      <CategorySidebar className="border-r-0 p-0 w-full" />
      <TypeRefinementList selectedType={selectedType} />
    </div>
  )
}

export default RefinementList
