import { redirect } from "next/navigation"

type Props = {
  params: Promise<{ countryCode: string; category: string[] }>
}

export default async function LegacyCategoryRedirectPage(props: Props) {
  const params = await props.params
  const { countryCode, category } = params
  
  // Get the category handle (last segment)
  const categoryHandle = category[category.length - 1]
  
  if (!categoryHandle) {
    redirect(`/${countryCode}/not-found`)
  }
  
  // Determine gender from category handle prefix
  let gender: string
  let categorySlug: string
  
  if (categoryHandle.startsWith("mens-")) {
    gender = "men"
    categorySlug = categoryHandle.replace("mens-", "")
  } else if (categoryHandle.startsWith("womens-")) {
    gender = "women"
    categorySlug = categoryHandle.replace("womens-", "")
  } else {
    // Fallback to men if no gender prefix
    gender = "men"
    categorySlug = categoryHandle
  }
  
  // Redirect to new category URL
  const newUrl = `/${countryCode}/${gender}/${categorySlug}`
  redirect(newUrl, 301)
}