import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getBrandBySlug } from "@lib/data/brands"
import { getCategoryByFlatHandle, listCategories } from "@lib/data/categories"
import { getRegion } from "@lib/data/regions"
import { listProductsWithSort } from "@lib/data/products"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import CategoryTemplate from "@modules/categories/templates"

type Props = {
  params: Promise<{ countryCode: string; gender: string; brandSlug: string; categorySlug: string }>
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
  }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { brandSlug, gender, categorySlug } = params
  
  try {
    const brand = await getBrandBySlug(brandSlug)
    const genderDisplay = gender === "men" ? "Men's" : "Women's"
    const categoryDisplay = categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1)
    
    if (!brand) {
      return {
        title: `${brandSlug} ${genderDisplay} ${categoryDisplay} | REVETIR`,
        description: `Shop ${brandSlug} ${genderDisplay.toLowerCase()} ${categorySlug} at REVETIR.`,
        alternates: {
          canonical: `/${params.countryCode}/${gender}/brands/${brandSlug}/${categorySlug}`,
        },
      }
    }

    const title = `${brand.name} ${genderDisplay} ${categoryDisplay} | REVETIR`
    const description = `Shop ${brand.name} ${genderDisplay.toLowerCase()} ${categorySlug} at REVETIR. Premium fashion with free shipping and returns.`

    return {
      title,
      description,
      alternates: {
        canonical: `/${params.countryCode}/${gender}/brands/${brandSlug}/${categorySlug}`,
      },
    }
  } catch (error) {
    const genderDisplay = gender === "men" ? "Men's" : "Women's"
    const categoryDisplay = categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1)
    return {
      title: `${brandSlug} ${genderDisplay} ${categoryDisplay} | REVETIR`,
      description: `Shop ${brandSlug} ${genderDisplay.toLowerCase()} ${categorySlug} at REVETIR.`,
      alternates: {
        canonical: `/${params.countryCode}/${gender}/brands/${brandSlug}/${categorySlug}`,
      },
    }
  }
}

export default async function BrandCategoryPage(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params
  const { sortBy, page } = searchParams
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

  // Client-side filtering like brand page: fetch broadly, then filter by brand + gender + category
  const pageNumber = page ? parseInt(page, 10) : 1
  const sort = sortBy || "created_at"

  // Build category IDs for the selected category including descendants
  const collectCategoryIds = (cat: any): string[] => {
    return [cat.id, ...(cat.children || []).flatMap(collectCategoryIds)]
  }
  const categoryIds = collectCategoryIds(category)

  // Build gender category set similar to the brand page
  const allCategories = await listCategories()
  const collectIds = (cat: any): string[] => [cat.id, ...(cat.children || []).flatMap(collectIds)]
  const genderCategories = allCategories.filter((cat) => cat.handle.startsWith(`${genderPrefix}-`))
  const genderCategoryIds = genderCategories.flatMap(collectIds)

  // Fetch a wide set of products, then filter on client
  const {
    response: { products: allProducts },
  } = await listProductsWithSort({
    page: 1,
    queryParams: {
      limit: 2000,
      fields: "*variants.calculated_price,+variants.inventory_quantity,+metadata,+tags,*categories,+product_sku.*,+brand.*",
    },
    sortBy: sort,
    countryCode,
  })

  const filtered = allProducts.filter((product: any) => {
    // Brand match
    if (!product.brand || product.brand.id !== brand.id) {
      return false
    }
    // Categories present
    if (!product.categories || !Array.isArray(product.categories)) {
      return false
    }
    // Gender match (same logic as brand page)
    const hasGenderCategory = product.categories.some((c: any) => genderCategoryIds.includes(c.id))
    const hasGenderCategoryByHandle = product.categories.some((c: any) => c.handle && c.handle.startsWith(`${genderPrefix}-`))
    if (!(hasGenderCategory || hasGenderCategoryByHandle)) {
      return false
    }
    // Category tree match (selected category or its descendants)
    const inSelectedCategoryTree = product.categories.some((c: any) => categoryIds.includes(c.id))
    return inSelectedCategoryTree
  })

  // Paginate client-side to 60 per page
  const limit = 60
  const startIndex = (pageNumber - 1) * limit
  const endIndex = startIndex + limit
  const products = filtered.slice(startIndex, endIndex)
  const count = filtered.length
  const totalPages = Math.ceil(count / limit)
  const currentPage = pageNumber

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
    />
  )
}
