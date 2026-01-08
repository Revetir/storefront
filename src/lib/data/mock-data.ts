// Mock data for local development without backend
import { HttpTypes } from "@medusajs/types"

export const mockRegion: HttpTypes.StoreRegion = {
  id: "mock-region-us",
  name: "United States",
  currency_code: "usd",
  countries: [
    {
      id: 1,
      iso_2: "us",
      iso_3: "usa",
      num_code: 840,
      name: "UNITED STATES",
      display_name: "United States",
      region_id: "mock-region-us",
    },
  ],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
} as any

export const mockCollections: HttpTypes.StoreCollection[] = [
  {
    id: "mock-collection-1",
    handle: "new-arrivals",
    title: "New Arrivals",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "mock-collection-2",
    handle: "sale",
    title: "Sale",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "mock-collection-3",
    handle: "featured",
    title: "Featured",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
] as any

export const mockProducts: HttpTypes.StoreProduct[] = [
  {
    id: "mock-product-1",
    title: "Designer T-Shirt",
    handle: "designer-t-shirt",
    thumbnail: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variants: [
      {
        id: "mock-variant-1",
        title: "Small",
        calculated_price: {
          calculated_amount: 8500,
          currency_code: "usd",
        },
      },
    ],
  },
  {
    id: "mock-product-2",
    title: "Luxury Sneakers",
    handle: "luxury-sneakers",
    thumbnail: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variants: [
      {
        id: "mock-variant-2",
        title: "Medium",
        calculated_price: {
          calculated_amount: 12500,
          currency_code: "usd",
        },
      },
    ],
  },
  {
    id: "mock-product-3",
    title: "Premium Jacket",
    handle: "premium-jacket",
    thumbnail: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variants: [
      {
        id: "mock-variant-3",
        title: "Large",
        calculated_price: {
          calculated_amount: 24500,
          currency_code: "usd",
        },
      },
    ],
  },
  {
    id: "mock-product-4",
    title: "Designer Pants",
    handle: "designer-pants",
    thumbnail: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variants: [
      {
        id: "mock-variant-4",
        title: "Medium",
        calculated_price: {
          calculated_amount: 15500,
          currency_code: "usd",
        },
      },
    ],
  },
  {
    id: "mock-product-5",
    title: "Luxury Bag",
    handle: "luxury-bag",
    thumbnail: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variants: [
      {
        id: "mock-variant-5",
        title: "One Size",
        calculated_price: {
          calculated_amount: 35000,
          currency_code: "usd",
        },
      },
    ],
  },
  {
    id: "mock-product-6",
    title: "Premium Shirt",
    handle: "premium-shirt",
    thumbnail: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variants: [
      {
        id: "mock-variant-6",
        title: "Small",
        calculated_price: {
          calculated_amount: 9500,
          currency_code: "usd",
        },
      },
    ],
  },
  {
    id: "mock-product-7",
    title: "Designer Sunglasses",
    handle: "designer-sunglasses",
    thumbnail: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variants: [
      {
        id: "mock-variant-7",
        title: "One Size",
        calculated_price: {
          calculated_amount: 18500,
          currency_code: "usd",
        },
      },
    ],
  },
  {
    id: "mock-product-8",
    title: "Luxury Watch",
    handle: "luxury-watch",
    thumbnail: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variants: [
      {
        id: "mock-variant-8",
        title: "One Size",
        calculated_price: {
          calculated_amount: 45000,
          currency_code: "usd",
        },
      },
    ],
  },
  {
    id: "mock-product-9",
    title: "Premium Hoodie",
    handle: "premium-hoodie",
    thumbnail: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variants: [
      {
        id: "mock-variant-9",
        title: "Medium",
        calculated_price: {
          calculated_amount: 13500,
          currency_code: "usd",
        },
      },
    ],
  },
  {
    id: "mock-product-10",
    title: "Designer Boots",
    handle: "designer-boots",
    thumbnail: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variants: [
      {
        id: "mock-variant-10",
        title: "Size 10",
        calculated_price: {
          calculated_amount: 28500,
          currency_code: "usd",
        },
      },
    ],
  },
  {
    id: "mock-product-11",
    title: "Luxury Scarf",
    handle: "luxury-scarf",
    thumbnail: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variants: [
      {
        id: "mock-variant-11",
        title: "One Size",
        calculated_price: {
          calculated_amount: 7500,
          currency_code: "usd",
        },
      },
    ],
  },
  {
    id: "mock-product-12",
    title: "Premium Dress",
    handle: "premium-dress",
    thumbnail: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variants: [
      {
        id: "mock-variant-12",
        title: "Small",
        calculated_price: {
          calculated_amount: 22500,
          currency_code: "usd",
        },
      },
    ],
  },
  {
    id: "mock-product-13",
    title: "Designer Belt",
    handle: "designer-belt",
    thumbnail: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variants: [
      {
        id: "mock-variant-13",
        title: "Medium",
        calculated_price: {
          calculated_amount: 11500,
          currency_code: "usd",
        },
      },
    ],
  },
  {
    id: "mock-product-14",
    title: "Luxury Wallet",
    handle: "luxury-wallet",
    thumbnail: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variants: [
      {
        id: "mock-variant-14",
        title: "One Size",
        calculated_price: {
          calculated_amount: 6500,
          currency_code: "usd",
        },
      },
    ],
  },
  {
    id: "mock-product-15",
    title: "Premium Coat",
    handle: "premium-coat",
    thumbnail: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variants: [
      {
        id: "mock-variant-15",
        title: "Large",
        calculated_price: {
          calculated_amount: 32500,
          currency_code: "usd",
        },
      },
    ],
  },
] as any
