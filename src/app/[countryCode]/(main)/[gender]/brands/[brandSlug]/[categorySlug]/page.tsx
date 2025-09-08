import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getBrandBySlug, getBrandProducts } from "@lib/data/brands"
import { getCategoryByFlatHandle } from "@lib/data/categories"
import { getRegion } from "@lib/data/regions"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import CategoryTemplate from "@modules/categories/templates"

type Props = {
  params: Promise<{ 
    countryCode: string
    gender: string
    brandSlug: string
    categorySlug: string
  }>
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
  }>
}

export async function generateStaticParams() {
  // This would need to be implemented to generate all brand+category pages
  // For now, we'll rely on dynamic rendering
  return []
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { brandSlug, categorySlug, gender } = params
  
  const brand = await getBrandBySlug(brandSlug)
  const genderPrefix = gender === "men" ? "mens" : "womens"
  const category = await getCategoryByFlatHandle(`${genderPrefix}-${categorySlug}`)
  
  if (!brand || !category) {
    notFound()
  }

  const genderDisplay = gender === "men" ? "Men's" : "Women's"
  const title = `${brand.name} ${genderDisplay} ${category.name} | REVETIR`
  const description = `Shop ${brand.name} ${genderDisplay.toLowerCase()} ${category.name.toLowerCase()} at REVETIR. Premium fashion with free shipping and returns.`

  return {
    title,
    description,
    alternates: {
      canonical: `/${params.countryCode}/${gender}/brands/${brandSlug}/${categorySlug}`,
    },
  }
}

export default async function BrandCategoryPage(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params
  const { sortBy, page } = searchParams
  const { countryCode, gender, brandSlug, categorySlug } = params

  const region = await getRegion(countryCode)
  if (!region) {
    notFound()
  }

  // Get the brand data
  const brand = await getBrandBySlug(brandSlug)
  if (!brand) {
    notFound()
  }

  // Get category by gender-prefixed handle
  const genderPrefix = gender === "men" ? "mens" : "womens"
  const category = await getCategoryByFlatHandle(`${genderPrefix}-${categorySlug}`)
  if (!category) {
    notFound()
  }

  // Fetch products for this brand and category using the brand products API
  const pageNumber = page ? parseInt(page, 10) : 1
  const limit = 60
  const offset = (pageNumber - 1) * limit
  const sort = sortBy || "created_at"

  const { products, count } = await getBrandProducts({
    brandSlug,
    categorySlug: `${genderPrefix}-${categorySlug}`,
    limit,
    offset,
    sort,
    countryCode,
  })

  // Calculate pagination
  const totalPages = Math.ceil(count / limit)
  const currentPage = pageNumber

  // Create a mock category object that includes brand info
  const mockCategory = {
    ...category,
    name: `${brand.name} ${category.name}`,
    description: brand.blurb || category.metadata?.intro_blurb,
    metadata: {
      ...category.metadata,
      intro_blurb: brand.blurb || category.metadata?.intro_blurb
    }
  }

  return (
    <CategoryTemplate
      category={mockCategory}
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
