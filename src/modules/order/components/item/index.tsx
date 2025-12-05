import { HttpTypes } from "@medusajs/types"
import { Table, Text } from "@medusajs/ui"

import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import Thumbnail from "@modules/products/components/thumbnail"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  currencyCode: string
}

const Item = ({ item, currencyCode }: ItemProps) => {
  const brands = (item as any).product?.brands as
    | Array<{ id: string; name: string }>
    | undefined
  const brandLabel =
    brands && brands.length
      ? brands.map((b) => (b.name || "").toUpperCase()).join(" x ")
      : null

  return (
    <Table.Row className="w-full hover:bg-transparent hover:text-inherit" data-testid="product-row">
      <Table.Cell className="!pl-0 p-4 w-24">
        <div className="flex w-16">
          <Thumbnail 
            thumbnail={item.thumbnail} 
            size="square" 
            product={{
              type: { value: "Product" },
              title: item.product_title || ""
            } as any}
          />
        </div>
      </Table.Cell>

      <Table.Cell className="text-left">
        {brandLabel && (
          <Text className="text-[11px] uppercase tracking-[0.12em] text-ui-fg-subtle mb-0.5">
            {brandLabel}
          </Text>
        )}
        <Text
          className="txt-medium-plus text-ui-fg-base"
          data-testid="product-name"
        >
          {item.product_title}
        </Text>
        <LineItemOptions
          variant={item.variant}
          data-testid="product-variant"
          size="text-sm"
        />
      </Table.Cell>

      <Table.Cell className="!pr-0">
        <span className="!pr-0 flex flex-col items-end h-full justify-center">
          <LineItemPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </span>
      </Table.Cell>
    </Table.Row>
  )
}

export default Item
