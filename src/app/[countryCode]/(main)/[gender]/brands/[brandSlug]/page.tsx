import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getBrandBySlug, getBrandProducts } from "@lib/data/brands"
import { getRegion } from "@lib/data/regions"
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
  try {
    const searchParams = await props.searchParams
    const params = await props.params
    const { sortBy, page } = searchParams
    const { countryCode, gender, brandSlug } = params

    // Get region with error handling
    let region
    try {
      region = await getRegion(countryCode)
    } catch (error) {
      console.error("Error fetching region:", error)
      region = null
    }

    if (!region) {
      notFound()
    }

    // Get the brand data with error handling
    let brand
    try {
      brand = await getBrandBySlug(brandSlug)
    } catch (error) {
      console.error("Error fetching brand:", error)
      brand = null
    }

    if (!brand) {
      notFound()
    }

    // Fetch products for this brand using the brand products API
    const pageNumber = page ? parseInt(page, 10) : 1
    const limit = 60
    const offset = (pageNumber - 1) * limit
    const sort = sortBy || "created_at"

    const { products, count } = await getBrandProducts({
      brandSlug,
      categorySlug: gender, // Pass the gender as category slug for filtering
      limit,
      offset,
      sort,
      countryCode,
    })

    // Calculate pagination
    const totalPages = Math.ceil(count / limit)
    const currentPage = pageNumber

    // Create a mock category object for the template
    const mockCategory = {
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
  } catch (error) {
    console.error("Error in BrandPage component:", error)
    // Return a simple error page instead of crashing
    return (
      <div className="content-container py-6">
        <h1>Error Loading Brand Page</h1>
        <p>There was an error loading this brand page. Please try again later.</p>
      </div>
    )
  }
}
