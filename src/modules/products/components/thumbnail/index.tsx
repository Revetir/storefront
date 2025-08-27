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

  return (
    <Container
      className={clx(
        "relative w-full h-full aspect-[1/1] p-0 overflow-hidden shadow-none p-4 bg-ui-bg-subtle ",
        className
      )}
      data-testid={dataTestid}
    >
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
}: Pick<ThumbnailProps, "size" | "product" | "priority"> & { image?: string }) => {
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
      placeholder="blur"
      blurDataURL={`data:image/svg+xml;base64,${Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><filter id="b"><feGaussianBlur stdDeviation="12" /></filter><image preserveAspectRatio="none" filter="url(#b)" href="${image}" width="100%" height="100%"/></svg>`
      ).toString('base64')}`}
    />
  ) : (
    <div className="w-full h-full absolute inset-0 flex items-center justify-center">
      <PlaceholderImage size={size === "small" ? 16 : 24} />
    </div>
  )
}

export default Thumbnail
