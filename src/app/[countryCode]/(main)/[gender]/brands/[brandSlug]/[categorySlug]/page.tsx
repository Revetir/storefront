import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getBrandBySlug } from "@lib/data/brands"
import { getCategoryByFlatHandle, listCategories } from "@lib/data/categories"
import { getRegion } from "@lib/data/regions"
import { listProductsWithBrandSupport } from "@lib/data/products"
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

  // Server-side filtering: use the enhanced products-with-brands endpoint
  const pageNumber = page ? parseInt(page, 10) : 1
  const sort = sortBy || "created_at"

  // Build category IDs for the selected category including descendants
  const collectCategoryIds = (cat: any): string[] => {
    return [cat.id, ...(cat.children || []).flatMap(collectCategoryIds)]
  }
  const categoryIds = collectCategoryIds(category)

  // Build gender category set for additional filtering
  const allCategories = await listCategories()
  const collectIds = (cat: any): string[] => [cat.id, ...(cat.children || []).flatMap(collectIds)]
  const genderCategories = allCategories.filter((cat) => cat.handle.startsWith(`${genderPrefix}-`))
  const genderCategoryIds = genderCategories.flatMap(collectIds)

  // Combine category IDs: intersection of gender categories and selected category tree
  const combinedCategoryIds = categoryIds.filter(id => genderCategoryIds.includes(id))

  // Debug logging for development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Brand+Category Page] ${gender}/${brandSlug}/${categorySlug}`)
    console.log(`[Brand+Category Page] Brand ID: ${brand.id}`)
    console.log(`[Brand+Category Page] Category: ${category.name} (${category.id})`)
    console.log(`[Brand+Category Page] Category IDs: ${categoryIds.length} [${categoryIds.slice(0, 3).join(', ')}${categoryIds.length > 3 ? '...' : ''}]`)
    console.log(`[Brand+Category Page] Gender Category IDs: ${genderCategoryIds.length}`)
    console.log(`[Brand+Category Page] Combined Category IDs: ${combinedCategoryIds.length} [${combinedCategoryIds.slice(0, 3).join(', ')}${combinedCategoryIds.length > 3 ? '...' : ''}]`)
  }

  // Use server-side filtering with both brand and category parameters
  const {
    response: { products, count },
    totalPages,
    currentPage,
  } = await listProductsWithBrandSupport({
    page: pageNumber,
    queryParams: {
      brand_id: [brand.id],
      category_id: combinedCategoryIds.length > 0 ? combinedCategoryIds : categoryIds,
      fields: "id,title,handle,status,thumbnail,created_at,updated_at,deleted_at,is_giftcard,discountable,description,subtitle,material,weight,length,height,width,hs_code,origin_country,mid_code,metadata,+brand.*,+categories.*,+variants.*,+images.*,+tags,+product_sku.*",
    },
    sortBy: sort,
    countryCode,
  })

  // Debug logging for products
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Brand+Category Page] Found ${products.length} products (${count} total)`)
    if (products.length > 0) {
      console.log(`[Brand+Category Page] First product: ${products[0].title}`)
      console.log(`[Brand+Category Page] First product brand: ${(products[0] as any)?.brand?.name}`)
      console.log(`[Brand+Category Page] First product categories: ${(products[0] as any)?.categories?.map((c: any) => c.name).join(', ') || 'none'}`)
    }
  }

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
