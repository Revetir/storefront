import repeat from "@lib/util/repeat"
import { HttpTypes } from "@medusajs/types"
import { Heading, Table } from "@medusajs/ui"

import Item from "@modules/cart/components/item"
import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item"

type ItemsTemplateProps = {
  cart?: HttpTypes.StoreCart
}

const ItemsTemplate = ({ cart }: ItemsTemplateProps) => {
  const items = cart?.items
  return (
    <div>
      <div className="pb-3 flex items-center">
        <Heading className="text-xl uppercase">Shopping Bag</Heading>
      </div>
      <Table>
        <Table.Header className="border-t-0 bg-transparent">
          <Table.Row className="text-ui-fg-subtle txt-medium-plus bg-transparent">
            <Table.HeaderCell className="!pl-0 bg-transparent uppercase">Item</Table.HeaderCell>
            <Table.HeaderCell className="bg-transparent"></Table.HeaderCell>
            <Table.HeaderCell className="hidden lg:table-cell bg-transparent uppercase">Quantity</Table.HeaderCell>
            <Table.HeaderCell className="hidden lg:table-cell bg-transparent uppercase">
              Price
            </Table.HeaderCell>
            <Table.HeaderCell className="!pr-0 text-right bg-transparent uppercase">
              Total
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {items
            ? items
                .sort((a, b) => {
                  return (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
                })
                .map((item) => {
                  return (
                    <Item
                      key={item.id}
                      item={item}
                      currencyCode={cart?.currency_code}
                    />
                  )
                })
            : repeat(5).map((i) => {
                return <SkeletonLineItem key={i} />
              })}
        </Table.Body>
      </Table>
    </div>
  )
}

export default ItemsTemplate
