"use client"

import { Text } from "@medusajs/ui"
import { listProducts } from "@lib/data/products"
import { getProductPrice } from "@lib/util/get-product-price"
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

  const { cheapestPrice } = getProductPrice({
    product,
  })

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
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="full"
          isFeatured={isFeatured}
          product={product}
          priority={priority}
        />
        <div className="flex flex-col txt-compact-medium mt-3 leading-snug space-y-1">
          {product.type?.value && (
            <p className="text-ui-fg-muted text-small font-medium leading-snug uppercase">
              {product.type.value}
            </p>
          )}
          <Text className="text-ui-fg-subtle leading-snug" data-testid="product-title">
            {product.title}
          </Text>
          {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
        </div>
      </div>
    </LocalizedClientLink>
  )
}
