"use client"

import { Text } from "@medusajs/ui"
import { listProducts } from "@lib/data/products"
import { getProductPrice } from "@lib/util/get-product-price"
import { getAlgoliaProductPrice, isAlgoliaProduct } from "@lib/util/get-algolia-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import { useParams, useRouter } from "next/navigation"

export default function ProductPreview({
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

  const handleMouseEnter = () => {
    // Prefetch the product page on hover
    const brandSlug = ((product as any)?.brand?.slug as string)
    const productUrl = `/products/${brandSlug}-${product.handle}`
    const localizedUrl = countryCode ? `/${countryCode}${productUrl}` : productUrl
    router.prefetch(localizedUrl)
  }

  return (
    <LocalizedClientLink 
      href={`/products/${((product as any)?.brand?.slug as string)}-${product.handle}`} 
      className="group"
      onMouseEnter={handleMouseEnter}
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
            {(product as any)?.brand?.name && (
              <p className="text-ui-fg-muted text-small font-medium leading-snug uppercase truncate">
                {(product as any).brand.name}
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
