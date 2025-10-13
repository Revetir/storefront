import { deleteLineItem } from "@lib/data/cart"
import { Spinner, Trash } from "@medusajs/icons"
import { clx } from "@medusajs/ui"
import { useState } from "react"
import { trackRemoveFromBag } from "@lib/util/analytics"

type DeleteButtonProps = {
  id: string
  children?: React.ReactNode
  className?: string
  trackingData?: {
    product_id?: string
    product_name?: string
    brand?: string
    variant_id?: string
    variant_name?: string
    quantity?: number
  }
}

const DeleteButton = ({
  id,
  children,
  className,
  trackingData,
}: DeleteButtonProps) => {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (id: string) => {
    setIsDeleting(true)

    try {
      await deleteLineItem(id)

      // Track removal if tracking data is provided
      if (trackingData) {
        trackRemoveFromBag(trackingData)
      }
    } catch (err) {
      setIsDeleting(false)
    }
  }

  return (
    <div
      className={clx(
        "flex items-center justify-between text-small-regular",
        className
      )}
    >
      <button
        className="flex gap-x-1 text-ui-fg-subtle hover:text-ui-fg-base cursor-pointer"
        onClick={() => handleDelete(id)}
      >
        {isDeleting ? <Spinner className="animate-spin" /> : <Trash />}
        <span>{children}</span>
      </button>
    </div>
  )
}

export default DeleteButton
