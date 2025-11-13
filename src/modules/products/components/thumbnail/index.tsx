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
        "relative w-full h-full aspect-[1/1] p-0 overflow-hidden shadow-none bg-white ",
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
}: Pick<ThumbnailProps, "size" | "product" | "priority"> & {
  image?: string
}) => {
  const getAltText = () => {
    if (!product) return "Thumbnail"
    const brand = (product as any).brands?.[0]?.name || "Product"
    const title = product.title || ""
    return `${brand} ${title}`.trim()
  }

  return image ? (
    <Image
      src={image}
      alt={getAltText()}
      className="absolute inset-0 object-contain object-center"
      draggable={false}
      quality={80}
      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
      fill
      priority={priority || size === "full" || size === "large"}
      loading={priority || size === "full" || size === "large" ? undefined : "lazy"}
      placeholder="blur"
      blurDataURL={`data:image/svg+xml;base64,${Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><filter id="b"><feGaussianBlur stdDeviation="12" /></filter><rect width="100%" height="100%" fill="#f3f4f6" filter="url(#b)"/></svg>`
      ).toString('base64')}`}
    />
  ) : (
    <div className="w-full h-full absolute inset-0 flex items-center justify-center">
      <PlaceholderImage size={size === "small" ? 16 : 24} />
    </div>
  )
}

export default Thumbnail
