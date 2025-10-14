import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { Brand } from "@lib/data/brands"
import { StoreRegion } from "@medusajs/types"
import PaginatedProductsClient from "@modules/store/templates/paginated-products-client"
import RefinementList from "@modules/store/components/refinement-list"
import CollapsibleText from "@modules/store/components/collapsible-text"
import { Suspense } from "react"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"

type BrandTemplateProps = {
  brand: Brand
  products: HttpTypes.StoreProduct[]
  sortBy?: SortOptions
  page?: string
  countryCode: string
  gender: string
  region: StoreRegion
  totalPages: number
  currentPage: number
}

const BrandTemplate = ({
  brand,
  products,
  sortBy,
  page,
  countryCode,
  gender,
  region,
  totalPages,
  currentPage,
}: BrandTemplateProps) => {
  const genderDisplay = gender === "men" ? "Men's" : "Women's"

  return (
    <div className="content-container py-6">
      <div className="mb-8">
        <h1 className="text-2xl-semi text-gry-900">
          {brand.name} {genderDisplay}
        </h1>
        {brand.blurb && (
          <CollapsibleText text={brand.blurb} className="mt-4 text-base-regular text-gray-600" />
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-x-8">
        <div className="mt-2 lg:mt-0">
          <RefinementList
            sortBy={sortBy || "created_at"}
          />
        </div>
        <div className="flex-1">
          <Suspense fallback={<SkeletonProductGrid />}>
            <PaginatedProductsClient
              products={products}
              region={region}
              totalPages={totalPages}
              currentPage={currentPage}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export { default as BrandCategoryTemplate } from "./brand-category"
export default BrandTemplate
