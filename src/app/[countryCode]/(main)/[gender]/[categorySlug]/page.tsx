import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getCategoryByFlatHandle, listCategories } from "@lib/data/categories"
import { getRegion } from "@lib/data/regions"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import CategoryTemplate from "@modules/categories/templates"
import { searchProductsWithAlgolia, convertAlgoliaProductsToMedusaFormat } from "@lib/util/algolia-filters"

type Props = {
  params: Promise<{ countryCode: string; gender: string; categorySlug: string }>
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
  }>
}

export async function generateStaticParams() {
  const allCategories = await listCategories()
  const countryCodes = ["us", "ca", "gb"] // Add your supported countries

  const staticParams = []
  
  for (const countryCode of countryCodes) {
    for (const category of allCategories) {
      // Extract category slug without gender prefix
      const categorySlug = category.handle.replace(/^(mens-|womens-)/, "")
      
      // Generate for both genders
      staticParams.push(
        { countryCode, gender: "men", categorySlug },
        { countryCode, gender: "women", categorySlug }
      )
    }
  }

  return staticParams
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { categorySlug, gender } = params
  
  const genderPrefix = gender === "men" ? "mens" : "womens"
  const category = await getCategoryByFlatHandle(`${genderPrefix}-${categorySlug}`)
  
  if (!category) {
    notFound()
  }

  const genderDisplay = gender === "men" ? "Men" : "Women"
  const title = `Designer ${category.name} for ${genderDisplay}`
  const description: string =
    typeof category.metadata?.intro_blurb === "string"
      ? category.metadata.intro_blurb
      : `Shop ${genderDisplay.toLowerCase()} ${category.name.toLowerCase()} at REVETIR. Premium fashion with free shipping and returns.`

  return {
    title,
    description,
    alternates: {
      canonical: `/${params.countryCode}/${gender}/${categorySlug}`,
    },
  }
}

export default async function CategoryPage(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params
  const { sortBy, page } = searchParams
  const { countryCode, gender, categorySlug } = params

  const region = await getRegion(countryCode)
  if (!region) {
    notFound()
  }

  // Get category by gender-prefixed handle
  const genderPrefix = gender === "men" ? "mens" : "womens"
  const category = await getCategoryByFlatHandle(`${genderPrefix}-${categorySlug}`)
  if (!category) {
    notFound()
  }

  const allCategories = await listCategories()

  // Fetch products using Algolia filtering
  const pageNumber = page ? parseInt(page, 10) : 1
  const sort = sortBy || "created_at"

  const algoliaResult = await searchProductsWithAlgolia({
    gender: gender as "men" | "women",
    categoryHandle: categorySlug,
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
      category={category}
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
