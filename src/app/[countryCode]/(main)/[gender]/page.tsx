import { Metadata } from "next"
import { notFound } from "next/navigation"
import { listCategories, getCategoryByFlatHandle } from "@lib/data/categories"
import { listProductsWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import CategoryTemplate from "@modules/categories/templates"

type Props = {
  params: Promise<{ countryCode: string; gender: string }>
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
  }>
}

export async function generateStaticParams() {
  const genders = ["men", "women"]
  const countryCodes = ["us", "ca", "gb"] // Add your supported countries

  return countryCodes.flatMap((countryCode) =>
    genders.map((gender) => ({
      countryCode,
      gender,
    }))
  )
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { gender } = params

  const genderDisplay = gender === "men" ? "Men's" : "Women's"
  const title = `${genderDisplay} Fashion | REVETIR`
  const description = `Shop the latest ${genderDisplay.toLowerCase()} fashion at REVETIR. Premium brands, curated collections, and free shipping.`

  return {
    title,
    description,
    alternates: {
      canonical: `/${params.countryCode}/${gender}`,
    },
  }
}

export default async function GenderPage(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params
  const { sortBy, page } = searchParams
  const { countryCode, gender } = params

  // Validate gender
  if (gender !== "men" && gender !== "women") {
    notFound()
  }

  const region = await getRegion(countryCode)
  if (!region) {
    notFound()
  }

  // Get the gender category (e.g., "men" or "women")
  const genderCategory = await getCategoryByFlatHandle(gender)
  
  if (!genderCategory) {
    notFound()
  }

  const allCategories = await listCategories()

  // Build category IDs for filtering (include all gender-specific categories)
  const collectCategoryIds = (cat: any): string[] => {
    return [cat.id, ...(cat.children || []).flatMap(collectCategoryIds)]
  }
  
  // Get all gender-specific categories (those that start with the gender prefix)
  const genderPrefix = gender === "men" ? "mens" : "womens"
  const genderCategories = allCategories.filter(cat => 
    cat.handle.startsWith(`${genderPrefix}-`)
  )
  const genderCategoryIds = genderCategories.flatMap(collectCategoryIds)

  // Fetch products
  const pageNumber = page ? parseInt(page, 10) : 1
  const sort = sortBy || "created_at"

  const {
    response: { products, count },
    totalPages,
    currentPage,
  } = await listProductsWithSort({
    page: pageNumber,
    queryParams: {
      category_id: genderCategoryIds,
      // Include fields needed by the product grid (title/type) and brand for canonical links
      fields: "handle,title,thumbnail,*brand.*,*type.*",
      expand: "brand,type",
    },
    sortBy: sort,
    countryCode,
  })

  return (
    <CategoryTemplate
      category={genderCategory}
      sortBy={sortBy}
      page={page}
      countryCode={countryCode}
      products={products}
      region={region}
      totalPages={totalPages}
      currentPage={currentPage}
    />
  )
}
