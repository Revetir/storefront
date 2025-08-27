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
  // Debug: Log products count
  console.log('PaginatedProductsClient - Products count:', products?.length || 0);
  
  return (
    <>
      {/* Debug: Show if component is rendering */}
      <div className="text-xs text-gray-400 mb-2">
        Debug: PaginatedProductsClient rendering with {products?.length || 0} products
      </div>
      
      <ul
        className="grid grid-cols-2 w-full gap-x-4 gap-y-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-x-6 md:gap-y-8"
        data-testid="products-list"
        style={{ display: 'grid' }} // Force grid display
      >
        {products.map((p, index) => (
          <li key={p.id} className="h-full w-full" style={{ display: 'block' }}>
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
    </>
  )
}
