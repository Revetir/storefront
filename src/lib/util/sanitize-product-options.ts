import { HttpTypes } from "@medusajs/types"

export const sanitizeProductOptions = (
  product: HttpTypes.StoreProduct
): HttpTypes.StoreProduct => {
  const sanitizedOptions = (product.options ?? [])
    .filter(Boolean)
    .map((option: any) => ({
      ...option,
      values: (option?.values ?? []).filter(
        (value: any) =>
          Boolean(value && typeof value.value === "string" && value.value.length > 0)
      ),
    }))

  const sanitizedVariants = (product.variants ?? [])
    .filter(Boolean)
    .map((variant: any) => ({
      ...variant,
      options: (variant?.options ?? []).filter(
        (option: any) =>
          Boolean(
            option &&
              typeof option.value === "string" &&
              option.value.length > 0 &&
              typeof option.option_id === "string" &&
              option.option_id.length > 0
          )
      ),
    }))

  return {
    ...product,
    options: sanitizedOptions,
    variants: sanitizedVariants,
  }
}
