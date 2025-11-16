"use client"

import { addToCart } from "@lib/data/cart"
import { useIntersection } from "@lib/hooks/use-in-view"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import Divider from "@modules/common/components/divider"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import { isEqual } from "lodash"
import { useParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import ProductPrice from "../product-price"
import MobileActions from "./mobile-actions"
import SizeGuideLink from "@modules/products/components/size-guide-link"
import { trackAddToBag, trackVariantSelected } from "@lib/util/analytics"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt: any) => {
    acc[varopt.option_id] = varopt.value
    return acc
  }, {} as Record<string, string>)
}

export default function ProductActions({
  product,
  disabled,
}: ProductActionsProps) {
  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [isAdding, setIsAdding] = useState(false)
  const countryCode = useParams().countryCode as string

  // If there is only 1 variant, preselect the options
  useEffect(() => {
    if (product.variants?.length === 1) {
      const variantOptions = optionsAsKeymap(product.variants[0].options)
      setOptions(variantOptions ?? {})
    }
  }, [product.variants])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return undefined
    }
    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // update the options when a variant is selected
  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))

    // Track variant selection
    const option = product.options?.find(opt => opt.id === optionId)
    if (option) {
      trackVariantSelected({
        product_id: product.id || '',
        product_name: product.title,
        brand: (product as any)?.brands?.[0]?.name,
        option_type: option.title || 'unknown',
        option_value: value,
      })
    }
  }

  // check if the selected options produce a valid variant
  const isValidVariant = useMemo(() => {
    return product.variants?.some((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // check if the selected variant (or product with no variants) is in stock
  const inStock = useMemo(() => {
    // No variants at all → treat as out of stock
    if (!selectedVariant && (product.variants?.length ?? 0) === 0) {
      return false
    }

    // If we don't manage inventory, we can always add to cart
    if (selectedVariant && !selectedVariant.manage_inventory) {
      return true
    }

    // If we allow back orders on the variant, we can add to cart
    if (selectedVariant?.allow_backorder) {
      return true
    }

    // If there is inventory available, we can add to cart
    if (
      selectedVariant?.manage_inventory &&
      (selectedVariant.inventory_quantity || 0) > 0
    ) {
      return true
    }

    // Otherwise, we can't add to cart
    return false
  }, [selectedVariant, product.variants])

  const actionsRef = useRef<HTMLDivElement>(null)
  const inView = useIntersection(actionsRef, "0px")

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null

    setIsAdding(true)

    try {
      await addToCart({
        variantId: selectedVariant.id,
        quantity: 1,
        countryCode,
      })

      // Track successful add to bag
      trackAddToBag({
        product_id: product.id || '',
        product_name: product.title,
        brand: (product as any)?.brands?.[0]?.name,
        variant_id: selectedVariant.id,
        variant_name: selectedVariant.title ?? undefined,
        price: selectedVariant.calculated_price?.calculated_amount ?? undefined,
        currency: selectedVariant.calculated_price?.currency_code ?? undefined,
        quantity: 1,
      })
    } catch (error) {
      console.error('Error adding to cart:', error)
      // Could add toast notification here for error feedback
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="flex flex-col gap-y-2" ref={actionsRef}>
      {/* Variant selectors */}
      {(product.variants?.length ?? 0) > 1 && (
        <div className="flex flex-col gap-y-4">
          {(product.options || []).map((option) => (
            <OptionSelect
              key={option.id}
              option={option}
              current={options[option.id]}
              updateOption={setOptionValue}
              title={option.title ?? ""}
              data-testid="product-options"
              disabled={!!disabled || isAdding}
            />
          ))}
          <Divider />
        </div>
      )}

      <ProductPrice product={product} variant={selectedVariant} countryCode={countryCode} />

      <p className="text-xs text-gray-500 mb-5">Enjoy complimentary shipping and returns within the United States</p>

      <Button
        onClick={handleAddToCart}
        disabled={
          // disabled any time there's no valid, in-stock variant
          (!selectedVariant && (product.variants?.length ?? 0) > 1) ||
          !inStock ||
          !!disabled ||
          isAdding ||
          !isValidVariant
        }
        variant="primary"
        className="w-full h-10 !rounded-none !bg-black !text-white hover:!bg-gray-800 transition-colors duration-200 after:!rounded-none"
        isLoading={isAdding}
        data-testid="add-product-button"
      >
        {
          // 1) Multi-variant & none selected → prompt selection
          product.variants && product.variants.length > 1 && (!selectedVariant || !isValidVariant)
            ? "SELECT A SIZE"
            // 2) Out of stock (including no-variants scenario) → show out-of-stock
            : !inStock
            ? "OUT OF STOCK"
            // 3) Otherwise → ready to add
            : "ADD TO BAG"
        }
      </Button>

      <div className="self-start mt-4">
        <SizeGuideLink product={product} />
      </div>

      {/* Divider after size guide for mobile */}
      <div className="md:hidden">
        <Divider />
      </div>

      {/* MobileActions removed for mobile - CTA will be naturally positioned in the flow */}
      <div className="hidden lg:block">
        <MobileActions
          product={product}
          variant={selectedVariant}
          options={options}
          updateOptions={setOptionValue}
          inStock={inStock}
          handleAddToCart={handleAddToCart}
          isAdding={isAdding}
          show={!inView}
          optionsDisabled={!!disabled || isAdding}
          countryCode={countryCode}
        />
      </div>
    </div>
  )
}
