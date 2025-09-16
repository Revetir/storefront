import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getBrandBySlug } from "@lib/data/brands"
import { getRegion } from "@lib/data/regions"
import { listCategories } from "@lib/data/categories"
import { listProductsWithBrandSupport } from "@lib/data/products"
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

  // TODO: Replace with Algolia filtering
  // COMMENTED OUT: Medusa filtering logic - will be replaced with Algolia
  /*
  // Build gender category IDs for filtering (same logic as gender page)
  const allCategories = await listCategories()
  const collectCategoryIds = (cat: any): string[] => {
    return [cat.id, ...(cat.children || []).flatMap(collectCategoryIds)]
  }
  
  // Get all gender-specific categories (those that start with the gender prefix)
  const genderPrefix = gender === "men" ? "mens" : "womens"
  const genderCategories = allCategories.filter(cat => 
    cat.handle.startsWith(`${genderPrefix}-`)
  )
  const genderCategoryIds = genderCategories.flatMap(collectCategoryIds)

  // Fetch products using the correct brand-supporting endpoint
  const pageNumber = page ? parseInt(page, 10) : 1
  const sort = sortBy || "created_at"

  const {
    response: { products, count },
    totalPages,
    currentPage,
  } = await listProductsWithBrandSupport({
    page: pageNumber,
    queryParams: {
      brand_id: [brand.id],
      category_id: genderCategoryIds,
      // Ensure we get all necessary fields for product cards
      fields: "id,title,handle,status,thumbnail,created_at,updated_at,deleted_at,is_giftcard,discountable,description,subtitle,material,weight,length,height,width,hs_code,origin_country,mid_code,metadata,+brand.*,+categories.*,+variants.*,+images.*",
    },
    sortBy: sort,
    countryCode,
  })
  */

  // TEMPORARY: Empty products array until Algolia filtering is implemented
  const products: any[] = []
  const count = 0
  const totalPages = 0
  const currentPage = 1

  // Log for debugging if needed
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Brand Page] ${gender}/${brandSlug}: ${products.length} products found (${count} total)`)
    console.log(`[Brand Page] Brand ID: ${brand.id}, Gender Category IDs: ${genderCategoryIds.length}`)
    if (products.length > 0) {
      console.log(`[Brand Page] First product brand data:`, (products[0] as any)?.brand)
      console.log(`[Brand Page] First product has variants:`, products[0]?.variants?.length)
    }
  }

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