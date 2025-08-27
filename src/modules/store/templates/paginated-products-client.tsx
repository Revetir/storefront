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
      <ul
        className="grid grid-cols-2 w-full gap-x-4 gap-y-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-x-6 md:gap-y-8"
        data-testid="products-list"
      >
        {products && products.length > 0 ? (
          products.map((p, index) => (
            <li key={p.id} className="h-full w-full">
              <ProductPreview 
                product={p} 
                region={region} 
                priority={index < 6} // Priority loading for first 6 products (above-the-fold)
              />
            </li>
          ))
        ) : (
          <li className="col-span-2 text-center py-8 text-gray-500">
            No products found
          </li>
        )}
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
