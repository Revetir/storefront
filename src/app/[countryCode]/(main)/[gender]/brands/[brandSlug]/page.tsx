import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getBrandBySlug, getBrandProducts } from "@lib/data/brands"
import { listCategories, getCategoryByFlatHandle } from "@lib/data/categories"
import { getRegion } from "@lib/data/regions"
import { listProductsWithSort } from "@lib/data/products"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import CategoryTemplate from "@modules/categories/templates"

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
      const genderDisplay = gender === "men" ? "Men's" : "Women's"
      return {
        title: `${brandSlug} ${genderDisplay} | REVETIR`,
        description: `Shop ${brandSlug} ${genderDisplay.toLowerCase()} clothing at REVETIR.`,
        alternates: {
          canonical: `/${params.countryCode}/${gender}/brands/${brandSlug}`,
        },
      }
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
  } catch (error) {
    // Return fallback metadata if there's an error
    const genderDisplay = gender === "men" ? "Men's" : "Women's"
    return {
      title: `${brandSlug} ${genderDisplay} | REVETIR`,
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

  // Use standard products API with brand filtering (intercepted by middleware)
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
      brand_id: [brand.id], // Will be intercepted by middleware
    },
    sortBy: sort,
    countryCode,
  })

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
    />
  )
}
