import { Container, clx } from "@medusajs/ui"
import Image from "next/image"
import React from "react"
import { HttpTypes } from "@medusajs/types"

import PlaceholderImage from "@modules/common/icons/placeholder-image"

type ThumbnailProps = {
  thumbnail?: string | null
  // TODO: Fix image typings
  images?: any[] | null
  size?: "small" | "medium" | "large" | "full" | "square"
  isFeatured?: boolean
  className?: string
  "data-testid"?: string
  product?: HttpTypes.StoreProduct
  priority?: boolean
}

const Thumbnail: React.FC<ThumbnailProps> = ({
  thumbnail,
  images,
  size = "small",
  isFeatured,
  className,
  "data-testid": dataTestid,
  product,
  priority = false,
}) => {
  const initialImage = thumbnail || images?.[0]?.url
  const brand = product?.brand?.name || null

  return (
    <Container
      className={clx(
        "relative w-full h-full aspect-[1/1] p-0 overflow-hidden shadow-none p-4 bg-ui-bg-subtle ",
        className
      )}
      data-testid={dataTestid}
    >
      {brand && (
        <span className="absolute top-2 left-2 z-10 bg-ui-bg-base text-ui-fg-base text-xs font-medium px-2 py-0.5 rounded-md shadow-md">
          {brand}
        </span>
      )}

      <ImageOrPlaceholder
        image={initialImage}
        size={size}
        product={product}
        priority={priority}
      />
    </Container>
  )
}

const ImageOrPlaceholder = ({
  image,
  size,
  product,
  priority = false,
}: Pick<ThumbnailProps, "size" | "product" | "priority"> & {
  image?: string
}) => {
  const getAltText = () => {
    if (!product) return "Thumbnail"
    const brand = product.type?.value || "Product"
    const title = product.title || ""
    return `${brand} ${title}`.trim()
  }

  return image ? (
    <Image
      src={image}
      alt={getAltText()}
      className="absolute inset-0 object-cover object-center"
      draggable={false}
      quality={80}
      sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, (max-width: 1200px) 600px, 800px"
      fill
      priority={priority || size === "full" || size === "large"}
      unoptimized={true}
    />
  ) : (
    <div className="w-full h-full absolute inset-0 flex items-center justify-center">
      <PlaceholderImage size={size === "small" ? 16 : 24} />
    </div>
  )
}

export default Thumbnail
