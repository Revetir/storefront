import { Metadata } from "next"
import OrderCompletedTemplate from "@modules/order/templates/order-completed-template"
import { HttpTypes } from "@medusajs/types"

export const metadata: Metadata = {
  title: "Order Sample - Test Page",
  description: "Test page for visualizing order completion template",
}

export default async function OrderSamplePage() {
  // Mock order data for visual testing
  const mockOrder: HttpTypes.StoreOrder = {
    id: "order_01234567890abcdef",
    display_id: 1234,
    email: "customer@example.com",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: "completed",
    fulfillment_status: "fulfilled",
    payment_status: "captured",
    currency_code: "usd",

    // Line items
    items: [
      {
        id: "item_01",
        title: "Premium Cotton T-Shirt",
        quantity: 2,
        unit_price: 2999,
        subtotal: 5998,
        total: 5998,
        original_total: 5998,
        original_tax_total: 0,
        tax_total: 0,
        discount_total: 0,
        thumbnail: "https://placehold.co/400x400/e2e8f0/1e293b?text=T-Shirt",
        variant: {
          id: "variant_01",
          title: "Medium / Black",
          sku: "TSHIRT-M-BLK",
          product: {
            id: "prod_01",
            title: "Premium Cotton T-Shirt",
            thumbnail: "https://placehold.co/400x400/e2e8f0/1e293b?text=T-Shirt",
          },
          options: [
            { value: "Medium" },
            { value: "Black" },
          ],
        },
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "item_02",
        title: "Classic Denim Jeans",
        quantity: 1,
        unit_price: 7999,
        subtotal: 7999,
        total: 7999,
        original_total: 7999,
        original_tax_total: 0,
        tax_total: 0,
        discount_total: 0,
        thumbnail: "https://placehold.co/400x400/dbeafe/1e40af?text=Jeans",
        variant: {
          id: "variant_02",
          title: "32 / Dark Blue",
          sku: "JEANS-32-DKBL",
          product: {
            id: "prod_02",
            title: "Classic Denim Jeans",
            thumbnail: "https://placehold.co/400x400/dbeafe/1e40af?text=Jeans",
          },
          options: [
            { value: "32" },
            { value: "Dark Blue" },
          ],
        },
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "item_03",
        title: "Leather Belt",
        quantity: 1,
        unit_price: 3499,
        subtotal: 3499,
        total: 3499,
        original_total: 3499,
        original_tax_total: 0,
        tax_total: 0,
        discount_total: 0,
        thumbnail: "https://placehold.co/400x400/fef3c7/92400e?text=Belt",
        variant: {
          id: "variant_03",
          title: "Large / Brown",
          sku: "BELT-L-BRN",
          product: {
            id: "prod_03",
            title: "Leather Belt",
            thumbnail: "https://placehold.co/400x400/fef3c7/92400e?text=Belt",
          },
          options: [
            { value: "Large" },
            { value: "Brown" },
          ],
        },
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],

    // Shipping address
    shipping_address: {
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },

    billing_address: {
      id: "addr_02",
      first_name: "John",
      last_name: "Doe",
      address_1: "123 Main Street",
      address_2: "Apt 4B",
      city: "New York",
      province: "NY",
      postal_code: "10001",
      country_code: "us",
      phone: "+1 (555) 123-4567",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },

    // Payment collections
    payment_collections: [
      {
        id: "paycol_01",
        amount: 18496,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: "captured",
        payments: [
          {
            id: "pay_01",
            amount: 18496,
            provider_id: "stripe",
            data: {
              card_last4: "4242",
              card_brand: "visa",
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      },
    ],

    // Shipping methods
    shipping_methods: [
      {
        id: "sm_01",
        name: "Standard Shipping",
        amount: 999,
        tax_total: 0,
        total: 999,
        original_total: 999,
        subtotal: 999,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],

    // Totals
    subtotal: 17496,
    discount_total: 0,
    item_tax_total: 0,
    shipping_total: 999,
    shipping_tax_total: 0,
    tax_total: 0,
    total: 18496,
    original_total: 18496,
    original_tax_total: 0,
    original_item_tax_total: 0,
    original_shipping_tax_total: 0,

    // Additional fields
    cart_id: "cart_01234567890",
    region_id: "reg_01",
    customer_id: "cus_01",
    sales_channel_id: "sc_01",
    canceled_at: null,
    metadata: {},
  } as HttpTypes.StoreOrder

  return <OrderCompletedTemplate order={mockOrder} />
}
