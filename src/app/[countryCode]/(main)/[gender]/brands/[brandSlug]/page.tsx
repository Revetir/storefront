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

    // For now, let's use empty products to test if the issue is with getBrandProducts
    // TODO: Debug why getBrandProducts is failing
    const products: any[] = []
    const count = 0
    const totalPages = 0
    const currentPage = 1

    // For now, return a simple page to test if the issue is with the template
    return (
      <div className="content-container py-6">
        <h1 className="text-2xl-semi text-gry-900">
          {brand.name} {gender === "men" ? "Men's" : "Women's"}
        </h1>
        {brand.blurb && (
          <div className="mt-4 text-base-regular text-gray-600">
            {brand.blurb}
          </div>
        )}
        <div className="mt-8">
          <p>Products: {products.length}</p>
          <p>Total Pages: {totalPages}</p>
          <p>Current Page: {currentPage}</p>
        </div>
      </div>
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
