"use client"

import { HttpTypes } from "@medusajs/types"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"

interface PaginatedProductsClientProps {
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
  totalPages: number
  currentPage: number
}

export default function PaginatedProductsClient({ 
  products, 
  region, 
  totalPages, 
  currentPage 
}: PaginatedProductsClientProps) {
  // Determine number of columns based on screen size (2 for mobile, 4 for desktop)
  const NUM_COLUMNS_DESKTOP = 4
  const remainder = products.length % NUM_COLUMNS_DESKTOP
  const emptySlots = remainder === 0 ? 0 : NUM_COLUMNS_DESKTOP - remainder

  return (
    <>
      <ul
        className="grid grid-cols-2 w-full gap-x-4 gap-y-6 md:grid-cols-3 lg:grid-cols-4 md:gap-x-6 md:gap-y-8"
        data-testid="products-list"
      >
        {products.map((p) => (
          <li key={p.id} className="h-full w-full">
            <ProductPreview product={p} region={region} />
          </li>
        ))}
        {/* Render empty slots to fill out the last row */}
        {Array.from({ length: emptySlots }).map((_, idx) => (
          <li key={`empty-${idx}`} aria-hidden="true" className="invisible h-full w-full" />
        ))}
      </ul>
      {totalPages > 1 && (
        <Pagination
          data-testid="product-pagination"
          page={currentPage}
          totalPages={totalPages}
        />
      )}
    </>
  )
}
