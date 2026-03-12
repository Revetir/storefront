"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import {
  getAuthHeaders,
  getCacheOptions,
  getCacheTag,
  getCartId,
  removeCartId,
  setCartId,
} from "./cookies"
import { getRegion } from "./regions"

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const isRetryableCartCompletionError = (
  message: string | undefined,
  type: string | undefined
): boolean => {
  const combined = `${type ?? ""} ${message ?? ""}`.toLowerCase()

  return (
    combined.includes("pending") ||
    combined.includes("authorize") ||
    combined.includes("in progress")
  )
}

/**
 * Retrieves a cart by its ID. If no ID is provided, it will use the cart ID from the cookies.
 * @param cartId - optional - The ID of the cart to retrieve.
 * @returns The cart object if found, or null if not found.
 */
export async function retrieveCart(cartId?: string) {
  const id = cartId || (await getCartId())

  if (!id) {
    return null
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("carts")),
  }

  return await sdk.client
    .fetch<HttpTypes.StoreCartResponse>(`/store/carts/${id}`, {
      method: "GET",
      query: {
        fields:
          "*items, *region, *items.product, *items.variant, *items.thumbnail, *items.metadata, +items.total, +items.original_total, *promotions, +shipping_methods.name, +items.product.brands.*",
      },
      headers,
      next,
      cache: "force-cache",
    })
    .then(({ cart }) => cart)
    .catch(() => null)
}

export async function getOrSetCart(countryCode: string) {
  const region = await getRegion(countryCode)

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  let cart = await retrieveCart()

  const headers = {
    ...(await getAuthHeaders()),
  }

  if (!cart) {
    // Create new cart
    const cartResp = await sdk.store.cart.create(
      { region_id: region.id },
      {},
      headers
    )
    cart = cartResp.cart

    await setCartId(cart.id)

    // Single cache invalidation for new cart
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag, "max")
  } else if (cart?.region_id !== region.id) {
    // Update cart region if needed
    await sdk.store.cart.update(cart.id, { region_id: region.id }, {}, headers)
    
    // Single cache invalidation for region update
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag, "max")
  }

  return cart
}

export async function updateCart(data: HttpTypes.StoreUpdateCart) {
  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("No existing cart found, please create one before updating")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.cart
    .update(cartId, data, {}, headers)
    .then(async ({ cart }) => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag, "max")

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag, "max")

      return cart
    })
    .catch(medusaError)
}

export async function addToCart({
  variantId,
  quantity,
  countryCode,
}: {
  variantId: string
  quantity: number
  countryCode: string
}) {
  if (!variantId) {
    throw new Error("Missing variant ID when adding to cart")
  }

  const cart = await getOrSetCart(countryCode)

  if (!cart) {
    throw new Error("Error retrieving or creating cart")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  // Batch the line item creation and cache invalidation
  await sdk.store.cart
    .createLineItem(
      cart.id,
      {
        variant_id: variantId,
        quantity,
      },
      {},
      headers
    )
    .then(async () => {
      // Batch cache invalidations to reduce overhead
      const [cartCacheTag, fulfillmentCacheTag] = await Promise.all([
        getCacheTag("carts"),
        getCacheTag("fulfillment")
      ])
      
      // Use Promise.all for concurrent cache invalidation
      await Promise.all([
        revalidateTag(cartCacheTag, "max"),
        revalidateTag(fulfillmentCacheTag, "max")
      ])
    })
    .catch(medusaError)
}

export async function updateLineItem({
  lineId,
  quantity,
}: {
  lineId: string
  quantity: number
}) {
  if (!lineId) {
    throw new Error("Missing lineItem ID when updating line item")
  }

  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("Missing cart ID when updating line item")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.store.cart
    .updateLineItem(cartId, lineId, { quantity }, {}, headers)
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag, "max")

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag, "max")
    })
    .catch(medusaError)
}

export async function deleteLineItem(lineId: string) {
  if (!lineId) {
    throw new Error("Missing lineItem ID when deleting line item")
  }

  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("Missing cart ID when deleting line item")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.store.cart
    .deleteLineItem(cartId, lineId, headers)
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag, "max")

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag, "max")
    })
    .catch(medusaError)
}

export async function setShippingMethod({
  cartId,
  shippingMethodId,
}: {
  cartId: string
  shippingMethodId: string
}) {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.cart
    .addShippingMethod(cartId, { option_id: shippingMethodId }, {}, headers)
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag, "max")
    })
    .catch(medusaError)
}

export async function initiatePaymentSession(
  cart: HttpTypes.StoreCart,
  data: HttpTypes.StoreInitializePaymentSession
) {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.payment
    .initiatePaymentSession(cart, data, {}, headers)
    .then(async (resp) => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag, "max")
      return resp
    })
    .catch(medusaError)
}

export async function applyPromotions(codes: string[]) {
  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("No existing cart found")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.cart
    .update(cartId, { promo_codes: codes }, {}, headers)
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag, "max")

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag, "max")
    })
    .catch(medusaError)
}

export async function applyGiftCard(code: string) {
  //   const cartId = getCartId()
  //   if (!cartId) return "No cartId cookie found"
  //   try {
  //     await updateCart(cartId, { gift_cards: [{ code }] }).then(() => {
  //       revalidateTag("cart")
  //     })
  //   } catch (error: any) {
  //     throw error
  //   }
}

export async function removeDiscount(code: string) {
  // const cartId = getCartId()
  // if (!cartId) return "No cartId cookie found"
  // try {
  //   await deleteDiscount(cartId, code)
  //   revalidateTag("cart")
  // } catch (error: any) {
  //   throw error
  // }
}

export async function removeGiftCard(
  codeToRemove: string,
  giftCards: any[]
  // giftCards: GiftCard[]
) {
  //   const cartId = getCartId()
  //   if (!cartId) return "No cartId cookie found"
  //   try {
  //     await updateCart(cartId, {
  //       gift_cards: [...giftCards]
  //         .filter((gc) => gc.code !== codeToRemove)
  //         .map((gc) => ({ code: gc.code })),
  //     }).then(() => {
  //       revalidateTag("cart")
  //     })
  //   } catch (error: any) {
  //     throw error
  //   }
}

export async function submitPromotionForm(
  currentState: unknown,
  formData: FormData
) {
  const code = formData.get("code") as string
  try {
    await applyPromotions([code])
  } catch (e: any) {
    return e.message
  }
}

// TODO: Pass a POJO instead of a form entity here
export async function setAddresses(currentState: unknown, formData: FormData) {
  try {
    if (!formData) {
      throw new Error("No form data found when setting addresses")
    }

    const cartId = await getCartId()
    if (!cartId) {
      throw new Error("No existing cart found when setting addresses")
    }

    const cart = await retrieveCart(cartId)
    if (!cart) {
      throw new Error("No existing cart found when setting addresses")
    }

    const addressFields = [
      "first_name",
      "last_name",
      "address_1",
      "address_2",
      "company",
      "postal_code",
      "city",
      "country_code",
      "province",
      "phone",
    ] as const

    const getFormValue = (key: string) => {
      if (!formData.has(key)) {
        return undefined
      }

      const value = formData.get(key)
      if (value === null) {
        return undefined
      }

      if (typeof value === "string") {
        return value.trim()
      }

      return String(value)
    }

    const buildAddressUpdate = (
      prefix: "shipping_address" | "billing_address",
      existingAddress: HttpTypes.StoreCartAddress | null | undefined
    ) => {
      const hasAnyField = addressFields.some((field) =>
        formData.has(`${prefix}.${field}`)
      )

      if (!hasAnyField) {
        return { hasAnyField: false, address: existingAddress || null }
      }

      const nextAddress = {
        first_name: existingAddress?.first_name ?? "",
        last_name: existingAddress?.last_name ?? "",
        address_1: existingAddress?.address_1 ?? "",
        address_2: existingAddress?.address_2 ?? "",
        company: existingAddress?.company ?? "",
        postal_code: existingAddress?.postal_code ?? "",
        city: existingAddress?.city ?? "",
        country_code: existingAddress?.country_code ?? "",
        province: existingAddress?.province ?? "",
        phone: existingAddress?.phone ?? "",
      } as Record<(typeof addressFields)[number], string>

      addressFields.forEach((field) => {
        const value = getFormValue(`${prefix}.${field}`)
        if (value !== undefined) {
          nextAddress[field] = value
        }
      })

      return { hasAnyField: true, address: nextAddress }
    }

    const shippingUpdate = buildAddressUpdate(
      "shipping_address",
      cart.shipping_address
    )
    const billingUpdate = buildAddressUpdate(
      "billing_address",
      cart.billing_address
    )

    const sameAsBilling = formData.get("same_as_billing")
    const shouldReuseShippingForBilling =
      sameAsBilling === "on" ||
      (sameAsBilling !== "off" && !billingUpdate.hasAnyField)

    const data: HttpTypes.StoreUpdateCart = {}

    if (shippingUpdate.hasAnyField && shippingUpdate.address) {
      data.shipping_address = shippingUpdate.address
    }

    const email = getFormValue("email")
    if (email !== undefined) {
      data.email = email
    }

    if (shouldReuseShippingForBilling) {
      const shippingForBilling = shippingUpdate.address || cart.shipping_address
      if (shippingForBilling) {
        data.billing_address = shippingForBilling
      }
    } else if (billingUpdate.hasAnyField && billingUpdate.address) {
      data.billing_address = billingUpdate.address
    }

    if (Object.keys(data).length > 0) {
      await updateCart(data)
    }
  } catch (e: any) {
    return e.message
  }
}

/**
 * Places an order for a cart. If no cart ID is provided, it will use the cart ID from the cookies.
 * @param cartId - optional - The ID of the cart to place an order for.
 * @returns The cart object if the order was successful, or null if not.
 */
export async function placeOrder(cartId?: string) {
  const id = cartId || (await getCartId())

  if (!id) {
    throw new Error("No existing cart found when placing an order")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  let attempts = 0
  const maxAttempts = 4

  while (attempts < maxAttempts) {
    attempts += 1

    const cartRes = await sdk.store.cart
      .complete(id, {}, headers)
      .then(async (cartRes) => {
        const cartCacheTag = await getCacheTag("carts")
        revalidateTag(cartCacheTag, "max")
        return cartRes
      })
      .catch(medusaError)

    if (cartRes?.type === "order") {
      const countryCode =
        cartRes.order.shipping_address?.country_code?.toLowerCase()

      const orderCacheTag = await getCacheTag("orders")
      revalidateTag(orderCacheTag, "max")

      await removeCartId()
      redirect(`/${countryCode}/order/${cartRes?.order.id}/confirmed`)
    }

    const shouldRetry =
      attempts < maxAttempts &&
      isRetryableCartCompletionError(
        cartRes?.error?.message,
        cartRes?.error?.type
      )

    if (shouldRetry) {
      await wait(250 * attempts)
      continue
    }

    throw new Error(
      cartRes?.error?.message ||
        "Failed to complete checkout. Please contact support with your cart ID."
    )
  }
}

/**
 * Updates the countrycode param and revalidates the regions cache
 * @param regionId
 * @param countryCode
 */
export async function updateRegion(countryCode: string, currentPath: string) {
  const cartId = await getCartId()
  const region = await getRegion(countryCode)

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  if (cartId) {
    await updateCart({ region_id: region.id })
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag, "max")
  }

  const regionCacheTag = await getCacheTag("regions")
  revalidateTag(regionCacheTag, "max")

  const productsCacheTag = await getCacheTag("products")
  revalidateTag(productsCacheTag, "max")

  redirect(`/${countryCode}${currentPath}`)
}

export async function listCartOptions() {
  const cartId = await getCartId()
  const headers = {
    ...(await getAuthHeaders()),
  }
  const next = {
    ...(await getCacheOptions("shippingOptions")),
  }

  return await sdk.client.fetch<{
    shipping_options: HttpTypes.StoreCartShippingOption[]
  }>("/store/shipping-options", {
    query: { cart_id: cartId },
    next,
    headers,
    cache: "force-cache",
  })
}
