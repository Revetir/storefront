"use client"

import { addToCart } from "@lib/data/cart"
import { useIntersection } from "@lib/hooks/use-in-view"
import {
  CartOptimisticBrandPreview,
  emitOptimisticCartAdd,
  emitOptimisticCartRevert,
} from "@lib/util/cart-events"
import {
  getVariantPrice,
  isAlgoliaProduct,
} from "@lib/util/get-algolia-product-price"
import { getProductPrice } from "@lib/util/get-product-price"
import { convertToLocale } from "@lib/util/money"
import { trackAddToBag, trackVariantSelected } from "@lib/util/analytics"
import { trackAddToCart } from "@lib/util/meta-pixel"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import Divider from "@modules/common/components/divider"
import SizeGuideLink from "@modules/products/components/size-guide-link"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import { isEqual } from "lodash"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import ProductPrice from "../product-price"
import MobileActions from "./mobile-actions"

const ADD_TO_BAG_SPINNER_MIN_MS = 250
const ADD_TO_BAG_SPINNER_MAX_MS = 900

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt: any) => {
    if (!varopt?.option_id || typeof varopt?.value !== "string") {
      return acc
    }

    acc[varopt.option_id] = varopt.value
    return acc
  }, {} as Record<string, string>)
}

const buildOptimisticBrands = (
  brands: unknown
): CartOptimisticBrandPreview[] => {
  if (!brands) {
    return []
  }

  const rawBrands = Array.isArray(brands) ? brands : [brands]

  return rawBrands
    .filter((brand: any) => typeof brand?.name === "string")
    .map((brand: any) => ({
      name: brand.name,
      slug: typeof brand?.slug === "string" ? brand.slug : undefined,
    }))
}

const toFiniteNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  if (typeof value === "string") {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return undefined
}

const firstFiniteNumber = (...values: Array<unknown>): number | undefined => {
  for (const value of values) {
    const numericValue = toFiniteNumber(value)
    if (typeof numericValue === "number") {
      return numericValue
    }
  }

  return undefined
}

const formatOptimisticPrice = (amount: number, currencyCode: string): string =>
  convertToLocale({
    amount,
    currency_code: currencyCode,
  }).replace(/\s*USD$/, "")

export default function ProductActions({
  product,
  disabled,
}: ProductActionsProps) {
  const router = useRouter()
  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [isAdding, setIsAdding] = useState(false)
  const [showAddLoading, setShowAddLoading] = useState(false)
  const countryCode = useParams().countryCode as string

  const addLoadingStartedAtRef = useRef<number | null>(null)
  const addLoadingMaxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  )
  const addLoadingMinTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  )

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
    const option = product.options?.find((opt) => opt.id === optionId)
    if (option) {
      trackVariantSelected({
        product_id: product.id || "",
        product_name: product.title,
        brand: (product as any)?.brands?.[0]?.name,
        option_type: option.title || "unknown",
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
    // No variants at all: treat as out of stock
    if (!selectedVariant && (product.variants?.length ?? 0) === 0) {
      return false
    }

    // If we do not manage inventory, we can always add to cart
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

    // Otherwise, we cannot add to cart
    return false
  }, [selectedVariant, product.variants])

  const optimisticPriceData = useMemo(() => {
    if (!selectedVariant) {
      return {}
    }

    const variantCalculatedPrice = firstFiniteNumber(
      selectedVariant.calculated_price?.calculated_amount_with_tax,
      selectedVariant.calculated_price?.calculated_amount,
      (selectedVariant.calculated_price as any)?.calculated?.amount
    )
    const variantOriginalPriceCandidate = firstFiniteNumber(
      selectedVariant.calculated_price?.original_amount_with_tax,
      selectedVariant.calculated_price?.original_amount,
      (selectedVariant.calculated_price as any)?.original?.amount
    )
    const variantCurrency =
      typeof selectedVariant.calculated_price?.currency_code === "string"
        ? selectedVariant.calculated_price.currency_code
        : undefined

    if (
      typeof variantCalculatedPrice === "number" &&
      typeof variantCurrency === "string"
    ) {
      const variantOriginalPrice =
        typeof variantOriginalPriceCandidate === "number" &&
        variantOriginalPriceCandidate > variantCalculatedPrice
          ? variantOriginalPriceCandidate
          : undefined

      return {
        unitPrice: variantCalculatedPrice,
        originalUnitPrice: variantOriginalPrice,
        currencyCode: variantCurrency,
      }
    }

    if (isAlgoliaProduct(product)) {
      const algoliaVariantPrice = getVariantPrice(selectedVariant, countryCode)

      if (
        typeof algoliaVariantPrice?.calculated_price_number === "number" &&
        typeof algoliaVariantPrice?.currency_code === "string"
      ) {
        const algoliaOriginalPrice =
          typeof algoliaVariantPrice?.original_price_number === "number" &&
          algoliaVariantPrice.original_price_number >
            algoliaVariantPrice.calculated_price_number
            ? algoliaVariantPrice.original_price_number
            : undefined

        return {
          unitPrice: algoliaVariantPrice.calculated_price_number,
          originalUnitPrice: algoliaOriginalPrice,
          currencyCode: algoliaVariantPrice.currency_code,
        }
      }
    }

    const medusaVariantPrice = getProductPrice({
      product,
      variantId: selectedVariant.id,
    }).variantPrice

    if (
      typeof medusaVariantPrice?.calculated_price_number === "number" &&
      typeof medusaVariantPrice?.currency_code === "string"
    ) {
      const medusaOriginalPrice =
        typeof medusaVariantPrice?.original_price_number === "number" &&
        medusaVariantPrice.original_price_number >
          medusaVariantPrice.calculated_price_number
          ? medusaVariantPrice.original_price_number
          : undefined

      return {
        unitPrice: medusaVariantPrice.calculated_price_number,
        originalUnitPrice: medusaOriginalPrice,
        currencyCode: medusaVariantPrice.currency_code,
      }
    }

    return {}
  }, [countryCode, product, selectedVariant])

  const actionsRef = useRef<HTMLDivElement>(null)
  const inView = useIntersection(actionsRef, "0px")
  const isAddUiLocked = isAdding || showAddLoading

  const clearAddLoadingTimers = () => {
    if (addLoadingMaxTimerRef.current) {
      clearTimeout(addLoadingMaxTimerRef.current)
      addLoadingMaxTimerRef.current = null
    }

    if (addLoadingMinTimerRef.current) {
      clearTimeout(addLoadingMinTimerRef.current)
      addLoadingMinTimerRef.current = null
    }
  }

  useEffect(() => {
    return () => {
      clearAddLoadingTimers()
    }
  }, [])

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) {
      return null
    }

    setIsAdding(true)
    setShowAddLoading(true)
    addLoadingStartedAtRef.current = Date.now()
    clearAddLoadingTimers()

    addLoadingMaxTimerRef.current = setTimeout(() => {
      setShowAddLoading(false)
      addLoadingMaxTimerRef.current = null
    }, ADD_TO_BAG_SPINNER_MAX_MS)

    const optimisticRequestId = `${selectedVariant.id}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`
    const optimisticVariantTitle =
      selectedVariant.title ||
      Object.values(options)
        .filter((value): value is string => typeof value === "string" && value.length > 0)
        .join(" / ")
    const optimisticBrands = buildOptimisticBrands(
      (product as any)?.brands ?? (selectedVariant as any)?.product?.brands
    )
    const optimisticDisplayPrice =
      typeof optimisticPriceData.unitPrice === "number" &&
      typeof optimisticPriceData.currencyCode === "string"
        ? formatOptimisticPrice(
            optimisticPriceData.unitPrice,
            optimisticPriceData.currencyCode
          )
        : undefined
    const optimisticDisplayOriginalPrice =
      typeof optimisticPriceData.originalUnitPrice === "number" &&
      typeof optimisticPriceData.unitPrice === "number" &&
      optimisticPriceData.originalUnitPrice > optimisticPriceData.unitPrice &&
      typeof optimisticPriceData.currencyCode === "string"
        ? formatOptimisticPrice(
            optimisticPriceData.originalUnitPrice,
            optimisticPriceData.currencyCode
          )
        : undefined

    emitOptimisticCartAdd({
      quantity: 1,
      requestId: optimisticRequestId,
      item: {
        variantId: selectedVariant.id,
        title: product.title ?? undefined,
        variantTitle: optimisticVariantTitle || null,
        productHandle: product.handle ?? undefined,
        thumbnail: product.thumbnail ?? null,
        brands: optimisticBrands,
        unitPrice: optimisticPriceData.unitPrice,
        originalUnitPrice: optimisticPriceData.originalUnitPrice,
        currencyCode: optimisticPriceData.currencyCode,
        displayPrice: optimisticDisplayPrice,
        displayOriginalPrice: optimisticDisplayOriginalPrice,
      },
    })

    try {
      await addToCart({
        variantId: selectedVariant.id,
        quantity: 1,
        countryCode,
        optimisticRequestId,
      })

      router.refresh()

      // Track successful add to bag
      trackAddToBag({
        product_id: product.id || "",
        product_name: product.title,
        brand: (product as any)?.brands?.[0]?.name,
        variant_id: selectedVariant.id,
        variant_name: selectedVariant.title ?? undefined,
        price: selectedVariant.calculated_price?.calculated_amount ?? undefined,
        currency: selectedVariant.calculated_price?.currency_code ?? undefined,
        quantity: 1,
      })

      const variantPrice = selectedVariant.calculated_price?.calculated_amount
      const variantCurrency = selectedVariant.calculated_price?.currency_code
      const normalizedValue =
        typeof variantPrice === "number" ? variantPrice / 100 : 0

      trackAddToCart({
        value: normalizedValue,
        currency: variantCurrency?.toUpperCase() || "USD",
        contentIds: [selectedVariant.id],
        contentName: product.title,
        contentType: "product",
        contents: [
          {
            id: selectedVariant.id,
            quantity: 1,
            item_price: normalizedValue,
          },
        ],
      })
    } catch (error) {
      emitOptimisticCartRevert({
        quantity: 1,
        requestId: optimisticRequestId,
      })
      console.error("Error adding to cart:", error)
      // Could add toast notification here for error feedback
    } finally {
      setIsAdding(false)

      if (addLoadingMaxTimerRef.current) {
        clearTimeout(addLoadingMaxTimerRef.current)
        addLoadingMaxTimerRef.current = null
      }

      const elapsed = addLoadingStartedAtRef.current
        ? Date.now() - addLoadingStartedAtRef.current
        : 0
      const remaining = Math.max(0, ADD_TO_BAG_SPINNER_MIN_MS - elapsed)

      if (remaining > 0) {
        addLoadingMinTimerRef.current = setTimeout(() => {
          setShowAddLoading(false)
          addLoadingMinTimerRef.current = null
        }, remaining)
      } else {
        setShowAddLoading(false)
      }

      addLoadingStartedAtRef.current = null
    }
  }

  return (
    <div className="flex flex-col gap-y-2" ref={actionsRef}>
      <ProductPrice
        product={product}
        variant={selectedVariant}
        countryCode={countryCode}
      />

      <p className="text-xs text-gray-600 mb-5">
        Enjoy complimentary shipping and returns within the United States
      </p>

      {/* Variant selectors */}
      {(product.variants?.length ?? 0) > 1 && (
        <div className="flex flex-col gap-y-4 mb-4">
          {(product.options || []).filter(Boolean).map((option) => (
            <OptionSelect
              key={option.id}
              option={option}
              current={options[option.id]}
              updateOption={setOptionValue}
              title={option.title ?? ""}
              data-testid="product-options"
              disabled={!!disabled || isAddUiLocked}
            />
          ))}
        </div>
      )}

      <Button
        onClick={handleAddToCart}
        disabled={
          // disabled any time there is no valid, in-stock variant
          (!selectedVariant && (product.variants?.length ?? 0) > 1) ||
          !inStock ||
          !!disabled ||
          isAddUiLocked ||
          !isValidVariant
        }
        variant="transparent"
        className="w-full h-10 !rounded-none !bg-black !text-white hover:!bg-neutral-900 disabled:!bg-ui-bg-subtle disabled:!text-ui-fg-muted disabled:!border disabled:!border-ui-border-base disabled:hover:!bg-ui-bg-subtle transition-colors duration-200 !shadow-none after:!hidden focus-visible:!shadow-none [&>span>div]:!rounded-none"
        isLoading={showAddLoading}
        data-testid="add-product-button"
      >
        {isAdding && !showAddLoading
          ? "ADDING TO BAG..."
          :
            // 1) Multi-variant and none selected: prompt selection
            product.variants &&
              product.variants.length > 1 &&
              (!selectedVariant || !isValidVariant)
            ? "SELECT A SIZE"
            : // 2) Out of stock (including no-variants scenario)
            !inStock
            ? "OUT OF STOCK"
            : // 3) Otherwise ready to add
              "ADD TO BAG"}
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
          isAdding={showAddLoading}
          show={!inView}
          optionsDisabled={!!disabled || isAddUiLocked}
          countryCode={countryCode}
        />
      </div>
    </div>
  )
}
