import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getRegion } from "@lib/data/regions"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import CategoryTemplate from "@modules/categories/templates"
import { searchProductsWithAlgolia, convertAlgoliaProductsToMedusaFormat } from "@lib/util/algolia-filters"

const TRENDING_TAG_ID = "ptag_01KAHV8ZK2GZ1810Z2B4Q45KAC"

type Props = {
  params: Promise<{ countryCode: string; gender: string }>
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
    color?: string
  }>
}

export async function generateStaticParams() {
  const countryCodes = ["us", "ca", "gb"]
  const genders = ["men", "women"]

  const staticParams = []

  for (const countryCode of countryCodes) {
    for (const gender of genders) {
      staticParams.push({ countryCode, gender })
    }
  }

  return staticParams
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { gender, countryCode } = params

  const genderDisplay = gender === "men" ? "Men" : "Women"
  const title = `Trending Designer Fashion for ${genderDisplay}`
  const description = `Discover trending ${genderDisplay.toLowerCase()}'s designer fashion at REVETIR. Curated selection of the latest must-have pieces with free shipping and returns.`

  return {
    title,
    description,
    alternates: {
      canonical: `/${countryCode}/${gender}/trending`,
    },
  }
}

export default async function TrendingPage(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params
  const { sortBy, page, color } = searchParams
  const { countryCode, gender } = params

  const region = await getRegion(countryCode)
  if (!region) {
    notFound()
  }

  // Fetch trending products using Algolia filtering with tag
  const pageNumber = page ? parseInt(page, 10) : 1
  const sort = sortBy || "created_at"

  const algoliaResult = await searchProductsWithAlgolia({
    gender: gender as "men" | "women",
    tagId: TRENDING_TAG_ID,
    color: color,
    sortBy: sort,
    page: pageNumber,
    hitsPerPage: 20
  })

  const products = convertAlgoliaProductsToMedusaFormat(algoliaResult.hits)
  const count = algoliaResult.nbHits
  const totalPages = algoliaResult.nbPages
  const currentPage = algoliaResult.page

  // Editorial content for trending page
  const genderDisplay = gender === "men" ? "Men's" : "Women's"
  const editorialTitle = `Trending ${genderDisplay} Designer Fashion`
  const editorialBlurb = "Discover our curated selection of trending designer pieces. From runway favorites to street style essentials, explore the most sought-after items of the season."

  // Create a mock category object for the template (Trending doesn't have a real category)
  const trendingCategory = {
    id: "trending",
    name: "Trending",
    handle: "trending",
    description: editorialBlurb,
  }

  return (
    <CategoryTemplate
      category={trendingCategory}
      sortBy={sortBy}
      page={page}
      countryCode={countryCode}
      products={products}
      region={region}
      totalPages={totalPages}
      currentPage={currentPage}
      editorialTitle={editorialTitle}
      editorialBlurb={editorialBlurb}
    />
  )
}
