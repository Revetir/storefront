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
  // Handle empty products case
  if (!products || products.length === 0) {
    return (
      <div className="w-full py-12 text-center">
        <p className="text-ui-fg-muted">No products found.</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <ul
        className="grid w-full gap-x-4 gap-y-6 md:gap-x-6 md:gap-y-8 items-stretch product-grid-fixed-cols"
        data-testid="products-list"
      >
        {products.map((p, index) => (
          <li key={p.id} className="h-full w-full">
            <ProductPreview 
              product={p} 
              region={region} 
              priority={index < 6} // Priority loading for first 6 products (above-the-fold)
            />
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
    </div>
  )
}
