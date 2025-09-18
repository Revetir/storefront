import { Metadata } from "next"
import { notFound } from "next/navigation"
import { listCategories, getCategoryByFlatHandle } from "@lib/data/categories"
import { getRegion } from "@lib/data/regions"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import CategoryTemplate from "@modules/categories/templates"
import { searchProductsWithAlgolia, convertAlgoliaProductsToMedusaFormat } from "@lib/util/algolia-filters"

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

  const genderDisplay = gender === "men" ? "Men" : "Women"
  const title = `Designer Clothes, Shoes & Accessories for ${genderDisplay}`
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

  // Fetch products using Algolia filtering
  const pageNumber = page ? parseInt(page, 10) : 1
  const sort = sortBy || "created_at"

  const algoliaResult = await searchProductsWithAlgolia({
    gender: gender as "men" | "women",
    sortBy: sort,
    page: pageNumber,
    hitsPerPage: 20
  })

  const products = convertAlgoliaProductsToMedusaFormat(algoliaResult.hits)
  const count = algoliaResult.nbHits
  const totalPages = algoliaResult.nbPages
  const currentPage = algoliaResult.page

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
