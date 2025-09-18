"use client"

import { HttpTypes } from "@medusajs/types"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"
import EditorialIntro from "@modules/store/components/editorial-intro"

interface PaginatedProductsClientProps {
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
  totalPages: number
  currentPage: number
  editorialTitle?: string
  editorialBlurb?: string
  showEditorialIntro?: boolean
}

export default function PaginatedProductsClient({ 
  products, 
  region, 
  totalPages, 
  currentPage,
  editorialTitle,
  editorialBlurb,
  showEditorialIntro = true
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
      {showEditorialIntro && (
        <EditorialIntro 
          title={editorialTitle || ""} 
          blurb={editorialBlurb} 
        />
      )}
      <ul
        className="product-grid-fixed-cols"
        data-testid="products-list"
      >
        {products.map((p, index) => (
          <li key={p.id}>
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