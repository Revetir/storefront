import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCollectionByHandle, listCollections } from "@lib/data/collections"
import { listRegions } from "@lib/data/regions"
import { StoreCollection, StoreRegion } from "@medusajs/types"
import CollectionTemplate from "@modules/collections/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { listProductsWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"

type Props = {
  params: Promise<{ handle: string; countryCode: string }>
  searchParams: Promise<{
    page?: string
    sortBy?: SortOptions
  }>
}

export const PRODUCT_LIMIT = 60

export async function generateStaticParams() {
  const { collections } = await listCollections({
    fields: "*products",
  })

  if (!collections) {
    return []
  }

  const countryCodes = await listRegions().then(
    (regions: StoreRegion[]) =>
      regions
        ?.map((r) => r.countries?.map((c) => c.iso_2))
        .flat()
        .filter(Boolean) as string[]
  )

  const collectionHandles = collections.map(
    (collection: StoreCollection) => collection.handle
  )

  const staticParams = countryCodes
    ?.map((countryCode: string) =>
      collectionHandles.map((handle: string | undefined) => ({
        countryCode,
        handle,
      }))
    )
    .flat()

  return staticParams
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const collection = await getCollectionByHandle(params.handle)

  if (!collection) {
    notFound()
  }

  const metadata = {
    title: `${collection.title} | REVETIR`,
    description: `${collection.title} collection`,
  } as Metadata

  return metadata
}

export default async function CollectionPage(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params
  const { sortBy, page } = searchParams

  const collection = await getCollectionByHandle(params.handle).then(
    (collection: StoreCollection) => collection
  )

  if (!collection) {
    notFound()
  }

  // TODO: Replace with Algolia filtering
  // COMMENTED OUT: Medusa filtering logic - will be replaced with Algolia
  /*
  // Fetch product data on the server
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  const region = await getRegion(params.countryCode)

  if (!region) {
    notFound()
  }

  // Use server-side pagination
  const {
    response: { products, count },
    totalPages,
    currentPage,
  } = await listProductsWithSort({
    page: pageNumber,
    queryParams: {
      collection_id: [collection.id],
      // Include fields needed by the product grid (title/type) and brand for canonical links
      fields: "handle,title,thumbnail,*brand.*,*type.*",
    },
    sortBy: sort,
    countryCode: params.countryCode,
  })
  */

  const region = await getRegion(params.countryCode)
  if (!region) {
    notFound()
  }

  // TEMPORARY: Empty products array until Algolia filtering is implemented
  const products: any[] = []
  const count = 0
  const totalPages = 0
  const currentPage = 1

  return (
    <CollectionTemplate
      collection={collection}
      page={page}
      sortBy={sortBy}
      countryCode={params.countryCode}
      products={products}
      region={region}
      totalPages={totalPages}
      currentPage={currentPage}
    />
  )
}
