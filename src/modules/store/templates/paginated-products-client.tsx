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
  return (
    <>
      <ul
        className="grid grid-cols-2 w-full gap-x-4 gap-y-6 
                   md:grid-cols-2 md:gap-x-4 md:gap-y-6
                   small:grid-cols-3 small:gap-x-6 small:gap-y-8
                   large:grid-cols-4 large:gap-x-8 large:gap-y-10"
        data-testid="products-list"
      >
        {products.map((p) => (
          <li key={p.id} className="h-full w-full">
            <ProductPreview product={p} region={region} />
          </li>
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
