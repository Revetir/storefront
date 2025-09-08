import { Metadata } from "next"
import { notFound } from "next/navigation"
import { listCategories } from "@lib/data/categories"
import { listBrands } from "@lib/data/brands"
import { getRegion } from "@lib/data/regions"
import { Category } from "@lib/data/categories"
import { Brand } from "@lib/data/brands"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type Props = {
  params: Promise<{ countryCode: string; gender: string }>
}

export async function generateStaticParams() {
  const genders = ["men", "women"]
  const countryCodes = ["us", "ca", "gb"] // Add your supported countries

  return countryCodes.flatMap((countryCode) =>
    genders.map((gender) => ({
      countryCode,
      gender,
    }))
  )
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { gender } = params

  const genderDisplay = gender === "men" ? "Men's" : "Women's"
  const title = `${genderDisplay} Fashion | REVETIR`
  const description = `Shop the latest ${genderDisplay.toLowerCase()} fashion at REVETIR. Premium brands, curated collections, and free shipping.`

  return {
    title,
    description,
    alternates: {
      canonical: `/${params.countryCode}/${gender}`,
    },
  }
}

export default async function GenderPage(props: Props) {
  const params = await props.params
  const { countryCode, gender } = params

  // Validate gender
  if (gender !== "men" && gender !== "women") {
    notFound()
  }

  const region = await getRegion(countryCode)
  if (!region) {
    notFound()
  }

  // Get gender-specific categories
  const allCategories = await listCategories()
  const genderPrefix = gender === "men" ? "mens" : "womens"
  const genderCategories = allCategories.filter(cat => 
    cat.handle.startsWith(`${genderPrefix}-`)
  )

  // Get all brands
  const brands = await listBrands()

  const genderDisplay = gender === "men" ? "Men's" : "Women's"

  return (
    <div className="content-container py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {genderDisplay} Fashion
        </h1>
        <p className="text-lg text-gray-600">
          Discover the latest {genderDisplay.toLowerCase()} fashion from premium brands.
        </p>
      </div>

      {/* Categories Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {genderCategories.map((category) => {
            const categorySlug = category.handle.replace(`${genderPrefix}-`, "")
            return (
              <LocalizedClientLink
                key={category.id}
                href={`/${countryCode}/${gender}/${categorySlug}`}
                className="group p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <h3 className="font-medium text-gray-900 group-hover:text-gray-700">
                  {category.name}
                </h3>
                {category.metadata?.intro_blurb && (
                  <p className="text-sm text-gray-500 mt-1">
                    {category.metadata.intro_blurb as string}
                  </p>
                )}
              </LocalizedClientLink>
            )
          })}
        </div>
      </div>

      {/* Brands Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Shop by Brand</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {brands.map((brand) => (
            <LocalizedClientLink
              key={brand.id}
              href={`/${countryCode}/${gender}/brands/${brand.slug}`}
              className="group p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <h3 className="font-medium text-gray-900 group-hover:text-gray-700">
                {brand.name}
              </h3>
              {brand.blurb && (
                <p className="text-sm text-gray-500 mt-1">
                  {brand.blurb}
                </p>
              )}
            </LocalizedClientLink>
          ))}
        </div>
      </div>
    </div>
  )
}
