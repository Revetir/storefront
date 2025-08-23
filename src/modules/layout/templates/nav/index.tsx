import { Suspense } from "react"
import { listRegions } from "@lib/data/regions"
import { listCategories } from "@lib/data/categories"
import { StoreRegion } from "@medusajs/types"
import { retrieveCustomer } from "@lib/data/customer"
import { retrieveCart } from "@lib/data/cart"
import { Category } from "@lib/data/categories"
import NavClient from "./nav-client"

export default async function Nav() {
  const regions = await listRegions().then((regions: StoreRegion[]) => regions)
  const customer = await retrieveCustomer()
  const categories = await listCategories()
  const cart = await retrieveCart().catch(() => null)

  return <NavClient regions={regions} customer={customer} categories={categories} cart={cart} />
}
