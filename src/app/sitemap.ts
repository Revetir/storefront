import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com'
  
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

  // TODO: Add dynamic product pages
  // You can fetch products from your Medusa backend here
  // const products = await fetchProducts()
  // const productPages = products.map((product) => ({
  //   url: `${baseUrl}/products/${product.handle}`,
  //   lastModified: new Date(product.updated_at),
  //   changeFrequency: 'weekly' as const,
  //   priority: 0.7,
  // }))

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
    // ...productPages,
    // ...collectionPages,
    // ...categoryPages,
  ]
}
