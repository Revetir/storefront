import { redirect } from "next/navigation"
import { listProducts } from "@lib/data/products"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
}

export default async function LegacyProductRedirectPage(props: Props) {
  const params = await props.params
  const { countryCode, handle } = params
  
  try {
    // Fetch product to get brand information
    const { response } = await listProducts({
      countryCode,
      queryParams: { handle },
    })
    
    const product = response.products[0]
    
    if (!product) {
      // Product not found, redirect to 404
      redirect(`/${countryCode}/not-found`)
    }
    
    if (!product.brand?.slug) {
      // Product has no brand, redirect to 404 or handle gracefully
      redirect(`/${countryCode}/not-found`)
    }
    
    // Redirect to canonical URL
    const canonicalUrl = `/${countryCode}/products/${product.brand.slug}-${product.handle}`
    redirect(canonicalUrl, 301)
  } catch (error) {
    console.error("Error redirecting legacy product URL:", error)
    // Fallback redirect to 404
    redirect(`/${countryCode}/not-found`)
  }
}