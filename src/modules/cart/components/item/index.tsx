"use client"

import { Table, Text, clx } from "@medusajs/ui"
import { updateLineItem } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import CartItemSelect from "@modules/cart/components/cart-item-select"
import ErrorMessage from "@modules/checkout/components/error-message"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Spinner from "@modules/common/icons/spinner"
import Thumbnail from "@modules/products/components/thumbnail"
import React, { useState } from "react"
import { trackQuantityChange } from "@lib/util/analytics"
import { formatBrandNames, getProductUrl, getPrimaryBrand, getBrandsArray } from "@lib/util/brand-utils"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview"
  currencyCode: string
}

const Item = ({ item, type = "full", currencyCode }: ItemProps) => {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const changeQuantity = async (quantity: number) => {
    setError(null)
    setUpdating(true)

    const oldQuantity = item.quantity

    try {
      await updateLineItem({
        lineId: item.id,
        quantity,
      })

      // Track quantity change
      const primaryBrand = getPrimaryBrand((item.product as any)?.brands)
      trackQuantityChange({
        product_id: item.product_id || '',
        product_name: item.product_title,
        brand: primaryBrand?.name,
        variant_id: item.variant_id,
        variant_name: item.variant?.title || undefined,
        old_quantity: oldQuantity,
        new_quantity: quantity,
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUpdating(false)
    }
  }

  // TODO: Update this to grab the actual max inventory
  const maxQtyFromInventory = 10
  const maxQuantity = item.variant?.manage_inventory ? 10 : maxQtyFromInventory

  const brands = getBrandsArray((item.product as any)?.brands)
  const productUrl = getProductUrl((item.product as any)?.brands, item.product_handle || "")
  const primaryBrand = getPrimaryBrand((item.product as any)?.brands)

  return (
    <Table.Row className="w-full [&:hover]:bg-transparent" data-testid="product-row">
      <Table.Cell className="!pl-0 p-4 w-24">
        <LocalizedClientLink
          href={productUrl}
          className={clx("flex", {
            "w-16": type === "preview",
            "lg:w-24 w-12": type === "full",
          })}
        >
          <Thumbnail
            thumbnail={item.thumbnail}
            images={item.variant?.product?.images}
            size="square"
            product={{
              brand: { name: primaryBrand?.name || "Product" },
              title: item.product_title || ""
            } as any}
          />
        </LocalizedClientLink>
      </Table.Cell>

      <Table.Cell className="text-left py-3 !pr-0 lg:pr-4">
        {brands.length > 0 && (
          <Text className="text-ui-fg-muted text-small font-medium">
            {brands.map((brand, idx, arr) => (
              <React.Fragment key={brand.slug}>
                <span className="uppercase">{brand.name}</span>
                {idx < arr.length - 1 && <span> x </span>}
              </React.Fragment>
            ))}
          </Text>
        )}
        <Text
          className="txt-medium-plus text-ui-fg-base"
          data-testid="product-title"
        >
          {item.product_title}
        </Text>
        <LineItemOptions variant={item.variant} data-testid="product-variant" />
      </Table.Cell>

      {type === "full" && (
        <Table.Cell className="hidden lg:table-cell">
          <div className="flex gap-2 items-center w-28">
            <DeleteButton
              id={item.id}
              data-testid="product-delete-button"
              trackingData={{
                product_id: item.product_id,
                product_name: item.product_title,
                brand: primaryBrand?.name,
                variant_id: item.variant_id,
                variant_name: item.variant?.title || undefined,
                quantity: item.quantity,
              }}
            />
            <CartItemSelect
              value={item.quantity}
              onChange={(value) => changeQuantity(parseInt(value.target.value))}
              className="w-14 h-10 p-4"
              data-testid="product-select-button"
            >
              {/* TODO: Update this with the v2 way of managing inventory */}
              {Array.from(
                {
                  length: Math.min(maxQuantity, 10),
                },
                (_, i) => (
                  <option value={i + 1} key={i}>
                    {i + 1}
                  </option>
                )
              )}
            </CartItemSelect>
            {updating && <Spinner />}
          </div>
          <ErrorMessage error={error} data-testid="product-error-message" />
        </Table.Cell>
      )}

      {type === "full" && (
        <Table.Cell className="hidden lg:table-cell">
          <LineItemUnitPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </Table.Cell>
      )}

      <Table.Cell className="!pr-0">
        <div className="relative h-full flex items-center justify-end lg:justify-center">
          {/* Price - centered vertically */}
          <LineItemPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />

          {/* Preview mode: quantity x unit price below */}
          {type === "preview" && (
            <span className="flex gap-x-1 absolute bottom-1 right-0">
              <Text className="text-ui-fg-muted">{item.quantity}x </Text>
              <LineItemUnitPrice
                item={item}
                style="tight"
                currencyCode={currencyCode}
              />
            </span>
          )}

          {/* Full mode mobile: quantity controls and delete button at bottom right */}
          {type === "full" && (
            <div className="lg:hidden absolute bottom-1 right-0 flex items-center gap-1.5">
              <div className="flex items-center border border-ui-border-base rounded-md overflow-hidden">
                <button
                  onClick={() => changeQuantity(Math.max(1, item.quantity - 1))}
                  disabled={item.quantity <= 1 || updating}
                  className="px-1.5 py-0.5 hover:bg-ui-bg-subtle transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="px-1.5 py-0.5 text-xs font-medium min-w-[1.5rem] text-center border-x border-ui-border-base">
                  {item.quantity}
                </span>
                <button
                  onClick={() => changeQuantity(Math.min(maxQuantity, item.quantity + 1))}
                  disabled={item.quantity >= maxQuantity || updating}
                  className="px-1.5 py-0.5 hover:bg-ui-bg-subtle transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              {updating && <Spinner />}
              <DeleteButton
                id={item.id}
                data-testid="product-delete-button-mobile"
                trackingData={{
                  product_id: item.product_id,
                  product_name: item.product_title,
                  brand: primaryBrand?.name,
                  variant_id: item.variant_id,
                  variant_name: item.variant?.title || undefined,
                  quantity: item.quantity,
                }}
              />
            </div>
          )}
        </div>
      </Table.Cell>
    </Table.Row>
  )
}

export default Item
