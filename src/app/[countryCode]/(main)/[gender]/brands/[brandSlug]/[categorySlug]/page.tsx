import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getBrandBySlug, getBrandProducts } from "@lib/data/brands"
import { getCategoryByFlatHandle } from "@lib/data/categories"
import { getRegion } from "@lib/data/regions"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import BrandCategoryTemplate from "@modules/brands/templates/brand-category"

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

  // Build category IDs for filtering (include children)
  const collectCategoryIds = (cat: any): string[] => {
    return [cat.id, ...(cat.children || []).flatMap(collectCategoryIds)]
  }
  const categoryIds = collectCategoryIds(category)

  // Fetch products
  const pageNumber = page ? parseInt(page, 10) : 1
  const limit = 60
  const offset = (pageNumber - 1) * limit

  // For now, let's use the standard product API with category filtering
  // This is a temporary solution until we can debug the brand API
  const {
    response: { products, count },
    totalPages,
    currentPage,
  } = await listProductsWithSort({
    page: pageNumber,
    queryParams: {
      category_id: categoryIds,
      // We'll add brand filtering here once we figure out the correct approach
    },
    sortBy: sort,
    countryCode,
  })

  // For now, we'll show all category products
  // TODO: Add proper brand filtering once we debug the brand API

  return (
    <BrandCategoryTemplate
      brand={brand}
      category={category}
      products={products}
      sortBy={sortBy}
      page={page}
      countryCode={countryCode}
      gender={gender}
      totalPages={totalPages}
      currentPage={currentPage}
    />
  )
}
