"use client"

import { Text, clx } from "@medusajs/ui"
import { VariantPrice } from "types/global"
import { AlgoliaProductPrice } from "@lib/util/get-algolia-product-price"

type PreviewPriceData = VariantPrice | AlgoliaProductPrice

export default function PreviewPrice({ price }: { price: PreviewPriceData }) {
  if (!price) {
    return null
  }

  return (
    <>
      {price.price_type === "sale" && "original_price" in price && price.original_price ? (
        <div className="flex items-center gap-1.5">
          <Text
            className="font-medium"
            data-testid="price"
          >
            {price.calculated_price?.replace(/\s*USD$/, '')}
          </Text>
          <Text
            className="line-through text-gray-500"
            data-testid="original-price"
          >
            {price.original_price?.replace(/\s*USD$/, '')}
          </Text>
        </div>
      ) : (
        <Text
          className="text-ui-fg-muted"
          data-testid="price"
        >
          {price.calculated_price?.replace(/\s*USD$/, '')}
        </Text>
      )}
    </>
  )
}
