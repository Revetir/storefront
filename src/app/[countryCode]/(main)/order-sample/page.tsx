import { Metadata } from "next"
import OrderCompletedTemplate from "@modules/order/templates/order-completed-template"
import { HttpTypes } from "@medusajs/types"

export const metadata: Metadata = {
  title: "Order Sample - Test Page",
  description: "Test page for visualizing order completion template",
}

type MockLineItemInput = {
  id: string
  title: string
  productId: string
  productTitle: string
  productHandle: string
  variantId: string
  variantTitle: string
  sku: string
  optionValues: Record<string, unknown>
  quantity: number
  unitPrice: number
  thumbnail: string
}

const buildLineItem = (
  input: MockLineItemInput,
  createdAt: Date
): HttpTypes.StoreOrderLineItem => {
  const subtotal = input.unitPrice * input.quantity
  const createdAtIso = createdAt.toISOString()

  const lineItem: HttpTypes.StoreOrderLineItem = {
    id: input.id,
    title: input.title,
    subtitle: null,
    thumbnail: input.thumbnail,
    variant_id: input.variantId,
    product_id: input.productId,
    product_title: input.productTitle,
    product_description: null,
    product_subtitle: null,
    product_type_id: null,
    product_type: null,
    product_collection: null,
    product_handle: input.productHandle,
    variant_sku: input.sku,
    variant_barcode: null,
    variant_title: input.variantTitle,
    variant_option_values: input.optionValues,
    requires_shipping: true,
    is_discountable: true,
    is_tax_inclusive: false,
    unit_price: input.unitPrice,
    quantity: input.quantity,
    detail: {} as HttpTypes.StoreOrderLineItem["detail"],
    created_at: createdAt,
    updated_at: createdAt,
    metadata: null,
    original_total: subtotal,
    original_subtotal: subtotal,
    original_tax_total: 0,
    item_total: input.unitPrice,
    item_subtotal: input.unitPrice,
    item_tax_total: 0,
    total: subtotal,
    subtotal,
    tax_total: 0,
    discount_total: 0,
    discount_tax_total: 0,
    refundable_total: subtotal,
    refundable_total_per_unit: input.unitPrice,
    variant: {
      id: input.variantId,
      title: input.variantTitle,
      sku: input.sku,
      barcode: null,
      ean: null,
      upc: null,
      allow_backorder: false,
      manage_inventory: false,
      hs_code: null,
      origin_country: null,
      mid_code: null,
      material: null,
      weight: null,
      length: null,
      height: null,
      width: null,
      options: null,
      product_id: input.productId,
      created_at: createdAtIso,
      updated_at: createdAtIso,
      deleted_at: null,
      metadata: null,
    },
  }

  lineItem.detail = {
    id: `detail_${input.id}`,
    item_id: input.id,
    item: lineItem as HttpTypes.StoreOrderLineItem["detail"]["item"],
    quantity: input.quantity,
    fulfilled_quantity: input.quantity,
    delivered_quantity: 0,
    shipped_quantity: input.quantity,
    return_requested_quantity: 0,
    return_received_quantity: 0,
    return_dismissed_quantity: 0,
    written_off_quantity: 0,
    metadata: null,
    created_at: createdAt,
    updated_at: createdAt,
  }

  return lineItem
}

export default async function OrderSamplePage() {
  const now = new Date()
  const nowIso = now.toISOString()

  const lineItems = [
    buildLineItem(
      {
        id: "item_01",
        title: "Premium Cotton T-Shirt",
        productId: "prod_01",
        productTitle: "Premium Cotton T-Shirt",
        productHandle: "premium-cotton-t-shirt",
        variantId: "variant_01",
        variantTitle: "Medium / Black",
        sku: "TSHIRT-M-BLK",
        optionValues: { Size: "Medium", Color: "Black" },
        quantity: 2,
        unitPrice: 2999,
        thumbnail: "https://placehold.co/400x400/e2e8f0/1e293b?text=T-Shirt",
      },
      now
    ),
    buildLineItem(
      {
        id: "item_02",
        title: "Classic Denim Jeans",
        productId: "prod_02",
        productTitle: "Classic Denim Jeans",
        productHandle: "classic-denim-jeans",
        variantId: "variant_02",
        variantTitle: "32 / Dark Blue",
        sku: "JEANS-32-DKBL",
        optionValues: { Size: "32", Color: "Dark Blue" },
        quantity: 1,
        unitPrice: 7999,
        thumbnail: "https://placehold.co/400x400/dbeafe/1e40af?text=Jeans",
      },
      now
    ),
    buildLineItem(
      {
        id: "item_03",
        title: "Leather Belt",
        productId: "prod_03",
        productTitle: "Leather Belt",
        productHandle: "leather-belt",
        variantId: "variant_03",
        variantTitle: "Large / Brown",
        sku: "BELT-L-BRN",
        optionValues: { Size: "Large", Color: "Brown" },
        quantity: 1,
        unitPrice: 3499,
        thumbnail: "https://placehold.co/400x400/fef3c7/92400e?text=Belt",
      },
      now
    ),
  ]

  const itemsTotal = lineItems.reduce((sum, item) => sum + item.total, 0)
  const shippingTotal = 999
  const orderTotal = itemsTotal + shippingTotal

  const shippingAddress: HttpTypes.StoreOrderAddress = {
    id: "addr_01",
    first_name: "John",
    last_name: "Doe",
    address_1: "123 Main Street",
    address_2: "Apt 4B",
    city: "New York",
    province: "NY",
    postal_code: "10001",
    country_code: "us",
    phone: "+1 (555) 123-4567",
    metadata: null,
    created_at: nowIso,
    updated_at: nowIso,
  }

  const billingAddress: HttpTypes.StoreOrderAddress = {
    ...shippingAddress,
    id: "addr_02",
  }

  const mockOrder: HttpTypes.StoreOrder = {
    id: "order_01234567890abcdef",
    display_id: 1234,
    email: "customer@example.com",
    created_at: nowIso,
    updated_at: nowIso,
    status: "completed",
    fulfillment_status: "fulfilled",
    payment_status: "captured",
    currency_code: "usd",
    region_id: "reg_01",
    customer_id: "cus_01",
    sales_channel_id: "sc_01",
    shipping_address: shippingAddress,
    billing_address: billingAddress,
    items: lineItems,
    shipping_methods: [
      {
        id: "sm_01",
        order_id: "order_01234567890abcdef",
        name: "Standard Shipping",
        amount: shippingTotal,
        is_tax_inclusive: false,
        shipping_option_id: "so_standard",
        data: null,
        metadata: null,
        original_total: shippingTotal,
        original_subtotal: shippingTotal,
        original_tax_total: 0,
        total: shippingTotal,
        subtotal: shippingTotal,
        tax_total: 0,
        discount_total: 0,
        discount_tax_total: 0,
        created_at: nowIso,
        updated_at: nowIso,
      },
    ],
    payment_collections: [
      {
        id: "paycol_01",
        currency_code: "usd",
        amount: orderTotal,
        status: "completed",
        payment_providers: [{ id: "pp_stripe_stripe" }],
        payments: [
          {
            id: "pay_01",
            amount: orderTotal,
            currency_code: "usd",
            provider_id: "pp_stripe_stripe",
            data: {
              card_last4: "4242",
              card_brand: "visa",
            },
            created_at: nowIso,
            updated_at: nowIso,
            captured_at: nowIso,
          },
        ],
        created_at: nowIso,
        updated_at: nowIso,
      },
    ],
    summary: {
      pending_difference: 0,
      current_order_total: orderTotal,
      original_order_total: orderTotal,
      transaction_total: orderTotal,
      paid_total: orderTotal,
      refunded_total: 0,
      accounting_total: orderTotal,
    },
    original_item_total: itemsTotal,
    original_item_subtotal: itemsTotal,
    original_item_tax_total: 0,
    item_total: itemsTotal,
    item_subtotal: itemsTotal,
    item_tax_total: 0,
    item_discount_total: 0,
    original_total: orderTotal,
    original_subtotal: orderTotal,
    original_tax_total: 0,
    total: orderTotal,
    subtotal: orderTotal,
    tax_total: 0,
    discount_total: 0,
    discount_tax_total: 0,
    gift_card_total: 0,
    gift_card_tax_total: 0,
    shipping_total: shippingTotal,
    shipping_subtotal: shippingTotal,
    shipping_tax_total: 0,
    shipping_discount_total: 0,
    original_shipping_total: shippingTotal,
    original_shipping_subtotal: shippingTotal,
    original_shipping_tax_total: 0,
    credit_line_total: 0,
    metadata: null,
  }

  return <OrderCompletedTemplate order={mockOrder} />
}
