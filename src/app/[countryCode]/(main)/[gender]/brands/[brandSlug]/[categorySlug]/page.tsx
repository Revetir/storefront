import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getBrandBySlug } from "@lib/data/brands"
import { getCategoryByFlatHandle, listCategories } from "@lib/data/categories"
import { getRegion } from "@lib/data/regions"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import CategoryTemplate from "@modules/categories/templates"
import { searchProductsWithAlgolia, convertAlgoliaProductsToMedusaFormat } from "@lib/util/algolia-filters"

type Props = {
  params: Promise<{ countryCode: string; gender: string; brandSlug: string; categorySlug: string }>
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
    color?: string
  }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { brandSlug, gender, categorySlug } = params
  
  try {
    const brand = await getBrandBySlug(brandSlug)
    const genderDisplay = gender === "men" ? "Men" : "Women"
    const categoryDisplay = categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1)
    
    if (!brand) {
      return {
        title: `${brandSlug} ${categoryDisplay} for ${genderDisplay}`,
        description: `Shop ${brandSlug} ${categorySlug} for ${genderDisplay} at REVETIR.`,
        alternates: {
          canonical: `/${params.countryCode}/${gender}/brands/${brandSlug}/${categorySlug}`,
        },
      }
    }

    const title = `${brand.name} ${categoryDisplay} for ${genderDisplay}`
    const description = `Shop ${brand.name} ${categorySlug} for ${genderDisplay} at REVETIR. Premium fashion with free shipping and returns.`

    return {
      title,
      description,
      alternates: {
        canonical: `/${params.countryCode}/${gender}/brands/${brandSlug}/${categorySlug}`,
      },
    }
  } catch (error) {
    const genderDisplay = gender === "men" ? "Men" : "Women"
    const categoryDisplay = categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1)
    return {
      title: `${brandSlug} ${categoryDisplay} for ${genderDisplay}`,
      description: `Shop ${brandSlug} ${categorySlug} for ${genderDisplay} at REVETIR.`,
      alternates: {
        canonical: `/${params.countryCode}/${gender}/brands/${brandSlug}/${categorySlug}`,
      },
    }
  }
}

export default async function BrandCategoryPage(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params
  const { sortBy, page, color } = searchParams
  const { countryCode, gender, brandSlug, categorySlug } = params

  // Validate gender
  if (gender !== "men" && gender !== "women") {
    notFound()
  }

  const region = await getRegion(countryCode)
  if (!region) {
    notFound()
  }

  // Get the brand data
  const brand = await getBrandBySlug(brandSlug)
  if (!brand) {
    notFound()
  }

  // Build the full category handle based on gender and category
  const genderPrefix = gender === "men" ? "mens" : "womens"
  const fullCategoryHandle = `${genderPrefix}-${categorySlug}`
  
  // Get the specific category
  const category = await getCategoryByFlatHandle(fullCategoryHandle)
  if (!category) {
    notFound()
  }

  // Fetch products using Algolia filtering with both brand and category filters
  const pageNumber = page ? parseInt(page, 10) : 1
  const sort = sortBy || "created_at"

  const algoliaResult = await searchProductsWithAlgolia({
    gender: gender as "men" | "women",
    brandSlug: brand.slug,
    categoryHandle: categorySlug,
    color: color,
    sortBy: sort,
    page: pageNumber,
    hitsPerPage: 20
  })

  const products = convertAlgoliaProductsToMedusaFormat(algoliaResult.hits)
  const count = algoliaResult.nbHits
  const totalPages = algoliaResult.nbPages
  const currentPage = algoliaResult.page

  // Create a category object for the template
  const brandCategoryTemplate = {
    id: `${brand.id}-${category.id}`,
    name: `${brand.name} ${gender === "men" ? "Men's" : "Women's"} ${categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1)}`,
    handle: `${gender}-${brandSlug}-${categorySlug}`,
    description: brand.blurb || `Shop ${brand.name} ${gender === "men" ? "men's" : "women's"} ${categorySlug}`,
    metadata: {
      intro_blurb: brand.blurb
    }
  }

  // For brand+category pages, use brand name and blurb (brand takes priority)
  const editorialTitle = brand.name
  const editorialBlurb = brand.blurb

  return (
    <CategoryTemplate
      category={brandCategoryTemplate}
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
