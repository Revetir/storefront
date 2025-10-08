import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getBrandBySlug } from "@lib/data/brands"
import { getRegion } from "@lib/data/regions"
import { listCategories } from "@lib/data/categories"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import CategoryTemplate from "@modules/categories/templates"
import { searchProductsWithAlgolia, convertAlgoliaProductsToMedusaFormat } from "@lib/util/algolia-filters"

type Props = {
  params: Promise<{ countryCode: string; gender: string; brandSlug: string }>
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
  }>
}

// Removed generateStaticParams to force dynamic rendering

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { brandSlug, gender } = params
  
  try {
    const brand = await getBrandBySlug(brandSlug)
    
    if (!brand) {
      // Return fallback metadata instead of calling notFound()
      const genderDisplay = gender === "men" ? "Men" : "Women"
      return {
        title: `${brandSlug} for ${genderDisplay}`,
        description: `Shop ${brandSlug} ${genderDisplay.toLowerCase()} clothing at REVETIR.`,
        alternates: {
          canonical: `/${params.countryCode}/${gender}/brands/${brandSlug}`,
        },
      }
    }

    const genderDisplay = gender === "men" ? "Men" : "Women"
    const title = `${brand.name} for ${genderDisplay}`
    const description = brand.blurb || `Shop ${brand.name} ${genderDisplay.toLowerCase()} clothing at REVETIR. Premium fashion with free shipping and returns.`

    return {
      title,
      description,
      alternates: {
        canonical: `/${params.countryCode}/${gender}/brands/${brandSlug}`,
      },
    }
  } catch (error) {
    // Return fallback metadata if there's an error
    const genderDisplay = gender === "men" ? "Men" : "Women"
    return {
      title: `${brandSlug} for ${genderDisplay}`,
      description: `Shop ${brandSlug} ${genderDisplay.toLowerCase()} clothing at REVETIR.`,
      alternates: {
        canonical: `/${params.countryCode}/${gender}/brands/${brandSlug}`,
      },
    }
  }
}

export default async function BrandPage(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params
  const { sortBy, page } = searchParams
  const { countryCode, gender, brandSlug } = params

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

  // Fetch products using Algolia filtering
  const pageNumber = page ? parseInt(page, 10) : 1
  const sort = sortBy || "created_at"

  const algoliaResult = await searchProductsWithAlgolia({
    gender: gender as "men" | "women",
    brandSlug: brand.slug,
    sortBy: sort,
    page: pageNumber,
    hitsPerPage: 20
  })

  const products = convertAlgoliaProductsToMedusaFormat(algoliaResult.hits)
  const count = algoliaResult.nbHits
  const totalPages = algoliaResult.nbPages
  const currentPage = algoliaResult.page

  // Create a category object for the template that represents the brand + gender combination
  const brandCategory = {
    id: brand.id,
    name: `${brand.name} ${gender === "men" ? "Men's" : "Women's"}`,
    handle: `${gender}-${brandSlug}`,
    description: brand.blurb,
    metadata: {
      intro_blurb: brand.blurb
    }
  }

  // For brand pages, use brand name and blurb
  const editorialTitle = brand.name
  const editorialBlurb = brand.blurb

  return (
    <CategoryTemplate
      category={brandCategory}
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