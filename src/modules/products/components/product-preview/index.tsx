"use client"

import { Text } from "@medusajs/ui"
import { listProducts } from "@lib/data/products"
import { getProductPrice } from "@lib/util/get-product-price"
import { getAlgoliaProductPrice, isAlgoliaProduct } from "@lib/util/get-algolia-product-price"
import { formatBrandNames, getProductUrl, getBrandsArray } from "@lib/util/brand-utils"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import { useParams, useRouter } from "next/navigation"
import React, { useCallback, useRef } from "react"

function ProductPreview({
  product,
  isFeatured,
  region,
  priority = false,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
  priority?: boolean
}) {
  const router = useRouter()
  const params = useParams()
  const countryCode = (params?.countryCode as string) || ""
  const prefetchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // const pricedProduct = await listProducts({
  //   regionId: region.id,
  //   queryParams: { id: [product.id!] },
  // }).then(({ response }) => response.products[0])

  // if (!pricedProduct) {
  //   return null
  // }

  // Handle both Algolia and Medusa products
  let cheapestPrice
  if (isAlgoliaProduct(product)) {
    cheapestPrice = getAlgoliaProductPrice(product, countryCode)
  } else {
    const priceResult = getProductPrice({
      product,
    })
    cheapestPrice = priceResult.cheapestPrice
  }

  const brands = getBrandsArray((product as any)?.brand)
  const productUrl = getProductUrl((product as any)?.brand, product.handle)

  const handleMouseEnter = useCallback(() => {
    // Debounce prefetch by 300ms to avoid excessive prefetching
    if (prefetchTimeoutRef.current) {
      clearTimeout(prefetchTimeoutRef.current)
    }

    prefetchTimeoutRef.current = setTimeout(() => {
      const localizedUrl = countryCode ? `/${countryCode}${productUrl}` : productUrl
      router.prefetch(localizedUrl)
    }, 300)
  }, [productUrl, countryCode, router])

  const handleMouseLeave = useCallback(() => {
    // Cancel prefetch if user leaves before timeout
    if (prefetchTimeoutRef.current) {
      clearTimeout(prefetchTimeoutRef.current)
      prefetchTimeoutRef.current = null
    }
  }, [])

  return (
    <LocalizedClientLink
      href={productUrl}
      className="group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >

      <div data-testid="product-wrapper" className="h-full w-full flex flex-col">
        {/* Thumbnail - fixed height for alignment */}
        <div className="w-full aspect-square">
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="full"
            isFeatured={isFeatured}
            product={product}
            priority={priority}
          />
        </div>

        {/* Product info - using CSS Grid for consistent alignment */}
        <div className="mt-3 flex-1 grid grid-rows-[auto_auto_1fr] gap-1">
          {/* Brand - fixed height for alignment */}
          <div className="h-5 flex items-center">
            {brands.length > 0 && (
              <p className="text-ui-fg-muted text-small font-medium leading-snug truncate">
                {brands.map((brand, idx, arr) => (
                  <React.Fragment key={brand.slug}>
                    <span className="uppercase">{brand.name}</span>
                    {idx < arr.length - 1 && <span> x </span>}
                  </React.Fragment>
                ))}
              </p>
            )}
          </div>
          
          {/* Title - first line aligned, allows second line */}
          <div className="min-h-[1.5rem] flex items-start">
            <Text 
              className="text-ui-fg-subtle leading-snug line-clamp-2" 
              data-testid="product-title"
            >
              {product.title}
            </Text>
          </div>
          
          {/* Price - positioned at start of remaining space, close to title */}
          <div className="flex items-start">
            <div className="">
              {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
            </div>
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}

export default React.memo(ProductPreview)
