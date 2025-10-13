"use client"

import React, { useState } from "react"
import { HttpTypes } from "@medusajs/types"
import SizingModal from "@modules/products/components/sizing-modal"
import { trackSizeGuideOpened } from "@lib/util/analytics"

interface SizeGuideLinkProps {
  product: HttpTypes.StoreProduct
}

const SizeGuideLink: React.FC<SizeGuideLinkProps> = ({ product }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = () => {
    setIsModalOpen(true)

    // Track size guide opened
    trackSizeGuideOpened({
      product_id: product.id || '',
      product_name: product.title,
      brand: (product as any)?.brand?.name,
    })
  }

  const closeModal = () => setIsModalOpen(false)

  return (
  <>
    <div className="mt-2 text-sm text-gray-900">
      <span className="mr-1">Need help with sizing?</span>
      <button
        onClick={openModal}
        className="hover:text-gray-800 underline underline-offset-2 cursor-pointer"
        data-testid="size-guide-link"
      >
        Size Guide
      </button>
    </div>

    <SizingModal
      isOpen={isModalOpen}
      close={closeModal}
      product={product}
    />
  </>
  )
}

export default SizeGuideLink


