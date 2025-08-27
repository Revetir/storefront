import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProductsClient from "@modules/products/components/related-products/related-products-client"
import ProductInfo from "@modules/products/templates/product-info"
import ProductInfoMobile from "@modules/products/templates/product-info/product-info-mobile"
import ProductDescriptionMobile from "@modules/products/templates/product-info/product-description-mobile"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import ProductActionsWrapper from "./product-actions-wrapper"
import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  relatedProducts: HttpTypes.StoreProduct[]
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
  relatedProducts,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  return (
    <>
      {/* Mobile Layout - < 768px */}
      <div className="md:hidden">
        {/* Image Gallery - Full width at top */}
        <div className="w-full">
          <ImageGallery images={product?.images || []} product={product} />
        </div>

        {/* Product Info (Type & Title only) - Below gallery with increased spacing */}
        <div className="px-4 pt-4 pb-6">
          <ProductInfoMobile product={product} />
        </div>

        {/* Product Actions - Below product info */}
        <div className="px-4 pb-6">
          <div className="flex flex-col gap-y-3 w-full">
            <ProductOnboardingCta />
            <Suspense
              fallback={
                <ProductActions
                  disabled={true}
                  product={product}
                  region={region}
                />
              }
            >
              <ProductActionsWrapper id={product.id} region={region} />
            </Suspense>
          </div>
        </div>

        {/* Product Description - Below product actions */}
        <ProductDescriptionMobile product={product} />
        
        {/* Additional spacing for mobile between description and recommended products */}
        <div className="md:hidden h-4"></div>
      </div>

      {/* Tablet Layout - 768px - 1022px */}
      <div className="hidden md:block small:hidden">
        <div className="flex w-full min-h-screen items-center">
          {/* Left half - Image Gallery (centered vertically) */}
          <div className="w-1/2 flex items-center justify-center">
            <div className="w-full max-w-full px-4">
              <ImageGallery images={product?.images || []} product={product} />
            </div>
          </div>

          {/* Right half - Product Info and Actions */}
          <div className="w-1/2 px-4 flex items-center">
            <div className="flex flex-col gap-y-8 w-full">
              {/* Product Type and Title First */}
              <ProductInfoMobile product={product} />

              {/* CTAs Second */}
              <div className="flex flex-col gap-y-4 mb-5">
                <ProductOnboardingCta />
                <Suspense
                  fallback={
                    <ProductActions
                      disabled={true}
                      product={product}
                      region={region}
                    />
                  }
                >
                  <ProductActionsWrapper id={product.id} region={region} />
                </Suspense>
              </div>

              {/* Product Description Third */}
              <div className="flex flex-col gap-y-4">
                <div className="text-xs uppercase tracking-wide text-gray-500 font-medium">
                  ITEM INFO
                </div>
                <Text
                  className="text-medium text-ui-fg-base whitespace-pre-line"
                  data-testid="product-description" 
                >
                  {product.description}
                </Text>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Desktop Layout - 1023px - 1725px */}
      <div className="hidden small:block large:hidden">
        <div className="flex justify-center w-full min-h-screen items-center">
          <div className="max-w-[1200px] px-6">
            <div className="flex gap-8">
              {/* Left half - Image Gallery */}
              <div className="w-1/2">
                <div className="w-full">
                  <ImageGallery images={product?.images || []} product={product} />
                </div>
              </div>

              {/* Right half - Product Info and Actions */}
              <div className="w-1/2">
                <div className="flex flex-col gap-y-6">
                  <ProductInfo product={product} />
                  <div className="flex flex-col gap-y-3">
                    <ProductOnboardingCta />
                    <Suspense
                      fallback={
                        <ProductActions
                          disabled={true}
                          product={product}
                          region={region}
                        />
                      }
                    >
                      <ProductActionsWrapper id={product.id} region={region} />
                    </Suspense>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Large Desktop Layout - > 1725px */}
      <div className="hidden large:flex relative w-full">
        {/* Left column - Product Info (sticky) */}
        <div className="w-1/4 pl-6">
          <div className="sticky top-0 h-screen flex items-center">
            <ProductInfo product={product} />
          </div>
        </div>

        {/* Center column - Image Gallery (within container) */}
        <div className="w-2/4 flex justify-center py-6">
          <div className="w-full">
            <ImageGallery images={product?.images || []} product={product} />
          </div>
        </div>

        {/* Right column - Product Actions (sticky) */}
        <div className="w-1/4 pr-6">
          <div className="sticky top-0 h-screen flex items-center">
            <div className="flex flex-col gap-y-12 w-full">
              <ProductOnboardingCta />
              <Suspense
                fallback={
                  <ProductActions
                    disabled={true}
                    product={product}
                    region={region}
                  />
                }
              >
                <ProductActionsWrapper id={product.id} region={region} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>

      {/* Related products section (within container) */}
      <div
        className="content-container my-16 small:my-32"
        data-testid="related-products-container"
      >
        <RelatedProductsClient products={relatedProducts} region={region} />
      </div>
    </>
  )
}

export default ProductTemplate
