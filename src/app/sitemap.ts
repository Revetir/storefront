import { MetadataRoute } from 'next'
import { getAllProductsForSitemap } from '@lib/data/products'
import { listRegions } from '@lib/data/regions'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://revetir.com'
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/store`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/collections`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/account`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/cart`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/customer-care`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms-conditions`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/partnerships`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    },
  ]

  // Fetch all products for sitemap
  let productPages: MetadataRoute.Sitemap = []
  
  try {
    // Get all regions to fetch products for each country
    const regions = await listRegions()
    const countryCodes = regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat().filter((code): code is string => Boolean(code)) || ['us']
    
    // Fetch products for each country
    const productPromises = countryCodes.map(async (countryCode) => {
      const products = await getAllProductsForSitemap({ countryCode })
      
      return products
        .filter((product) => product.handle) // Only include products with handles
        .map((product) => ({
          url: `${baseUrl}/${countryCode}/products/${product.handle}`,
          lastModified: new Date(product.updated_at || product.created_at || new Date()),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        }))
    })
    
    const allProductPages = await Promise.all(productPromises)
    productPages = allProductPages.flat()
    
    console.log(`Generated ${productPages.length} product pages for sitemap`)
  } catch (error) {
    console.error('Error generating product pages for sitemap:', error)
  }

  // TODO: Add dynamic collection pages
  // const collections = await fetchCollections()
  // const collectionPages = collections.map((collection) => ({
  //   url: `${baseUrl}/collections/${collection.handle}`,
  //   lastModified: new Date(collection.updated_at),
  //   changeFrequency: 'weekly' as const,
  //   priority: 0.8,
  // }))

  // TODO: Add dynamic category pages
  // const categories = await fetchCategories()
  // const categoryPages = categories.map((category) => ({
  //   url: `${baseUrl}/categories/${category.handle}`,
  //   lastModified: new Date(category.updated_at),
  //   changeFrequency: 'weekly' as const,
  //   priority: 0.8,
  // }))

  return [
    ...staticPages,
    ...productPages,
    // ...collectionPages,
    // ...categoryPages,
  ]
}
