"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { trackViewContent } from "@lib/util/meta-pixel"

type MetaPixelViewContentProps = {
  productId: string
  contentName?: string
  value?: number
  currency?: string
}

export default function MetaPixelViewContent({
  productId,
  contentName,
  value,
  currency,
}: MetaPixelViewContentProps) {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname?.includes("/products/") || !productId) {
      return
    }

    trackViewContent({
      value,
      currency,
      contentName,
      contentIds: [productId],
      contentType: "product",
      contents: [
        {
          id: productId,
          quantity: 1,
          item_price: value,
        },
      ],
    })
  }, [pathname, productId, contentName, value, currency])

  return null
}
