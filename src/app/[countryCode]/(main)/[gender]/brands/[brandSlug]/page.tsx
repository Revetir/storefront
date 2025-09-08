import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getBrandBySlug } from "@lib/data/brands"
import { getRegion } from "@lib/data/regions"
import { listCategories } from "@lib/data/categories"
import { listProductsWithSort } from "@lib/data/products"
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

  // For now, let's create a simple brand object to avoid API issues
  // TODO: Fix the brand API and use getBrandBySlug(brandSlug)
  const brand = {
    id: brandSlug,
    name: brandSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    slug: brandSlug,
    blurb: `Shop ${brandSlug.replace(/-/g, ' ')} ${gender === "men" ? "men's" : "women's"} clothing at REVETIR.`
  }

  // Get gender-specific categories
  const allCategories = await listCategories()
  const genderPrefix = gender === "men" ? "mens" : "womens"
  const genderCategories = allCategories.filter(cat => 
    cat.handle.startsWith(`${genderPrefix}-`)
  )

  // Build category IDs for filtering
  const collectCategoryIds = (cat: any): string[] => {
    return [cat.id, ...(cat.children || []).flatMap(collectCategoryIds)]
  }
  const genderCategoryIds = genderCategories.flatMap(collectCategoryIds)

  // Fetch products using the standard approach
  const pageNumber = page ? parseInt(page, 10) : 1
  const sort = sortBy || "created_at"

  // Build query parameters to filter by brand and gender categories
  const queryParams: any = {
    category_id: genderCategoryIds,
    // We need to filter by brand, but the standard product API doesn't support brand filtering
    // So we'll use the brand products API but with proper pagination
  }

  // For now, let's use the standard product API with brand filtering
  // This is a temporary solution until we can debug the brand API
  const {
    response: { products, count },
    totalPages,
    currentPage,
  } = await listProductsWithSort({
    page: pageNumber,
    queryParams: {
      category_id: genderCategoryIds,
      // We'll add brand filtering here once we figure out the correct approach
    },
    sortBy: sort,
    countryCode,
  })

  // For now, we'll show all gender category products
  // TODO: Add proper brand filtering once we debug the brand API
  const filteredProducts = products

  return (
    <BrandTemplate
      brand={brand}
      products={filteredProducts}
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
