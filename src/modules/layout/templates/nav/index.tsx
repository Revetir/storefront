import { Suspense } from "react"
import { listRegions } from "@lib/data/regions"
import { listCategories, type Category } from "@lib/data/categories"
import { listBrands, type Brand } from "@lib/data/brands"
import { StoreRegion } from "@medusajs/types"
import { retrieveCustomer } from "@lib/data/customer"
import { retrieveCart } from "@lib/data/cart"
import NavClient from "./nav-client"

const DESIGN_MODE = process.env.NEXT_PUBLIC_DESIGN_MODE === "true"

export default async function Nav() {
  let regions: StoreRegion[]
  let customer: Awaited<ReturnType<typeof retrieveCustomer>>
  let categories: Category[]
  let brands: Brand[]
  let cart: Awaited<ReturnType<typeof retrieveCart>>

  if (DESIGN_MODE) {
    // Use mock data in design mode
    regions = [
      {
        id: "mock-region-us",
        name: "United States",
        currency_code: "usd",
        countries: [{ id: 1, iso_2: "us", name: "United States" }],
      },
    ] as any
    customer = null
    categories = []
    brands = []
    cart = null
  } else {
    // Fetch real data from backend
    regions = await listRegions().then((regions: StoreRegion[]) => regions)
    customer = await retrieveCustomer()
    categories = await listCategories()
    brands = await listBrands()
    cart = await retrieveCart().catch(() => null)
  }

  return <NavClient regions={regions} customer={customer} categories={categories} brands={brands} cart={cart} />
}
