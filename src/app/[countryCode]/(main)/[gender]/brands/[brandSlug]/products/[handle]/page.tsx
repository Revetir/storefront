import { redirect } from "next/navigation"

type Props = {
  params: Promise<{ 
    countryCode: string
    gender: string
    brandSlug: string
    handle: string
  }>
}

export default async function ProductRedirectPage(props: Props) {
  const params = await props.params
  const { countryCode, brandSlug, handle } = params
  
  // Redirect to canonical product URL
  const canonicalUrl = `/${countryCode}/products/${brandSlug}-${handle}`
  redirect(canonicalUrl, 301)
}
