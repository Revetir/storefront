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
      {price.price_type === "sale" && "original_price" in price && price.original_price && (
        <Text
          className="line-through text-ui-fg-muted"
          data-testid="original-price"
        >
          {price.original_price}
        </Text>
      )}
      <Text
        className={clx("text-ui-fg-muted", {
          "text-ui-fg-interactive": price.price_type === "sale",
        })}
        data-testid="price"
      >
        {price.calculated_price}
      </Text>
    </>
  )
}
