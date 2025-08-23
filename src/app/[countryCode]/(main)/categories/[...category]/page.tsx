import { Metadata } from "next"
import { notFound } from "next/navigation"

import { listCategories, Category, getCategoryByFlatHandle } from "@lib/data/categories"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import CategoryTemplate from "@modules/categories/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { generateCategoryMetaDescription } from "@lib/util/meta-descriptions"
import { listProductsWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { listProductTypes } from "@lib/data/product-types"

type Props = {
  params: Promise<{ category: string[]; countryCode: string }>
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
    brand?: string
  }>
}

export async function generateStaticParams() {
  const product_categories = await listCategories()

  if (!product_categories) {
    return []
  }

  const countryCodes = await listRegions().then((regions: StoreRegion[]) =>
    regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat()
  )

  // Generate flat category paths (just the handle, not nested)
  const getAllCategoryHandles = (categories: Category[]): string[] => {
    const handles: string[] = []
    
    for (const category of categories) {
      handles.push(category.handle)
      
      // Recursively get handles for children
      if (category.children && category.children.length > 0) {
        handles.push(...getAllCategoryHandles(category.children))
      }
    }
    
    return handles
  }

  const allCategoryHandles = getAllCategoryHandles(product_categories)

  const staticParams = countryCodes
    ?.map((countryCode: string | undefined) =>
      allCategoryHandles.map((handle) => ({
        countryCode,
        category: [handle], // Single segment array for flat URLs
      }))
    )
    .flat()

  return staticParams
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  // For flat URLs, get the category by its handle directly
  const categoryHandle = params.category[0] // First (and only) segment
  const subtree = await getCategoryByFlatHandle(categoryHandle)
  
  if (!subtree) notFound()

  const title = `${subtree.name} | REVETIR`
  const description = generateCategoryMetaDescription(subtree.name)

  return {
    title,
    description,
    alternates: {
      canonical: `/categories/${categoryHandle}`,
    },
  }
}

export default async function CategoryPage(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params
  const { sortBy, page, brand } = searchParams

  // For flat URLs, get the category by its handle directly
  const categoryHandle = params.category[0] // First (and only) segment
  const subtree = await getCategoryByFlatHandle(categoryHandle)
  const allCats: Category[] = await listCategories()

  if (!subtree) {
    notFound()
  }

  // Fetch product data on the server
  const PRODUCT_LIMIT = 60
  const pageNumber = page ? parseInt(page, 10) : 1
  const sort = sortBy || "created_at"

  // Build category IDs for filtering
  function collectCategoryIds(cat: Category): string[] {
    return [cat.id, ...(cat.children || []).flatMap(collectCategoryIds)]
  }
  const allCategoryIds = collectCategoryIds(subtree)

  // Build query parameters
  const queryParams: any = {
    limit: PRODUCT_LIMIT,
    category_id: allCategoryIds,
  }

  if (sort === "created_at") {
    queryParams.order = "created_at"
  }

  // Convert brand value to type ID if brand filter is provided
  if (brand) {
    const productTypes = await listProductTypes()
    const typeObj = productTypes.find(t => t.value === brand)
    if (typeObj) {
      queryParams.type_id = [typeObj.id]
    }
  }

  const region = await getRegion(params.countryCode)

  if (!region) {
    notFound()
  }

  let {
    response: { products, count },
  } = await listProductsWithSort({
    page: pageNumber,
    queryParams,
    sortBy: sort,
    countryCode: params.countryCode,
  })

  const totalPages = Math.ceil(count / PRODUCT_LIMIT)

  return (
    <CategoryTemplate
      category={subtree}
      sortBy={sortBy}
      page={page}
      type={brand}
      countryCode={params.countryCode}
      categoryPath={[categoryHandle]} // Single segment for flat URLs
      allCategories={allCats}
      products={products}
      region={region}
      totalPages={totalPages}
      currentPage={pageNumber}
    />
  )
}
