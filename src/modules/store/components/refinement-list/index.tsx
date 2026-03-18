"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { SortOptions } from "./sort-products"
import CategorySidebar from "@modules/layout/components/category-sidebar"
import BrandRefinementList from "./product-brands"
import SaleToggle from "@modules/store/components/sale-toggle"
import { buildPathWithQueryFlags, isSaleQueryEnabled, setSaleQuery } from "@lib/util/sale-query"

type RefinementListProps = {
  sortBy: SortOptions
  search?: boolean
  'data-testid'?: string
  selectedBrand?: string
}

const RefinementList = ({ sortBy: _sortBy, 'data-testid': _dataTestId, selectedBrand }: RefinementListProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const saleOnly = isSaleQueryEnabled(searchParams)

  const handleToggleSale = () => {
    const params = new URLSearchParams(searchParams.toString())
    setSaleQuery(params, !saleOnly)
    params.delete("page")
    router.push(buildPathWithQueryFlags(pathname, params))
  }

  return (
    <div className="flex lg:flex-col gap-6 py-4 mb-8 lg:px-0 lg:min-w-[250px]">
      <div className="w-full">
        <SaleToggle checked={saleOnly} onToggle={handleToggleSale} className="mb-4 px-2" />
        <CategorySidebar className="border-r-0 p-0 w-full" />
      </div>
      <BrandRefinementList selectedBrand={selectedBrand} />
    </div>
  )
}

export default RefinementList
