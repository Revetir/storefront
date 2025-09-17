import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { Brand } from "@lib/data/brands"
import { StoreRegion } from "@medusajs/types"
import PaginatedProductsClient from "@modules/store/templates/paginated-products-client"
import RefinementList from "@modules/store/components/refinement-list"
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
    <div className="py-6" data-testid="brand-container">
      <div className="relative">
        {/* Mobile Layout - < 768px */}
        <div className="md:hidden">
          <div className="flex justify-center w-full">
            <div className="max-w-[768px] px-4">
              <div className="mb-8">
                <h1 className="text-2xl-semi text-gry-900">
                  {brand.name} {genderDisplay}
                </h1>
                {brand.blurb && (
                  <div className="mt-4 text-base-regular text-gray-600">
                    {brand.blurb}
                  </div>
                )}
              </div>
              
              <div className="w-full">
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
        </div>

        {/* Tablet Layout - 768px - 1023px */}
        <div className="hidden md:block small:hidden">
          <div className="flex justify-center w-full">
            <div className="max-w-[768px] px-4">
              <div className="mb-8">
                <h1 className="text-2xl-semi text-gry-900">
                  {brand.name} {genderDisplay}
                </h1>
                {brand.blurb && (
                  <div className="mt-4 text-base-regular text-gray-600">
                    {brand.blurb}
                  </div>
                )}
              </div>
              
              <div className="w-full">
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
        </div>

        {/* Small Desktop Layout - 1024px - 1724px */}
        <div className="hidden small:block large:hidden">
          <div className="flex justify-center w-full">
            <div className="max-w-[1200px] px-6">
              <div className="mb-8">
                <h1 className="text-2xl-semi text-gry-900">
                  {brand.name} {genderDisplay}
                </h1>
                {brand.blurb && (
                  <div className="mt-4 text-base-regular text-gray-600">
                    {brand.blurb}
                  </div>
                )}
              </div>
              
              <div className="flex gap-8">
                {/* Compact Sidebar */}
                <div className="w-64 flex-shrink-0">
                  <RefinementList
                    sortBy={sortBy || "created_at"}
                  />
                </div>
                {/* Product Grid */}
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
          </div>
        </div>

        {/* Large Desktop Layout - >= 1725px */}
        <div className="hidden large:block">
          <div className="relative">
            {/* Desktop Refinement List - Original positioning */}
            <div className="absolute left-9 top-0 z-10">
              <RefinementList
                sortBy={sortBy || "created_at"}
              />
            </div>
            
            <div className="flex justify-center w-full">
              <div className="max-w-[1200px] px-4 md:px-6">
                <div className="mb-8">
                  <h1 className="text-2xl-semi text-gry-900">
                    {brand.name} {genderDisplay}
                  </h1>
                  {brand.blurb && (
                    <div className="mt-4 text-base-regular text-gray-600">
                      {brand.blurb}
                    </div>
                  )}
                </div>
                
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
        </div>
      </div>
    </div>
  )
}

export { default as BrandCategoryTemplate } from "./brand-category"
export default BrandTemplate
