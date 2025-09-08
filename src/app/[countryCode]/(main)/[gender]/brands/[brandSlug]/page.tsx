import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getBrandBySlug, getBrandProducts } from "@lib/data/brands"
import { getRegion } from "@lib/data/regions"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import BrandTemplate from "@modules/brands/templates"

type Props = {
  params: Promise<{ countryCode: string; gender: string; brandSlug: string }>
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
  }>
}

export async function generateStaticParams() {
  // This would need to be implemented to generate all brand pages
  // For now, we'll rely on dynamic rendering
  return []
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { brandSlug, gender } = params
  
  const brand = await getBrandBySlug(brandSlug)
  
  if (!brand) {
    notFound()
  }

  const genderDisplay = gender === "men" ? "Men's" : "Women's"
  const title = `${brand.name} ${genderDisplay} | REVETIR`
  const description = brand.blurb || `Shop ${brand.name} ${genderDisplay.toLowerCase()} clothing at REVETIR. Premium fashion with free shipping and returns.`

  return {
    title,
    description,
    alternates: {
      canonical: `/${params.countryCode}/${gender}/brands/${brandSlug}`,
    },
  }
}

export default async function BrandPage(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params
  const { sortBy, page } = searchParams
  const { countryCode, gender, brandSlug } = params

  const region = await getRegion(countryCode)
  if (!region) {
    notFound()
  }

  // Get the brand data
  const brand = await getBrandBySlug(brandSlug)
  if (!brand) {
    notFound()
  }

  // Fetch products for this brand
  const pageNumber = page ? parseInt(page, 10) : 1
  const limit = 60
  const offset = (pageNumber - 1) * limit
  const sort = sortBy || "created_at"

  const { products, count } = await getBrandProducts({
    brandSlug,
    limit,
    offset,
    sort,
    countryCode,
  })

  // Calculate pagination
  const totalPages = Math.ceil(count / limit)
  const currentPage = pageNumber

  return (
    <BrandTemplate
      brand={brand}
      products={products}
      sortBy={sortBy}
      page={page}
      countryCode={countryCode}
      gender={gender}
      region={region}
      totalPages={totalPages}
      currentPage={currentPage}
    />
  )
}
